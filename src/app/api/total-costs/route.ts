import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const totalCosts = await db.totalCost.findMany({
      orderBy: [
        { year: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(totalCosts)
  } catch (error) {
    console.error('Fehler beim Laden der Gesamtkosten:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Gesamtkosten' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { costType, amount, year } = body

    if (!costType || !amount || !year) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    // Check if total cost for this cost type and year already exists
    const existingCost = await db.totalCost.findFirst({
      where: {
        costType,
        year: parseInt(year)
      }
    })

    if (existingCost) {
      return NextResponse.json(
        { error: 'Für diese Kostenart und dieses Jahr existiert bereits ein Eintrag' },
        { status: 400 }
      )
    }

    const totalCost = await db.totalCost.create({
      data: {
        costType,
        amount: parseFloat(amount),
        year: parseInt(year)
      }
    })

    return NextResponse.json(totalCost, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Speichern der Gesamtkosten:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Gesamtkosten' },
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

    await db.totalCost.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen der Gesamtkosten:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Gesamtkosten' },
      { status: 500 }
    )
  }
}