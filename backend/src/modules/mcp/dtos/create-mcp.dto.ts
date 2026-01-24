import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";

class ToolActionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}

class ToolAuthDto {
  @IsEnum(["none", "api_key", "oauth"])
  type: "none" | "api_key" | "oauth";

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];
}

export class CreateMcpToolDto {
  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  endpoint: string;

  @IsOptional()
  @IsEnum(["http", "ws"])
  transport?: "http" | "ws";

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ValidateNested()
  @Type(() => ToolAuthDto)
  auth: ToolAuthDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ToolActionDto)
  tools: ToolActionDto[];
}
