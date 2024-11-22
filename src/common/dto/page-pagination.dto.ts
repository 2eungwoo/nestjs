import { IsInt, IsOptional } from 'class-validator';

export class PagePaginationDto {
  // 얘가 부모테이블이 되어서 페이지네이션 할 엔티티가 상속하면됨 ex) movieResponseDto
  @IsInt()
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @IsOptional()
  take?: number = 20;
}
