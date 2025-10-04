import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CacheModule } from '../cache/cache.module';
import { ReactionsModule } from '../reactions/reactions.module';

@Module({
  imports: [CacheModule, ReactionsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
