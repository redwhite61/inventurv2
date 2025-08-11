const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a test house
  const house = await prisma.house.create({
    data: {
      name: 'Musterhaus',
      address: 'Beispielstraße 42, 10115 Berlin',
      description: 'Testgebäude für Verbrauchsberechnung'
    }
  })

  console.log('Created house:', house)

  // Create test apartments
  const apartment1 = await prisma.apartment.create({
    data: {
      apartmentNo: '101',
      tenantName: 'Max Mustermann',
      livingArea: 75.5,
      houseId: house.id
    }
  })

  const apartment2 = await prisma.apartment.create({
    data: {
      apartmentNo: '102',
      tenantName: 'Erika Musterfrau',
      livingArea: 82.0,
      houseId: house.id
    }
  })

  console.log('Created apartments:', { apartment1, apartment2 })

  // Create previous year meter readings (2023)
  const previousYearReadings = [
    {
      apartmentId: apartment1.id,
      costType: 'COLD_WATER',
      reading: 100.50,
      year: 2023,
      date: new Date('2023-12-31')
    },
    {
      apartmentId: apartment1.id,
      costType: 'HEATING',
      reading: 1500.25,
      year: 2023,
      date: new Date('2023-12-31')
    },
    {
      apartmentId: apartment2.id,
      costType: 'COLD_WATER',
      reading: 95.30,
      year: 2023,
      date: new Date('2023-12-31')
    },
    {
      apartmentId: apartment2.id,
      costType: 'HEATING',
      reading: 1420.80,
      year: 2023,
      date: new Date('2023-12-31')
    }
  ]

  for (const reading of previousYearReadings) {
    await prisma.meterReading.create({
      data: reading
    })
  }

  console.log('Created previous year readings')

  // Create current year meter readings (2024)
  const currentYearReadings = [
    {
      apartmentId: apartment1.id,
      costType: 'COLD_WATER',
      reading: 125.75,
      year: 2024,
      date: new Date('2024-12-31')
    },
    {
      apartmentId: apartment1.id,
      costType: 'HEATING',
      reading: 1680.50,
      year: 2024,
      date: new Date('2024-12-31')
    },
    {
      apartmentId: apartment2.id,
      costType: 'COLD_WATER',
      reading: 118.20,
      year: 2024,
      date: new Date('2024-12-31')
    },
    {
      apartmentId: apartment2.id,
      costType: 'HEATING',
      reading: 1595.30,
      year: 2024,
      date: new Date('2024-12-31')
    }
  ]

  for (const reading of currentYearReadings) {
    await prisma.meterReading.create({
      data: reading
    })
  }

  console.log('Created current year readings')

  // Create some total costs
  const totalCosts = [
    {
      costType: 'COLD_WATER',
      amount: 850.00,
      year: 2024
    },
    {
      costType: 'HEATING',
      amount: 3200.00,
      year: 2024
    }
  ]

  for (const cost of totalCosts) {
    await prisma.totalCost.create({
      data: cost
    })
  }

  console.log('Created total costs')

  // Create advance payments
  const advancePayments = [
    {
      apartmentId: apartment1.id,
      amount: 150.00,
      year: 2024
    },
    {
      apartmentId: apartment2.id,
      amount: 165.00,
      year: 2024
    }
  ]

  for (const payment of advancePayments) {
    await prisma.advancePayment.create({
      data: payment
    })
  }

  console.log('Created advance payments')
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })