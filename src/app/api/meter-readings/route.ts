import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const meterReadings = await db.meterReading.findMany({
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
      },
      take: 100 // Limit to last 100 readings
    })

    return NextResponse.json(meterReadings)
  } catch (error) {
    console.error('Fehler beim Laden der Zählerstände:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Zählerstände' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apartmentId, costType, reading, date, year } = body

    if (!apartmentId || !costType || !reading || !date || !year) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    // Check if apartment exists
    const apartment = await db.apartment.findUnique({
      where: { id: apartmentId }
    })

    if (!apartment) {
      return NextResponse.json(
        { error: 'Wohneinheit nicht gefunden' },
        { status: 404 }
      )
    }

    const meterReading = await db.meterReading.create({
      data: {
        apartmentId,
        costType,
        reading: parseFloat(reading),
        date: new Date(date),
        year: parseInt(year)
      },
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

    return NextResponse.json(meterReading, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Speichern des Zählerstands:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Zählerstands' },
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
    const { apartmentId, costType, reading, date, year } = body

    if (!apartmentId || !costType || !reading || !date || !year) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    // Check if apartment exists
    const apartment = await db.apartment.findUnique({
      where: { id: apartmentId }
    })

    if (!apartment) {
      return NextResponse.json(
        { error: 'Wohneinheit nicht gefunden' },
        { status: 404 }
      )
    }

    const meterReading = await db.meterReading.update({
      where: { id },
      data: {
        apartmentId,
        costType,
        reading: parseFloat(reading),
        date: new Date(date),
        year: parseInt(year)
      },
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

    return NextResponse.json(meterReading)
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Zählerstands:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Zählerstands' },
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

    await db.meterReading.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen des Zählerstands:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Zählerstands' },
      { status: 500 }
    )
  }
}