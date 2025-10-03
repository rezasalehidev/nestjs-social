import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt?: Date;
}

export class PostResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Post Title' })
  title: string;

  @ApiProperty({ example: 'Post description' })
  desc: string;

  @ApiPropertyOptional({ example: 'path/to/image.jpg' })
  image?: string;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt?: Date;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
