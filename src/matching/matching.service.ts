import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetPerfectMatchDto } from './dto/get.dto';

@Injectable()
export class MatchingService {
    constructor(private readonly prisma: PrismaService) {}

    async findPerfectMatches(passengerId: string, coord: GetPerfectMatchDto) {
        const { lat, lng } = coord

        // 1. Recherche du passager
        const passenger = await this.prisma.user.findUnique({ where: { id: passengerId } });

        if (!passenger || !passenger.flightTime || !passenger.checkInMinutes) {
            throw new NotFoundException('Travel informations missing for this passenger.');
        }

        // 1. Calcul du Buffer : L'heure MAXIMALE à laquelle le passager doit arriver à l'aéroport
        // (Heure du vol - Temps de check-in requis)
        const arrivalDeadline = new Date(passenger.flightTime.getTime() - passenger.checkInMinutes * 60000);

        // 2. La requête hybride : PostGIS + Conditions temporelles
        // On cherche des trajets qui :
        // - Ont des places libres
        // - Sont à moins de 5km du passager
        // - Déposent le passager AVANT sa deadline (en comptant un temps de trajet estimé)
        // ST_MakePoint prend (Longitude, Latitude)
        // ST_DistanceSphere calcule la distance en mètres.
        const matches = await this.prisma.$queryRaw`
            SELECT id, "driverId", "departureTime", "availableSeats",
                ST_DistanceSphere(
                    ST_MakePoint("startLng", "startLat"),
                    ST_MakePoint(${lng}, ${lat})
                ) as "distanceInMeters"
            FROM "Ride"
            WHERE "availableSeats" > 0
                AND ST_DistanceSphere(
                    ST_MakePoint("startLng", "startLat"),
                    ST_MakePoint(${lng}, ${lat})
                ) <= 5000 -- Rayon de recherche : 5km max autour du passager
                -- Logique de sécurité : le départ + 45min (trajet estimé) doit être < deadline
                AND ("departureTime" + interval '45 minutes') <= ${arrivalDeadline}::timestamp
            ORDER BY "distanceInMeters" ASC;
        `;

        return matches;
    }
}