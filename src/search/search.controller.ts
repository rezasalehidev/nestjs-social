import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '@/auth/guards';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('posts')
  searchPosts(@Query('q') query: string) {
    return this.searchService.searchPosts(query);
  }

  @Get('users')
  searchUsers(@Query('q') query: string) {
    return this.searchService.searchUsers(query);
  }

  @Get()
  searchAll(@Query('q') query: string) {
    return this.searchService.searchAll(query);
  }
}
