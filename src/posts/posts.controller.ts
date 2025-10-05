import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from '@/posts/posts.service';
import { CreatePostDto } from '@/posts/dto/create-post.dto';
import { UpdatePostDto } from '@/posts/dto/update-post.dto';
import { JwtAuthGuard } from '@/auth/guards';
import { User } from '@prisma/client';
import { ReactionsService } from '@/reactions/reactions.service';
import {
  PostsControllerDecorators,
  CreatePostDecorators,
  FindAllPostsDecorators,
  FindOnePostDecorators,
  UpdatePostDecorators,
  DeletePostDecorators,
} from '@/posts/posts-swagger.decorators';
import {
  LikePostDecorators,
  UnlikePostDecorators,
  GetPostReactionCountDecorators,
} from '@/reactions/reactions-swagger.decorators';
@Controller('posts')
@UseGuards(JwtAuthGuard)
@PostsControllerDecorators()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly reactionsService: ReactionsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @CreatePostDecorators()
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() image: Express.Multer.File,
    @Req()
    req: Request & {
      user: User;
    },
  ) {
    return this.postsService.create(createPostDto, req.user.id, image);
  }

  @Get()
  @FindAllPostsDecorators()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('feed')
  async getFeed(@Req() req: Request & { user: User }) {
    return this.postsService.getFeed(req.user.id);
  }

  @Get(':id')
  @FindOnePostDecorators()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UpdatePostDecorators()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @DeletePostDecorators()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }

  // Reaction endpoints
  @Post(':id/reactions')
  @LikePostDecorators()
  async likePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body() createReactionDto: { type?: string },
    @Req() req: Request & { user: User },
  ) {
    return await this.reactionsService.create(
      {
        type: (createReactionDto.type as any) || 'like',
        postId,
      },
      req.user.id,
    );
  }

  @Delete(':id/reactions')
  @UnlikePostDecorators()
  async unlikePost(
    @Param('id', ParseIntPipe) postId: number,
    @Req() req: Request & { user: User },
  ) {
    await this.reactionsService.remove(req.user.id, postId);
    return { message: 'Reaction removed successfully' };
  }

  @Get(':id/reactions')
  async getPostReactions(@Param('id', ParseIntPipe) postId: number) {
    return await this.reactionsService.findByPost(postId);
  }

  @Get(':id/reactions/count')
  @GetPostReactionCountDecorators()
  async getPostReactionsCount(@Param('id', ParseIntPipe) postId: number) {
    const count = await this.reactionsService.getReactionCount(postId);
    return { count };
  }
}
