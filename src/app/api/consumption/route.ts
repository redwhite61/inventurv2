import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const houseId = searchParams.get('houseId')
    const year = searchParams.get('year')
    const costType = searchParams.get('costType')

    if (!year) {
      return NextResponse.json(
        { error: 'Jahr ist erforderlich' },
        { status: 400 }
      )
    }

    const yearNum = parseInt(year)
    const previousYear = yearNum - 1

    // Build where clause for current year
    const currentYearWhere: any = {
      year: yearNum
    }

    // Build where clause for previous year
    const previousYearWhere: any = {
      year: previousYear
    }

    if (houseId) {
      currentYearWhere.apartment = { houseId: houseId }
      previousYearWhere.apartment = { houseId: houseId }
    }

    if (costType) {
      currentYearWhere.costType = costType
      previousYearWhere.costType = costType
    }

    // Get meter readings for current year
    const currentYearReadings = await db.meterReading.findMany({
      where: currentYearWhere,
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
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Get meter readings for previous year (December 31st readings)
    const previousYearReadings = await db.meterReading.findMany({
      where: previousYearWhere,
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
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Group readings by apartment and cost type
    const currentReadingsByApartmentAndType = currentYearReadings.reduce((acc, reading) => {
      const key = `${reading.apartmentId}-${reading.costType}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(reading)
      return acc
    }, {} as Record<string, typeof currentYearReadings>)

    const previousReadingsByApartmentAndType = previousYearReadings.reduce((acc, reading) => {
      const key = `${reading.apartmentId}-${reading.costType}`
      if (!acc[key]) {
        acc[key] = reading // Take the most recent reading from previous year
      }
      return acc
    }, {} as Record<string, typeof previousYearReadings[0]>)

    // Calculate consumption for each apartment and cost type
    const consumptionData = []

    for (const [key, currentReadings] of Object.entries(currentReadingsByApartmentAndType)) {
      if (currentReadings.length === 0) continue

      const apartment = currentReadings[0].apartment
      const costType = currentReadings[0].costType

      // Get the most recent reading from current year
      const currentReading = currentReadings[currentReadings.length - 1]
      
      // Get the most recent reading from previous year
      const previousReading = previousReadingsByApartmentAndType[key]

      if (!previousReading) continue // Need previous year reading to calculate consumption

      const consumption = currentReading.reading - previousReading.reading

      // Only include positive consumption
      if (consumption >= 0) {
        consumptionData.push({
          apartmentId: apartment.id,
          apartmentNo: apartment.apartmentNo,
          tenantName: apartment.tenantName,
          houseName: apartment.house.name,
          costType: costType,
          currentReading: currentReading.reading,
          previousReading: previousReading.reading,
          consumption: consumption,
          currentReadingDate: currentReading.date,
          previousReadingDate: previousReading.date
        })
      }
    }

    return NextResponse.json(consumptionData)
  } catch (error) {
    console.error('Fehler bei der Verbrauchsberechnung:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Verbrauchsberechnung' },
      { status: 500 }
    )
  }
}