import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Content of the comment' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Post ID to comment on' })
  @IsNumber()
  @IsNotEmpty()
  postId: number;

  @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
  @IsNumber()
  @IsOptional()
  parentId?: number;
}
