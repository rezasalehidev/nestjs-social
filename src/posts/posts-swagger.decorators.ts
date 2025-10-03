import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { PostResponseDto } from './dto/post-response.dto';

export function PostsControllerDecorators() {
  return applyDecorators(
    ApiTags('posts'),
    ApiBearerAuth(),
    ApiExtraModels(PostResponseDto),
  );
}

export function CreatePostDecorators() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new post' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Post data with optional image file',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the post' },
          desc: { type: 'string', description: 'Description of the post' },
          image: {
            type: 'string',
            format: 'binary',
            description: 'Image file to upload',
          },
          active: { type: 'string', description: 'Active status (true/false)' },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Post created successfully',
      type: PostResponseDto,
    }),
  );
}

export function FindAllPostsDecorators() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all posts' }),
    ApiResponse({
      status: 200,
      description: 'List of posts',
      type: [PostResponseDto],
    }),
  );
}

export function FindOnePostDecorators() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a post by ID' }),
    ApiParam({ name: 'id', type: Number, description: 'Post ID' }),
    ApiResponse({
      status: 200,
      description: 'Post found',
      type: PostResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Post not found',
    }),
  );
}

export function UpdatePostDecorators() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a post by ID' }),
    ApiParam({ name: 'id', type: Number, description: 'Post ID' }),
    ApiResponse({
      status: 200,
      description: 'Post updated',
      type: PostResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Post not found',
    }),
  );
}

export function DeletePostDecorators() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a post by ID' }),
    ApiParam({ name: 'id', type: Number, description: 'Post ID' }),
    ApiResponse({
      status: 200,
      description: 'Post deleted',
      type: PostResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Post not found',
    }),
  );
}
