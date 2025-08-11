import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const advancePayments = await db.advancePayment.findMany({
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
      orderBy: [
        { year: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(advancePayments)
  } catch (error) {
    console.error('Fehler beim Laden der Vorauszahlungen:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Vorauszahlungen' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apartmentId, amount, year } = body

    if (!apartmentId || !amount || !year) {
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

    // Check if advance payment for this apartment and year already exists
    const existingPayment = await db.advancePayment.findFirst({
      where: {
        apartmentId,
        year: parseInt(year)
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Für diese Wohneinheit und dieses Jahr existiert bereits eine Vorauszahlung' },
        { status: 400 }
      )
    }

    const advancePayment = await db.advancePayment.create({
      data: {
        apartmentId,
        amount: parseFloat(amount),
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

    return NextResponse.json(advancePayment, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Speichern der Vorauszahlung:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Vorauszahlung' },
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

    await db.advancePayment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen der Vorauszahlung:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Vorauszahlung' },
      { status: 500 }
    )
  }
}