import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReactionsService } from '@/reactions/reactions.service';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private reactionsService: ReactionsService,
  ) {}

  async searchPosts(query: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { desc: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { user: true },
    });

    // Add reaction counts to each post
    const postsWithReactions = await Promise.all(
      posts.map(async (post) => {
        const reactionCount = await this.reactionsService.getReactionCount(
          post.id,
        );
        return {
          ...post,
          reactionCount,
        };
      }),
    );

    return postsWithReactions;
  }

  async searchUsers(query: string) {
    return await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }

  async searchAll(query: string) {
    const [posts, users] = await Promise.all([
      this.searchPosts(query),
      this.searchUsers(query),
    ]);

    return {
      posts,
      users,
    };
  }
}
