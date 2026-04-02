import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  // On stocke les sockets actives : Map<userId, socketId>
  private activeConnections = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.activeConnections.set(userId, client.id);
      console.log(`Connected user : ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    // Nettoyage à la déconnexion
    for (const [userId, socketId] of this.activeConnections.entries()) {
      if (socketId === client.id) {
        this.activeConnections.delete(userId);
        break;
      }
    }
  }

  // // Méthode pour envoyer une alerte à un passager spécifique
  // sendMatchAlert(passengerId: string, message: string, data: any) {
  //   const socketId = this.activeConnections.get(passengerId);
  //   if (socketId) {
  //     this.server.to(socketId).emit('new_match_alert', { message, ...data });
  //   }
  // }

  // Méthode générique pour pousser n'importe quel événement à un utilisateur
  sendToUser(userId: string, eventName: string, data: any) {
    const socketId = this.activeConnections.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(eventName, data);
    }
  }
}