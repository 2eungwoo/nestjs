import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateDataDto {
  @IsNotEmpty()
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  @IsOptional()
  datastring?: string;
}
