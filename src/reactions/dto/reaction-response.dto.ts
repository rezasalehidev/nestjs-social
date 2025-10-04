import { ReactionType } from './create-reaction.dto';

export class ReactionResponseDto {
  id: number;
  type: ReactionType;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  postId?: number;
  commentId?: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
}
