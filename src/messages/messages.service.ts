import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Conversation } from '@prisma/client';
import { MessagesGateway } from './messages.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private messagesGateway: MessagesGateway,
  ) {}

  async createConversation(
    userId1: number,
    userId2: number,
  ): Promise<Conversation> {
    // Ensure users exist
    await this.prisma.user.findUniqueOrThrow({ where: { id: userId1 } });
    await this.prisma.user.findUniqueOrThrow({ where: { id: userId2 } });

    // Check if conversation already exists
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId1, user2Id: userId2 },
          { user1Id: userId2, user2Id: userId1 },
        ],
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    return await this.prisma.conversation.create({
      data: {
        user1Id: userId1,
        user2Id: userId2,
      },
    });
  }

  async sendMessage(
    createMessageDto: CreateMessageDto,
    senderId: number,
  ): Promise<{
    id: number;
    content: string;
    conversationId: number;
    senderId: number;
    sender: {
      id: number;
      name: string;
      email: string;
    };
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    // Find or create conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: createMessageDto.recipientId },
          { user1Id: createMessageDto.recipientId, user2Id: senderId },
        ],
      },
    });

    if (!conversation) {
      conversation = await this.createConversation(
        senderId,
        createMessageDto.recipientId,
      );
    }

    const message = await this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        conversationId: conversation.id,
        senderId,
      },
      include: {
        sender: true,
        conversation: {
          include: {
            user1: true,
            user2: true,
          },
        },
      },
    });

    // Emit real-time message via WebSocket
    this.messagesGateway.sendMessage(message);

    // Return formatted response
    return {
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
    };
  }

  async getUserConversations(userId: number): Promise<
    {
      id: number;
      user1Id: number;
      user2Id: number;
      user1: { id: number; name: string; email: string };
      user2: { id: number; name: string; email: string };
      messages: {
        id: number;
        content: string;
        senderId: number;
        sender: { id: number; name: string; email: string };
        createdAt: Date;
      }[];
      createdAt: Date;
      updatedAt: Date;
    }[]
  > {
    return await this.prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get latest message for preview
        },
        user1: true,
        user2: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getConversationMessages(
    conversationId: number,
    userId: number,
  ): Promise<
    {
      id: number;
      content: string;
      conversationId: number;
      senderId: number;
      sender: { id: number; name: string; email: string };
      isRead: boolean;
      readAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }[]
  > {
    // Verify user is part of the conversation
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages.map((message) => ({
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
    }));
  }

  async markMessagesAsRead(
    conversationId: number,
    userId: number,
  ): Promise<void> {
    // Verify user is part of the conversation
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    const result = await this.prisma.message.count({
      where: {
        conversation: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        senderId: { not: userId },
        isRead: false,
      },
    });

    return result;
  }
}
