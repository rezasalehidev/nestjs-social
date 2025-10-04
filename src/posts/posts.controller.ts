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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards';
import { User } from '@prisma/client';
import {
  PostsControllerDecorators,
  CreatePostDecorators,
  FindAllPostsDecorators,
  FindOnePostDecorators,
  UpdatePostDecorators,
  DeletePostDecorators,
} from './posts-swagger.decorators';

@Controller('posts')
@UseGuards(JwtAuthGuard)
@PostsControllerDecorators()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
}
