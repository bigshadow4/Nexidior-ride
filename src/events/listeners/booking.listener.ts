import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import Redis from 'ioredis';
import { MatchingService } from 'src/matching/matching.service';
import { NotificationGateway } from 'src/notifications/notification.gateway';

@Injectable()
export class BookingListener {
  private readonly logger = new Logger(BookingListener.name);
  private redis = new Redis();

  constructor(
    private readonly matchingService: MatchingService,
    private readonly notificationGateway: NotificationGateway
  ) {}

  @OnEvent('booking.confirmed', { async: true })
  async handleBookingConfirmed(payload: any) {
    this.logger.log(`Asynchronous processing for booking ${payload.bookingId}`);

    try {
      // 1. Mise à jour du Dashboard Conducteur en temps réel (Redis/WebSocket)
      await this.redis.publish('ride_updates', JSON.stringify({
        rideId: payload.rideId,
        type: 'STOCK_UPDATE',
        availableSeats: payload.remainingSeats
      }));
      
      this.logger.log(`ride status sent via WebSocket in <200ms`);

      // 2. Génération du ticket (Simulation)
      await this.generateTicket(payload.bookingId);

      // 3. Envoi de la notification Push/Email (Simulation)
      await this.sendNotification(payload.passengerId);

    } catch (error) {
      this.logger.error(`Error during asynchronous processing: ${error.message}`);
    }
  }

  @OnEvent('booking.cancelled_delay', { async: true })
  async handleRematch(payload: { passengerId: string, failedRideId: string, reason: string }) {
    this.logger.log(`Auto-Rematch triggered for the passenger ${payload.passengerId}`);

    try {
      // 1. On prévient le passager que son trajet est annulé
      this.notificationGateway.sendToUser(payload.passengerId, 'ride_cancelled', { 
        reason: payload.reason, 
        failedRideId: payload.failedRideId 
      });

      // 2. On lance le matching en backend (coordonnées par défaut de l'utilisateur ou du précédent trajet)
      // Pour l'exemple, on passe des coordonnées fixes, mais en prod on utiliserait la dernière position connue
      const newOptions: any = await this.matchingService.findPerfectMatches(payload.passengerId, { lat: 4.0511, lng: 9.7679 });

      // 3. On pousse les nouveaux résultats en temps réel sur l'UI du passager
      if (newOptions.length > 0) {
        this.notificationGateway.sendToUser(payload.passengerId, 'rematch_results', {
          message: 'We\'ve found some new rides that match your flight!',
          rides: newOptions
        });
      } else {
        this.notificationGateway.sendToUser(payload.passengerId, 'rematch_failed', {
          message: 'No ride are currently available within the specified time frame.'
        });
      }
    } catch (error) {
      this.logger.error(`Rematch error : ${error.message}`);
    }
  }

  private async generateTicket(bookingId: string) {
    // Logique de génération PDF ou QR Code...
    return new Promise(resolve => setTimeout(resolve, 500)); 
  }

  private async sendNotification(passengerId: string) {
    // Logique d'appel API SendGrid ou Firebase...
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}