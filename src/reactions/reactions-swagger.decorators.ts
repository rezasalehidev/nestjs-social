import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { ReactionResponseDto } from './dto/reaction-response.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';

export function ReactionsControllerDecorators() {
  return applyDecorators(
    ApiTags('reactions'),
    ApiBearerAuth(),
    ApiExtraModels(ReactionResponseDto),
  );
}

export function CreateReactionDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Toggle reaction (like/unlike) on a post or comment',
      description:
        'Toggle a reaction on either a post or a comment. If the user has already reacted, it removes the reaction. If not, it creates a new reaction.',
    }),
    ApiBody({
      type: CreateReactionDto,
      examples: {
        'Like a post': {
          summary: 'Like a post',
          value: {
            type: 'like',
            postId: 123,
          },
        },
        'Like a comment': {
          summary: 'Like a comment',
          value: {
            type: 'like',
            commentId: 456,
          },
        },
        'Toggle post reaction': {
          summary: 'Toggle reaction on post (defaults to like)',
          value: {
            postId: 123,
          },
        },
        'Toggle comment reaction': {
          summary: 'Toggle reaction on comment (defaults to like)',
          value: {
            commentId: 456,
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Reaction created successfully',
      type: ReactionResponseDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Reaction removed successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Reaction removed successfully',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - either postId or commentId must be provided, but not both',
    }),
    ApiResponse({
      status: 404,
      description: 'Post or comment not found',
    }),
  );
}

export function RemoveReactionDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a reaction (unlike) from a post or comment',
      description:
        'Remove an existing reaction from either a post or a comment.',
    }),
    ApiQuery({
      name: 'postId',
      type: Number,
      required: false,
      description: 'ID of the post to remove reaction from',
    }),
    ApiQuery({
      name: 'commentId',
      type: Number,
      required: false,
      description: 'ID of the comment to remove reaction from',
    }),
    ApiResponse({
      status: 200,
      description: 'Reaction removed successfully',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad request - either postId or commentId must be provided, but not both',
    }),
    ApiResponse({
      status: 404,
      description: 'Reaction not found',
    }),
  );
}

export function GetPostReactionsDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all reactions for a specific post',
      description: 'Retrieve a list of all reactions (likes) for a specific post, including user information for each reaction.',
    }),
    ApiParam({
      name: 'postId',
      type: Number,
      description: 'ID of the post to get reactions for',
      example: 123,
    }),
    ApiResponse({
      status: 200,
      description: 'List of reactions for the post retrieved successfully',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'Reaction ID',
              example: 456,
            },
            type: {
              type: 'string',
              description: 'Type of reaction',
              enum: ['like', 'love', 'laugh', 'angry', 'sad'],
              example: 'like',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the reaction was created',
              example: '2025-10-04T22:01:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the reaction was last updated',
              example: '2025-10-04T22:01:00.000Z',
            },
            userId: {
              type: 'number',
              description: 'ID of the user who reacted',
              example: 789,
            },
            postId: {
              type: 'number',
              description: 'ID of the post',
              example: 123,
            },
            user: {
              type: 'object',
              description: 'User information',
              properties: {
                id: {
                  type: 'number',
                  example: 789,
                },
                name: {
                  type: 'string',
                  example: 'John Doe',
                },
                email: {
                  type: 'string',
                  example: 'john@example.com',
                },
              },
            },
          },
        },
        example: [
          {
            id: 456,
            type: 'like',
            createdAt: '2025-10-04T22:01:00.000Z',
            updatedAt: '2025-10-04T22:01:00.000Z',
            userId: 789,
            postId: 123,
            user: {
              id: 789,
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
          {
            id: 457,
            type: 'love',
            createdAt: '2025-10-04T22:02:00.000Z',
            updatedAt: '2025-10-04T22:02:00.000Z',
            userId: 790,
            postId: 123,
            user: {
              id: 790,
              name: 'Jane Smith',
              email: 'jane@example.com',
            },
          },
        ],
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Post not found',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 404,
          },
          message: {
            type: 'string',
            example: 'Post not found',
          },
          error: {
            type: 'string',
            example: 'Not Found',
          },
        },
      },
    }),
  );
}

export function GetCommentReactionsDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all reactions for a specific comment',
      description: 'Retrieve a list of all reactions (likes) for a specific comment, including user information for each reaction.',
    }),
    ApiParam({
      name: 'commentId',
      type: Number,
      description: 'ID of the comment to get reactions for',
      example: 456,
    }),
    ApiResponse({
      status: 200,
      description: 'List of reactions for the comment retrieved successfully',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'Reaction ID',
              example: 789,
            },
            type: {
              type: 'string',
              description: 'Type of reaction',
              enum: ['like'],
              example: 'like',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the reaction was created',
              example: '2025-10-04T22:01:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the reaction was last updated',
              example: '2025-10-04T22:01:00.000Z',
            },
            userId: {
              type: 'number',
              description: 'ID of the user who reacted',
              example: 101,
            },
            commentId: {
              type: 'number',
              description: 'ID of the comment',
              example: 456,
            },
            user: {
              type: 'object',
              description: 'User information',
              properties: {
                id: {
                  type: 'number',
                  example: 101,
                },
                name: {
                  type: 'string',
                  example: 'Alice Johnson',
                },
                email: {
                  type: 'string',
                  example: 'alice@example.com',
                },
              },
            },
          },
        },
        example: [
          {
            id: 789,
            type: 'like',
            createdAt: '2025-10-04T22:01:00.000Z',
            updatedAt: '2025-10-04T22:01:00.000Z',
            userId: 101,
            commentId: 456,
            user: {
              id: 101,
              name: 'Alice Johnson',
              email: 'alice@example.com',
            },
          },
          {
            id: 790,
            type: 'love',
            createdAt: '2025-10-04T22:02:00.000Z',
            updatedAt: '2025-10-04T22:02:00.000Z',
            userId: 102,
            commentId: 456,
            user: {
              id: 102,
              name: 'Bob Wilson',
              email: 'bob@example.com',
            },
          },
        ],
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Comment not found',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 404,
          },
          message: {
            type: 'string',
            example: 'Comment not found',
          },
          error: {
            type: 'string',
            example: 'Not Found',
          },
        },
      },
    }),
  );
}

export function GetReactionCountDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get reaction count for a post or comment',
    }),
    ApiQuery({
      name: 'postId',
      type: Number,
      required: false,
      description: 'ID of the post to get reaction count for',
    }),
    ApiQuery({
      name: 'commentId',
      type: Number,
      required: false,
      description: 'ID of the comment to get reaction count for',
    }),
    ApiResponse({
      status: 200,
      description: 'Reaction count retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          count: {
            type: 'number',
            description: 'Number of reactions',
            example: 10,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad request - either postId or commentId must be provided, but not both',
    }),
  );
}

export function CheckUserReactionDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Check if the current user has reacted to a post or comment',
    }),
    ApiQuery({
      name: 'postId',
      type: Number,
      required: false,
      description: 'ID of the post to check reaction for',
    }),
    ApiQuery({
      name: 'commentId',
      type: Number,
      required: false,
      description: 'ID of the comment to check reaction for',
    }),
    ApiResponse({
      status: 200,
      description: 'Reaction status checked successfully',
      schema: {
        type: 'object',
        properties: {
          hasReacted: {
            type: 'boolean',
            description: 'Whether the user has reacted to the item',
            example: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad request - either postId or commentId must be provided, but not both',
    }),
  );
}

export function LikePostDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Toggle like on a post',
      description:
        'Toggle a like reaction on a specific post. If the user has already liked the post, it removes the like. If not, it adds a like.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID of the post to like/unlike',
    }),
    ApiBody({
      description: 'Reaction data',
      schema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['like'],
            default: 'like',
            description: 'Type of reaction',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Post liked successfully',
      type: ReactionResponseDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Like removed successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Reaction removed successfully',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Post not found',
    }),
  );
}

export function UnlikePostDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Unlike a post',
      description: 'Remove reaction (unlike) from a specific post',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID of the post to unlike',
    }),
    ApiResponse({
      status: 200,
      description: 'Post unliked successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Reaction not found',
    }),
  );
}

export function GetPostReactionCountDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get reaction count for a specific post',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID of the post to get reaction count for',
    }),
    ApiResponse({
      status: 200,
      description: 'Reaction count retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          count: {
            type: 'number',
            description: 'Number of reactions on the post',
            example: 15,
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Post not found',
    }),
  );
}

export function LikeCommentDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Toggle like on a comment',
      description:
        'Toggle a like reaction on a specific comment. If the user has already liked the comment, it removes the like. If not, it adds a like.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID of the comment to like/unlike',
    }),
    ApiBody({
      description: 'Reaction data',
      schema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['like'],
            default: 'like',
            description: 'Type of reaction',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Comment liked successfully',
      type: ReactionResponseDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Like removed successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Reaction removed successfully',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Comment not found',
    }),
  );
}

export function UnlikeCommentDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Unlike a comment',
      description: 'Remove reaction (unlike) from a specific comment',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID of the comment to unlike',
    }),
    ApiResponse({
      status: 200,
      description: 'Comment unliked successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Reaction not found',
    }),
  );
}

export function GetCommentReactionCountDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get reaction count for a specific comment',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID of the comment to get reaction count for',
    }),
    ApiResponse({
      status: 200,
      description: 'Reaction count retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          count: {
            type: 'number',
            description: 'Number of reactions on the comment',
            example: 5,
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Comment not found',
    }),
  );
}
