import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationPayload } from './notification.types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationsGateway');
  private connectedUsers: Map<number, Socket> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(parseInt(userId), client);
      this.logger.log(`User ${userId} connected to notifications`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.delete(parseInt(userId));
      this.logger.log(`User ${userId} disconnected from notifications`);
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(data.userId, client);
    client.emit('joined', { message: 'Successfully joined notifications' });
  }

  @SubscribeMessage('leave')
  handleLeave(@MessageBody() data: { userId: number }) {
    this.connectedUsers.delete(data.userId);
  }

  // Method to emit notifications to specific users
  emitNotification(userId: number, notification: NotificationPayload) {
    const client = this.connectedUsers.get(userId);
    if (client) {
      client.emit('notification', notification);
    }
  }

  // Method to emit to all connected users (for activity feeds)
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Method to emit activity feed updates
  emitActivityFeedUpdate(activityData: any) {
    this.server.emit('activity_feed', activityData);
  }
}
