import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Title of the post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description of the post' })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiPropertyOptional({ description: 'Image URL or path' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ description: 'Active status', example: 'true' })
  @IsString()
  @IsOptional()
  active?: string;
}
