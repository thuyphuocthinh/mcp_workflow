import { IsString } from 'class-validator';

export class ModelKeyDto {
  @IsString()
  modelType: string;

  @IsString()
  key: string;
}
