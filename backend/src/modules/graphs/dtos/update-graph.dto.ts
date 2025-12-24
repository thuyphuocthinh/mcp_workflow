import { IsArray, IsNumber } from 'class-validator';
import {
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGraphDto } from './create-graph.dto';


class FlowNodePositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}


class FlowNodeDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  type?: string;

  @ValidateNested()
  @Type(() => FlowNodePositionDto)
  position: FlowNodePositionDto;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}


class FlowEdgeDto {
  @IsString()
  id: string;

  @IsString()
  source: string;

  @IsString()
  target: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  sourceHandle?: string;

  @IsOptional()
  @IsString()
  targetHandle?: string;
}


export class UpdateGraphDto extends CreateGraphDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNodeDto)
  nodes?: FlowNodeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowEdgeDto)
  edges?: FlowEdgeDto[];
}
