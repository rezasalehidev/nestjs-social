import { ApiProperty } from '@nestjs/swagger';

export class ConversationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user1Id: number;

  @ApiProperty()
  user2Id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  user1: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty()
  user2: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty({ type: [Object] })
  messages: {
    id: number;
    content: string;
    senderId: number;
    sender: {
      id: number;
      name: string;
      email: string;
    };
    createdAt: Date;
  }[];
}
