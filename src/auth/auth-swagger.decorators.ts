import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

export function AuthControllerDecorators() {
  return applyDecorators(ApiTags('auth'), ApiExtraModels(AuthResponseDto));
}

export function LoginDecorators() {
  return applyDecorators(
    ApiOperation({ summary: 'Login user' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 201,
      description: 'Login successful',
      type: AuthResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
  );
}

export function SignupDecorators() {
  return applyDecorators(
    ApiOperation({ summary: 'Register new user' }),
    ApiBody({ type: CreateUserDto }),
    ApiResponse({
      status: 201,
      description: 'User registered and logged in',
      type: AuthResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request',
    }),
  );
}
