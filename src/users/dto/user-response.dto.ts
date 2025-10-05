import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt?: Date;

  @ApiProperty({ example: 42 })
  followerCount: number;

  @ApiProperty({ example: 35 })
  followingCount: number;
}
