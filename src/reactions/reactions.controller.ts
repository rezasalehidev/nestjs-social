import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { JwtAuthGuard } from '../auth/guards';
import { User } from '@prisma/client';
import {
  ReactionsControllerDecorators,
  CreateReactionDecorators,
  RemoveReactionDecorators,
  GetPostReactionsDecorators,
  GetCommentReactionsDecorators,
  GetReactionCountDecorators,
  CheckUserReactionDecorators,
} from './reactions-swagger.decorators';

@Controller('reactions')
@UseGuards(JwtAuthGuard)
@ReactionsControllerDecorators()
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @CreateReactionDecorators()
  async create(
    @Body() createReactionDto: CreateReactionDto,
    @Req() req: Request & { user: User },
  ) {
    return await this.reactionsService.create(createReactionDto, req.user.id);
  }

  @Delete()
  @RemoveReactionDecorators()
  async remove(
    @Req() req: Request & { user: User },
    @Query('postId', ParseIntPipe) postId?: number,
    @Query('commentId', ParseIntPipe) commentId?: number,
  ) {
    await this.reactionsService.remove(req.user.id, postId, commentId);
    return { message: 'Reaction removed successfully' };
  }

  @Get('posts/:postId')
  @GetPostReactionsDecorators()
  async findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.reactionsService.findByPost(postId);
  }

  @Get('comments/:commentId')
  @GetCommentReactionsDecorators()
  async findByComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.reactionsService.findByComment(commentId);
  }

  @Get('count')
  @GetReactionCountDecorators()
  async getReactionCount(
    @Query('postId', ParseIntPipe) postId?: number,
    @Query('commentId', ParseIntPipe) commentId?: number,
  ) {
    const count = await this.reactionsService.getReactionCount(
      postId,
      commentId,
    );
    return { count };
  }

  @Get('check')
  @CheckUserReactionDecorators()
  async hasUserReacted(
    @Req() req: Request & { user: User },
    @Query('postId', ParseIntPipe) postId?: number,
    @Query('commentId', ParseIntPipe) commentId?: number,
  ) {
    const hasReacted = await this.reactionsService.hasUserReacted(
      req.user.id,
      postId,
      commentId,
    );
    return { hasReacted };
  }
}
