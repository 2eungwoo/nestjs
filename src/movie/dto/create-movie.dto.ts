import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, {
    each: true,
  },
  )
  @Type(() => Number)
  genreIds: number[];

  @IsNotEmpty()
  movieDetail: string;

  @IsNotEmpty()
  @Type(() => Number)
  directorId: number;

  @IsString()
  fileName: string;
}
