/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ReactionsService } from '../reactions/reactions.service';
import {
  LikeCommentDecorators,
  UnlikeCommentDecorators,
  GetCommentReactionCountDecorators,
} from '../reactions/reactions-swagger.decorators';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Create a new comment or reply. If parentId is provided in the request body, it creates a reply to the parent comment; otherwise, creates a new top-level comment.',
  })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  findAll(@Query('postId') postId?: string) {
    const postIdNum = postId ? parseInt(postId) : undefined;
    return this.commentsService.findAll(postIdNum);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get comments for a specific post' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(parseInt(postId));
  }

  @Get('post/:postId/count')
  @ApiOperation({ summary: 'Get comment count for a specific post' })
  @ApiResponse({
    status: 200,
    description: 'Comment count retrieved successfully',
  })
  getCommentCount(@Param('postId') postId: string) {
    return this.commentsService.getCommentCount(parseInt(postId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiResponse({ status: 200, description: 'Comment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(parseInt(id));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.update(
      parseInt(id),
      updateCommentDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.commentsService.remove(parseInt(id), req.user.id);
  }

  // Reaction endpoints
  @Post(':id/reactions')
  @LikeCommentDecorators()
  async likeComment(
    @Param('id') commentId: string,
    @Body() createReactionDto: { type?: string },
    @Request() req,
  ) {
    return await this.reactionsService.create(
      {
        type: (createReactionDto.type as any) || 'like',
        commentId: parseInt(commentId),
      },
      req.user.id,
    );
  }

  @Delete(':id/reactions')
  @UnlikeCommentDecorators()
  async unlikeComment(@Param('id') commentId: string, @Request() req) {
    await this.reactionsService.remove(
      req.user.id,
      undefined,
      parseInt(commentId),
    );
    return { message: 'Reaction removed successfully' };
  }

  @Get(':id/reactions')
  async getCommentReactions(@Param('id') commentId: string) {
    return this.reactionsService.findByComment(parseInt(commentId));
  }

  @Get(':id/reactions/count')
  @GetCommentReactionCountDecorators()
  async getCommentReactionsCount(@Param('id') commentId: string) {
    const count = await this.reactionsService.getReactionCount(
      undefined,
      parseInt(commentId),
    );
    return { count };
  }
}
