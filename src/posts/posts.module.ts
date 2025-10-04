import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ReactionsModule } from '../reactions/reactions.module';

@Module({
  imports: [ReactionsModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
