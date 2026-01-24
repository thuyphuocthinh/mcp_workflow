import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateGraphDto {
  @IsString()
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(128, { message: 'Name must be at most 128 characters' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Description must be at most 300 characters' })
  description?: string;
}
