import { IsOptional, IsString } from 'class-validator';
import { CursorPaginatioDto } from 'src/common/dto/cursor-pagination.dto';

export class GetMoviesDto extends CursorPaginatioDto {
  @IsString()
  @IsOptional()
  title?: string;
}
