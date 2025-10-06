import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { JwtAuthGuard } from '@/auth/guards';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: any,
  ): Promise<MessageResponseDto> {
    return await this.messagesService.sendMessage(
      createMessageDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({ status: 200, type: [ConversationResponseDto] })
  async getConversations(@Req() req: any): Promise<ConversationResponseDto[]> {
    return await this.messagesService.getUserConversations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:conversationId')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiResponse({ status: 200, type: [MessageResponseDto] })
  async getConversationMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Req() req: any,
  ): Promise<MessageResponseDto[]> {
    return await this.messagesService.getConversationMessages(
      conversationId,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('conversations/:conversationId/read')
  @ApiOperation({ summary: 'Mark messages in conversation as read' })
  @ApiResponse({ status: 200 })
  async markAsRead(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Req() req: any,
  ): Promise<void> {
    return await this.messagesService.markMessagesAsRead(
      conversationId,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread messages count' })
  @ApiResponse({ status: 200, type: Number })
  async getUnreadCount(@Req() req: any): Promise<{ count: number }> {
    const count = await this.messagesService.getUnreadCount(req.user.id);
    return { count };
  }
}
