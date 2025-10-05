import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReactionDto, ReactionType } from './dto/create-reaction.dto';
import { ReactionResponseDto } from './dto/reaction-response.dto';
import { PrismaClient } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { NotificationsService } from '../notifications/notifications.service';

const prisma = new PrismaClient();

@Injectable()
export class ReactionsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    createReactionDto: CreateReactionDto,
    userId: number,
  ): Promise<ReactionResponseDto | { message: string }> {
    // Validate that either postId or commentId is provided, but not both
    if (
      (!createReactionDto.postId && !createReactionDto.commentId) ||
      (createReactionDto.postId && createReactionDto.commentId)
    ) {
      throw new BadRequestException(
        'Either postId or commentId must be provided, but not both',
      );
    }

    // Check if user already reacted to this post/comment
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        userId,
        postId: createReactionDto.postId,
        commentId: createReactionDto.commentId,
      },
    });

    if (existingReaction) {
      // User has already reacted, so remove the reaction (toggle off)
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });

      // Invalidate cache for reaction counts
      await this.invalidateReactionCountCache(
        createReactionDto.postId,
        createReactionDto.commentId,
      );

      return { message: 'Reaction removed successfully' };
    }

    // User hasn't reacted yet, so create a new reaction (toggle on)
    const reaction = await prisma.reaction.create({
      data: {
        type: createReactionDto.type || ReactionType.LIKE,
        userId,
        postId: createReactionDto.postId,
        commentId: createReactionDto.commentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Emit notification for new like
    if (createReactionDto.postId) {
      await this.notificationsService.notifyLike(
        createReactionDto.postId,
        userId,
      );
    }

    // Invalidate cache for reaction counts
    await this.invalidateReactionCountCache(
      createReactionDto.postId,
      createReactionDto.commentId,
    );

    return this.mapToResponseDto(reaction);
  }

  async remove(
    userId: number,
    postId?: number,
    commentId?: number,
  ): Promise<void> {
    if ((!postId && !commentId) || (postId && commentId)) {
      throw new BadRequestException(
        'Either postId or commentId must be provided, but not both',
      );
    }

    const reaction = await prisma.reaction.findFirst({
      where: {
        userId,
        postId,
        commentId,
      },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await prisma.reaction.delete({
      where: { id: reaction.id },
    });

    // Invalidate cache for reaction counts
    await this.invalidateReactionCountCache(postId, commentId);
  }

  async findByPost(postId: number): Promise<ReactionResponseDto[]> {
    const reactions = await prisma.reaction.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reactions.map((reaction) => this.mapToResponseDto(reaction));
  }

  async findByComment(commentId: number): Promise<ReactionResponseDto[]> {
    const reactions = await prisma.reaction.findMany({
      where: { commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reactions.map((reaction) => this.mapToResponseDto(reaction));
  }

  async getReactionCount(postId?: number, commentId?: number): Promise<number> {
    if ((!postId && !commentId) || (postId && commentId)) {
      throw new BadRequestException(
        'Either postId or commentId must be provided, but not both',
      );
    }

    const cacheKey = postId
      ? `post:${postId}:reactions:count`
      : `comment:${commentId}:reactions:count`;

    // Try to get from cache first
    const cachedCount = await this.cacheManager.get<number>(cacheKey);
    if (cachedCount !== undefined) {
      return cachedCount;
    }

    // Get from database
    const count = await prisma.reaction.count({
      where: postId ? { postId } : { commentId },
    });

    // Cache the result
    await this.cacheManager.set(cacheKey, count, 300000); // 5 minutes TTL

    return count;
  }

  async hasUserReacted(
    userId: number,
    postId?: number,
    commentId?: number,
  ): Promise<boolean> {
    if ((!postId && !commentId) || (postId && commentId)) {
      throw new BadRequestException(
        'Either postId or commentId must be provided, but not both',
      );
    }

    const reaction = await prisma.reaction.findFirst({
      where: {
        userId,
        postId,
        commentId,
      },
    });

    return !!reaction;
  }

  private async invalidateReactionCountCache(
    postId?: number,
    commentId?: number,
  ): Promise<void> {
    if (postId) {
      await this.cacheManager.del(`post:${postId}:reactions:count`);
    } else if (commentId) {
      await this.cacheManager.del(`comment:${commentId}:reactions:count`);
    }
  }

  private mapToResponseDto(reaction: any): ReactionResponseDto {
    return {
      id: reaction.id,
      type: reaction.type as ReactionType,
      createdAt: reaction.createdAt,
      updatedAt: reaction.updatedAt,
      userId: reaction.userId,
      postId: reaction.postId,
      commentId: reaction.commentId,
      user: reaction.user,
    };
  }
}
