import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CursorPaginatioDto {
  @IsString()
  @IsOptional()
  // id_52, likeCounts_20
  cursor?: string;

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  // [id_ASC, id_DESC], default = ['id_DESC']
  order: string[] = ['id_DESC']; // postman에서 실험할때 Params key에 order[] 이렇게 주면 됨

  @IsInt()
  @IsOptional()
  take?: number = 20;
}
