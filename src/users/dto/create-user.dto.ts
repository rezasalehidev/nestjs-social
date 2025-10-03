import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  password: string;
}
