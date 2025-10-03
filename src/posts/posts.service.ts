import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
// import { Post } from '@prisma/client';

// Define Post type locally
interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Post {
  id: number;
  title: string;
  desc: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user: User;
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    return await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        desc: createPostDto.desc,
        active: createPostDto.active ?? true,
        userId,
      },
    });
  }

  async findAll(): Promise<Post[]> {
    return await this.prisma.post.findMany({
      include: { user: true },
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    try {
      return await this.prisma.post.update({
        where: { id },
        data: updatePostDto,
        include: { user: true },
      });
    } catch {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async remove(id: number): Promise<Post> {
    try {
      return await this.prisma.post.delete({
        where: { id },
        include: { user: true },
      });
    } catch {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }
}
