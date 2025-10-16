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
} from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { JwtAuthGuard } from '@/auth/guards';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getUserWithCounts(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async follow(
    @Param('id', ParseIntPipe) followingId: number,
    @Req() req: Request & { user: User },
  ) {
    await this.usersService.follow(req.user.id, followingId);
    return { message: 'Successfully followed user' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  async unfollow(
    @Param('id', ParseIntPipe) followingId: number,
    @Req() req: Request & { user: User },
  ) {
    await this.usersService.unfollow(req.user.id, followingId);
    return { message: 'Successfully unfollowed user' };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/following')
  async isFollowing(
    @Param('id', ParseIntPipe) followingId: number,
    @Req() req: Request & { user: User },
  ) {
    const isFollowing = await this.usersService.isFollowing(
      req.user.id,
      followingId,
    );
    return { isFollowing };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request & { user: User }) {
    return await this.usersService.getUserWithCounts(req.user.id);
  }
}
