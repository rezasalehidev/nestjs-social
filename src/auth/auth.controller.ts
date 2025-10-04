import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards';
import {
  AuthControllerDecorators,
  LoginDecorators,
  SignupDecorators,
} from './auth-swagger.decorators';

@Controller('auth')
@AuthControllerDecorators()
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @LoginDecorators()
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  @SignupDecorators()
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { ...userWithoutPassword } = user;
    return this.authService.login(userWithoutPassword);
  }
}
