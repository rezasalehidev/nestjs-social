import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { ReactionsModule } from '@/reactions/reactions.module';

@Module({
  imports: [PrismaModule, ReactionsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
