import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Client should emit 'join' with their userId to join their room
    client.on('join', (userId: string) => {
      if (!userId) return;
      const room = this.userRoom(userId);
      client.join(room);
      this.logger.log(`Client ${client.id} joined room ${room}`);
    });

    client.on('leave', (userId: string) => {
      if (!userId) return;
      const room = this.userRoom(userId);
      client.leave(room);
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  userRoom(userId: string) {
    return `user:${userId}`;
  }
}
