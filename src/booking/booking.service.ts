import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create.dto';
import { HandleDelayDto } from './dto/handleDelay.dto';

@Injectable()
export class BookingService {
    constructor(
        private readonly prisma: PrismaService,
        private eventEmitter: EventEmitter2
    ) {}

    // LA RÉSERVATION (Le fameux Stress Test)
    async createBooking(passengerId: string, body: CreateBookingDto) {
        const { rideId } = body
        // On utilise une transaction interactive Prisma
        const result = await this.prisma.$transaction(async (tx) => {
        
            // 1. LE VERROU (Pessimistic Lock) : SELECT ... FOR UPDATE
            // Cette requête bloque la ligne de ce trajet précis. Les 99 autres requêtes 
            // vont patienter ici que celle-ci se termine. Aucun overbooking possible.
            const rides = await tx.$queryRaw<any[]>`
                SELECT * FROM "Ride"
                WHERE id::text = ${rideId}
                FOR UPDATE;
            `;

            const ride = rides[0];

            if (!ride) {
                throw new NotFoundException('Ride not found.');
            }

            // 2. Vérification de la règle métier
            if (ride.availableSeats <= 0) {
                throw new ConflictException('Sorry, this ride is already full.');
            }

            // 3. Décrémentation sécurisée
            await tx.$executeRaw`
                UPDATE "Ride"
                SET "availableSeats" = "availableSeats" - 1
                WHERE id::text = ${rideId};
            `;

            // 4. Création de la réservation
            return await tx.booking.create({
                data: {
                    rideId,
                    passengerId,
                    status: 'CONFIRMED',
                },
                include: { ride: true }
            });
        });
        
        // 5. Déclenchement des actions asynchrones (Gateway, Logs, etc.)
        this.eventEmitter.emit('booking.confirmed', {
            bookingId: result.id,
            passengerId: result.passengerId,
            rideId: result.rideId,
            driverId: result.ride.driverId,
            remainingSeats: result.ride.availableSeats - 1,
        });

        return result;
    }

    // LA GESTION DES RETARDS (Le Moteur de Convergence)
    async handleDriverDelay(rideId: string, body: HandleDelayDto) {
        const { additionalMinutes } = body;
        return await this.prisma.$transaction(async (tx) => {
            // 1. On récupère le trajet, les réservations, et les infos de vol des passagers
            const ride = await tx.ride.findUnique({ 
                where: { id: rideId }, 
                include: { bookings: { include: { passenger: true } } }
            });

            if (!ride) {
                throw new NotFoundException('Ride not found.');
            }

            // 2. Calcul de la nouvelle heure de départ basée sur l'heure actuelle
            const newDepartureTime = new Date(ride.departureTime.getTime() + additionalMinutes * 60000);
            
            // 3. Mise à jour effective du trajet en BDD
            const updatedRide = await tx.ride.update({
                where: { id: rideId },
                data: { 
                    cumulativeDelay: { increment: additionalMinutes },
                    departureTime: newDepartureTime
                }
            });

            // 4. Analyse d'impact pour chaque passager
            for (const booking of ride.bookings) {
                const passenger = booking.passenger;

                // Sécurité : si le passager n'a pas renseigné son vol, on ignore
                if (!passenger.flightTime || !passenger.checkInMinutes) continue;

                // Calcul de la deadline d'arrivée à l'aéroport pour ce passager spécifique
                const arrivalDeadline = new Date(passenger.flightTime.getTime() - (passenger.checkInMinutes * 60000));
                const estimatedArrivalAtAirport = new Date(newDepartureTime.getTime() + 45 * 60000); // Trajet estimé à 45min            
                
                if (estimatedArrivalAtAirport > arrivalDeadline) {
                    await Promise.all([
                        // Annulation car le retard cumulé ne garantit plus le vol
                        tx.booking.update({
                            where: { id: booking.id },
                            data: { status: 'CANCELLED_BY_SYSTEM' }
                        }),
                        // Libération de la place
                        tx.ride.update({
                            where: { id: rideId },
                            data: { availableSeats: { increment: 1 } }
                        }),
                    ])
                    
                    // Le passager est éjecté, le Listener doit gérer le "Rematch"
                    this.eventEmitter.emit('booking.cancelled_delay', {
                        passengerId: booking.passengerId,
                        failedRideId: rideId,
                        reason: `The reported delay (${additionalMinutes} min) no longer guarantees that you will arrive in time for your flight at the terminal ${passenger.terminal}.`
                    })
                }
            }

            return { success: true, cumulativeDelay: updatedRide.cumulativeDelay };
        })
    }
}