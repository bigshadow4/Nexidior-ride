import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  console.log('--- Cleanning DB ---');
  await prisma.booking.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Creating Users ---');
  
  // 1. Un Admin
  await prisma.user.create({
    data: { email: 'admin@nexride.com', password, role: 'ADMIN', name: 'Super Admin' }
  });

  // 2. Création de 50 Conducteurs
  for (let i = 1; i <= 50; i++) {
    const driver = await prisma.user.create({
      data: {
        email: `driver${i}@test.com`,
        password,
        role: 'DRIVER',
        name: `Driver ${i}`,
      }
    });

    // Chaque conducteur crée 2 trajets autour de Douala (Coordonnées approximatives)
    for (let j = 1; j <= 2; j++) {
      await prisma.ride.create({
        data: {
          driverId: driver.id,
          startLocationName: `Taking Point ${i}-${j}`,
          startLat: 4.05 + (Math.random() * 0.02), // Zone Douala
          startLng: 9.70 + (Math.random() * 0.02),
          departureTime: new Date(Date.now() + (j * 3600000)), // Dans 1h, 2h, 3h
          initialDepartureTime: new Date(Date.now() + (j * 3600000)), // Dans 1h, 2h, 3h
          totalSeats: 4,
          availableSeats: 4,
          cumulativeDelay: 0
        }
      });
    }
  }

  // 3. Création de 100 Passagers avec des vols
  for (let k = 1; k <= 100; k++) {
    await prisma.user.create({
      data: {
        email: `passenger${k}@test.com`,
        password,
        role: 'PASSENGER',
        name: `Passenger ${k}`,
        flightTime: new Date(Date.now() + (8 * 3600000)), // Vol dans 8h
        checkInMinutes: 120, // 2h de check-in
        terminal: k % 2 === 0 ? 'Terminal A' : 'Terminal B'
      }
    });
  }

  console.log('--- Seeding successfully ended ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });