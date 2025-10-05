import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType, NotificationPayload } from './notification.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(
    private notificationsGateway: NotificationsGateway,
    private prisma: PrismaService,
  ) {}

  async notifyLike(postId: number, likerId: number) {
    // Get post author
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, title: true },
    });

    // Don't notify if liking own post
    if (!post || post.userId === likerId) return;

    // Get liker info
    const liker = await this.prisma.user.findUnique({
      where: { id: likerId },
      select: { name: true },
    });

    const notification: NotificationPayload = {
      type: NotificationType.LIKE,
      userId: likerId,
      targetUserId: post.userId,
      postId,
      message: `${liker?.name} liked your post "${post.title}"`,
      timestamp: new Date(),
    };

    this.notificationsGateway.emitNotification(post.userId, notification);

    // Emit activity feed update
    this.emitActivityFeedUpdate({
      type: 'like',
      userId: likerId,
      userName: liker?.name,
      postId,
      postTitle: post.title,
      timestamp: new Date(),
    });
  }

  async notifyComment(
    userId: number,
    postId: number,
    commentId: number,
    commenterId: number,
  ) {
    // Get post author
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, title: true },
    });

    // Don't notify if commenting on own post
    if (!post || post.userId === commenterId) return;

    // Get commenter info
    const commenter = await this.prisma.user.findUnique({
      where: { id: commenterId },
      select: { name: true },
    });

    const notification: NotificationPayload = {
      type: NotificationType.COMMENT,
      userId: commenterId,
      targetUserId: post.userId,
      postId,
      commentId,
      message: `${commenter?.name} commented on your post "${post.title}"`,
      timestamp: new Date(),
    };

    this.notificationsGateway.emitNotification(post.userId, notification);

    // Emit activity feed update
    this.emitActivityFeedUpdate({
      type: 'comment',
      userId: commenterId,
      userName: commenter?.name,
      postId,
      postTitle: post.title,
      commentId,
      timestamp: new Date(),
    });
  }

  async notifyFollow(followerId: number, followingId: number) {
    // Get follower info
    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true },
    });

    const notification: NotificationPayload = {
      type: NotificationType.FOLLOW,
      userId: followerId,
      targetUserId: followingId,
      message: `${follower?.name} started following you`,
      timestamp: new Date(),
    };

    this.notificationsGateway.emitNotification(followingId, notification);

    // Emit activity feed update
    this.emitActivityFeedUpdate({
      type: 'follow',
      userId: followerId,
      userName: follower?.name,
      targetUserId: followingId,
      timestamp: new Date(),
    });
  }

  async notifyUnfollow(followerId: number, followingId: number) {
    // Get follower info
    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true },
    });

    const notification: NotificationPayload = {
      type: NotificationType.UNFOLLOW,
      userId: followerId,
      targetUserId: followingId,
      message: `${follower?.name} unfollowed you`,
      timestamp: new Date(),
    };

    this.notificationsGateway.emitNotification(followingId, notification);
  }

  // Emit activity feed updates
  emitActivityFeedUpdate(activityData: any) {
    this.notificationsGateway.emitActivityFeedUpdate(activityData);
  }
}
