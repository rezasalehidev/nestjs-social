import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  desc: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  active?: string;
}
