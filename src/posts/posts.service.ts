import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { ReactionsService } from '../reactions/reactions.service';

const prisma = new PrismaClient();

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private reactionsService: ReactionsService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    userId: number,
    image?: Express.Multer.File,
  ): Promise<Post> {
    let imagePath: string | undefined;

    if (image) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const fileName = `${Date.now()}-${image.originalname}`;
      imagePath = path.join('uploads', fileName);
      fs.writeFileSync(path.join(uploadsDir, fileName), image.buffer);
    }

    return await prisma.post.create({
      data: {
        title: createPostDto.title,
        desc: createPostDto.desc,
        image: imagePath,
        active: createPostDto.active ? createPostDto.active === 'true' : true,
        userId,
      },
    });
  }

  async findAll(): Promise<any[]> {
    const posts = await prisma.post.findMany({
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

  async findOne(id: number): Promise<any> {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const reactionCount = await this.reactionsService.getReactionCount(id);
    return {
      ...post,
      reactionCount,
    };
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const updateData: any = { ...updatePostDto };
    if (updatePostDto.active !== undefined) {
      updateData.active = updatePostDto.active === 'true';
    }

    try {
      return await prisma.post.update({
        where: { id },
        data: updateData,
        include: { user: true },
      });
    } catch {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async remove(id: number): Promise<Post> {
    try {
      return await prisma.post.delete({
        where: { id },
        include: { user: true },
      });
    } catch {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }
}
