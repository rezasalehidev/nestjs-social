/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
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
import { Message } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/messages',
})
@Injectable()
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('MessagesGateway');
  private connectedUsers: Map<number, Socket> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(parseInt(userId), client);
      this.logger.log(`User ${userId} connected to messages`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.delete(parseInt(userId));
      this.logger.log(`User ${userId} disconnected from messages`);
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(data.userId, client);
    client.emit('joined', { message: 'Successfully joined messages' });
  }

  @SubscribeMessage('leave')
  handleLeave(@MessageBody() data: { userId: number }) {
    this.connectedUsers.delete(data.userId);
  }

  // Method to send message to recipient
  sendMessage(message: Message & { sender: any; conversation: any }) {
    const { user1Id, user2Id } = message.conversation;
    const recipientId = message.senderId === user1Id ? user2Id : user1Id;

    const client = this.connectedUsers.get(recipientId);
    if (client) {
      client.emit('message', {
        id: message.id,
        content: message.content,
        conversationId: message.conversationId,
        senderId: message.senderId,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          email: message.sender.email,
        },
        isRead: message.isRead,
        readAt: message.readAt,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      });
    }
  }

  // Method to emit message read status
  emitMessageRead(conversationId: number, userId: number) {
    this.server.to(`conversation_${conversationId}`).emit('message_read', {
      conversationId,
      userId,
    });
  }

  // Method to join conversation room
  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation_${data.conversationId}`);
    client.emit('conversation_joined', { conversationId: data.conversationId });
  }

  // Method to leave conversation room
  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conversation_${data.conversationId}`);
  }
}
