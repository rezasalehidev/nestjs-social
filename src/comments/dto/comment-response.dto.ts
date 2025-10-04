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

export class CommentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'This is a comment' })
  content: string;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt?: Date;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 1 })
  postId: number;

  @ApiPropertyOptional({ example: 2 })
  parentId?: number;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiPropertyOptional({ type: CommentResponseDto, isArray: true })
  replies?: CommentResponseDto[];

  @ApiPropertyOptional({ type: CommentResponseDto })
  parent?: CommentResponseDto;

  @ApiProperty({
    example: 5,
    description: 'Number of reactions/likes on this comment',
  })
  reactionCount: number;
}
