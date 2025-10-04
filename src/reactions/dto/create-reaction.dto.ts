import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { IsExactlyOneOf } from './exactly-one-of.validator';

export enum ReactionType {
  LIKE = 'like',
}

export class CreateReactionDto {
  @IsEnum(ReactionType)
  @IsOptional()
  type?: ReactionType = ReactionType.LIKE;

  @IsInt()
  @IsOptional()
  @IsExactlyOneOf(['postId', 'commentId'], {
    message: 'Either postId or commentId must be provided, but not both',
  })
  postId?: number;

  @IsInt()
  @IsOptional()
  commentId?: number;
}
