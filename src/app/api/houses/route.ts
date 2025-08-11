import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const houses = await db.house.findMany({
      include: {
        apartments: {
          select: {
            id: true,
            apartmentNo: true,
            tenantName: true,
            livingArea: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(houses)
  } catch (error) {
    console.error('Fehler beim Abrufen der Häuser:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Häuser' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      )
    }

    const house = await db.house.create({
      data: {
        name,
        address,
        description
      },
      include: {
        apartments: true
      }
    })

    return NextResponse.json(house, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen des Hauses:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Hauses' },
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
    const { name, address, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      )
    }

    const house = await db.house.update({
      where: { id },
      data: {
        name,
        address,
        description
      },
      include: {
        apartments: true
      }
    })

    return NextResponse.json(house)
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Hauses:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Hauses' },
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

    // Delete associated apartments first
    await db.apartment.deleteMany({
      where: { houseId: id }
    })

    // Delete the house
    await db.house.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen des Hauses:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Hauses' },
      { status: 500 }
    )
  }
}