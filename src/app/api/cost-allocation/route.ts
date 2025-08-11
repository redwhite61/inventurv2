import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const houseId = searchParams.get('houseId')
    const year = searchParams.get('year')

    if (!year) {
      return NextResponse.json(
        { error: 'Jahr ist erforderlich' },
        { status: 400 }
      )
    }

    const yearNum = parseInt(year)

    // Get apartments with their houses
    const apartmentsWhere = houseId ? { houseId } : {}
    const apartments = await db.apartment.findMany({
      where: apartmentsWhere,
      include: {
        house: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Get total costs for the year
    const totalCosts = await db.totalCost.findMany({
      where: { year: yearNum }
    })

    // Get advance payments for the year
    const advancePayments = await db.advancePayment.findMany({
      where: { year: yearNum },
      include: {
        apartment: {
          include: {
            house: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Get consumption data for the year
    const consumptionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/consumption?year=${year}${houseId ? `&houseId=${houseId}` : ''}`)
    const consumptionData = await consumptionResponse.json()

    // Calculate total living area for percentage calculations
    const totalLivingArea = apartments.reduce((sum, apartment) => sum + apartment.livingArea, 0)

    // Group consumption by apartment and cost type
    const consumptionByApartmentAndType = consumptionData.reduce((acc, data: any) => {
      const key = `${data.apartmentId}-${data.costType}`
      if (!acc[key]) {
        acc[key] = 0
      }
      acc[key] += data.consumption
      return acc
    }, {} as Record<string, number>)

    // Calculate total consumption by cost type
    const totalConsumptionByType = consumptionData.reduce((acc, data: any) => {
      if (!acc[data.costType]) {
        acc[data.costType] = 0
      }
      acc[data.costType] += data.consumption
      return acc
    }, {} as Record<string, number>)

    // Calculate cost allocation for each apartment
    const allocationResults = apartments.map(apartment => {
      const advancePayment = advancePayments.find(p => p.apartmentId === apartment.id)?.amount || 0
      
      let totalApartmentCosts = 0
      const costBreakdown: any[] = []

      // Calculate costs for each cost type
      for (const totalCost of totalCosts) {
        let allocatedCost = 0

        if (['COLD_WATER', 'WARM_WATER', 'HEATING', 'WASHING_MACHINE'].includes(totalCost.costType)) {
          // Consumption-based allocation
          const consumptionKey = `${apartment.id}-${totalCost.costType}`
          const apartmentConsumption = consumptionByApartmentAndType[consumptionKey] || 0
          const totalConsumption = totalConsumptionByType[totalCost.costType] || 0

          if (totalConsumption > 0 && apartmentConsumption > 0) {
            allocatedCost = (apartmentConsumption / totalConsumption) * totalCost.amount
          }
        } else {
          // Area-based allocation for other cost types
          if (totalLivingArea > 0) {
            allocatedCost = (apartment.livingArea / totalLivingArea) * totalCost.amount
          }
        }

        totalApartmentCosts += allocatedCost

        // Add to cost breakdown
        const consumptionKey = `${apartment.id}-${totalCost.costType}`
        const consumption = consumptionByApartmentAndType[consumptionKey] || 0

        costBreakdown.push({
          costType: totalCost.costType,
          amount: allocatedCost,
          consumption: consumption > 0 ? consumption : undefined
        })
      }

      const balance = advancePayment - totalApartmentCosts

      return {
        apartmentId: apartment.id,
        apartmentNo: apartment.apartmentNo,
        tenantName: apartment.tenantName,
        houseName: apartment.house.name,
        livingArea: apartment.livingArea,
        totalCosts: totalApartmentCosts,
        advancePayments: advancePayment,
        balance: balance,
        costBreakdown: costBreakdown
      }
    })

    return NextResponse.json(allocationResults)
  } catch (error) {
    console.error('Fehler bei der Kostenanteilsberechnung:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Kostenanteilsberechnung' },
      { status: 500 }
    )
  }
}