import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCommentDto } from '@/comments/dto/create-comment.dto';
import { UpdateCommentDto } from '@/comments/dto/update-comment.dto';
import { Comment } from '@prisma/client';
import { ReactionsService } from '@/reactions/reactions.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reactionsService: ReactionsService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<Comment> {
    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: createCommentDto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If replying to a comment, verify parent comment exists
    if (createCommentDto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: createCommentDto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      // Ensure parent comment belongs to the same post
      if (parentComment.postId !== createCommentDto.postId) {
        throw new NotFoundException(
          'Parent comment does not belong to this post',
        );
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        postId: createCommentDto.postId,
        userId,
        parentId: createCommentDto.parentId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        parent: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    // Invalidate comment count cache for this post
    await this.cacheManager.del(
      `post_${createCommentDto.postId}_comment_count`,
    );

    return comment;
  }

  async findAll(postId?: number): Promise<any[]> {
    const where = postId ? { postId, parentId: null } : { parentId: null };

    const comments = await this.prisma.comment.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            replies: true, // Include nested replies
          },
        },
        post: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add reaction counts to comments and their replies
    return await this.addReactionCountsToComments(comments);
  }

  async findOne(id: number): Promise<any> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        parent: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        post: {
          select: { id: true, title: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Add reaction count to the comment and its replies
    const [commentWithReactions] = await this.addReactionCountsToComments([
      comment,
    ]);
    return commentWithReactions;
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    userId: number,
  ): Promise<Comment> {
    // Verify comment exists and belongs to user
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new NotFoundException('You can only update your own comments');
    }

    return await this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        parent: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async remove(id: number, userId: number): Promise<Comment> {
    // Verify comment exists and belongs to user
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { replies: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new NotFoundException('You can only delete your own comments');
    }

    // Delete the comment (cascade will handle replies)
    const deletedComment = await this.prisma.comment.delete({
      where: { id },
    });

    // Invalidate comment count cache for this post
    await this.cacheManager.del(`post_${comment.postId}_comment_count`);

    return deletedComment;
  }

  async getCommentCount(postId: number): Promise<number> {
    const cacheKey = `post_${postId}_comment_count`;

    // Try to get from cache first
    const cachedCount = await this.cacheManager.get<number>(cacheKey);
    if (cachedCount !== undefined) {
      return cachedCount;
    }

    // If not cached, get from database
    const count = await this.prisma.comment.count({
      where: { postId },
    });

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, count, 300000);

    return count;
  }

  async findByPost(postId: number): Promise<any[]> {
    const comments = await this.prisma.comment.findMany({
      where: { postId, parentId: null }, // Only top-level comments
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            replies: true, // Include nested replies
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add reaction counts to comments and their replies
    return await this.addReactionCountsToComments(comments);
  }

  private async addReactionCountsToComments(comments: any[]): Promise<any[]> {
    return await Promise.all(
      comments.map(async (comment) => {
        const reactionCount = await this.reactionsService.getReactionCount(
          undefined,
          comment.id,
        );

        // Recursively add reaction counts to replies
        const repliesWithReactions = comment.replies
          ? await this.addReactionCountsToComments(comment.replies)
          : [];

        return {
          ...comment,
          reactionCount,
          replies: repliesWithReactions,
        };
      }),
    );
  }
}
