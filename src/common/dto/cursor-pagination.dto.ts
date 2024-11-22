import { IsIn, IsInt, IsOptional } from 'class-validator';

export class CursorPaginatioDto {
  // id를 기반으로만 한다고 일단 가정
  @IsInt()
  @IsOptional()
  id?: number;

  @IsIn(['ASC', 'DESC']) // 'asc', 'desc'만 올 수 있고,
  @IsOptional()
  order: 'ASC' | 'DESC' = 'DESC'; // default = 'desc'

  @IsInt()
  @IsOptional()
  take?: number = 20;
}
