import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  desc: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
