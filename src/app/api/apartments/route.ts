import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get single apartment by ID
      const apartment = await db.apartment.findUnique({
        where: { id },
        include: {
          house: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      if (!apartment) {
        return NextResponse.json(
          { error: 'Wohneinheit nicht gefunden' },
          { status: 404 }
        )
      }

      return NextResponse.json(apartment)
    } else {
      // Get all apartments
      const apartments = await db.apartment.findMany({
        include: {
          house: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json(apartments)
    }
  } catch (error) {
    console.error('Fehler beim Laden der Wohneinheiten:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Wohneinheiten' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apartmentNo, tenantName, livingArea, houseId } = body

    if (!apartmentNo || !tenantName || !livingArea || !houseId) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    // Check if house exists
    const house = await db.house.findUnique({
      where: { id: houseId }
    })

    if (!house) {
      return NextResponse.json(
        { error: 'Haus nicht gefunden' },
        { status: 404 }
      )
    }

    const apartment = await db.apartment.create({
      data: {
        apartmentNo,
        tenantName,
        livingArea: parseFloat(livingArea),
        houseId
      },
      include: {
        house: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(apartment, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen der Wohneinheit:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Wohneinheit' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { apartmentNo, tenantName, livingArea, houseId } = body

    if (!apartmentNo || !tenantName || !livingArea || !houseId) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    // Check if house exists
    const house = await db.house.findUnique({
      where: { id: houseId }
    })

    if (!house) {
      return NextResponse.json(
        { error: 'Haus nicht gefunden' },
        { status: 404 }
      )
    }

    const apartment = await db.apartment.update({
      where: { id },
      data: {
        apartmentNo,
        tenantName,
        livingArea: parseFloat(livingArea),
        houseId
      },
      include: {
        house: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(apartment)
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Wohneinheit:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Wohneinheit' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Delete associated meter readings, advance payments, and cost allocations first
    await db.meterReading.deleteMany({
      where: { apartmentId: id }
    })

    await db.advancePayment.deleteMany({
      where: { apartmentId: id }
    })

    await db.costAllocation.deleteMany({
      where: { apartmentId: id }
    })

    // Delete the apartment
    await db.apartment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen der Wohneinheit:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Wohneinheit' },
      { status: 500 }
    )
  }
}