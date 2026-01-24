import { IsString, IsObject, IsOptional } from 'class-validator';
import { OAuthToken } from '../schemas/user-tool-auth.schema';

export class AuthorizeToolDto {
  @IsString()
  toolKey: string;

  @IsString()
  provider: string;

  @IsObject()
  token: OAuthToken;

  @IsOptional()
  raw?: Record<string, any>;
}
