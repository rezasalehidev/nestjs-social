export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  UNFOLLOW = 'unfollow',
}

export interface NotificationPayload {
  type: NotificationType;
  userId: number;
  targetUserId: number;
  postId?: number;
  commentId?: number;
  message: string;
  timestamp: Date;
}
