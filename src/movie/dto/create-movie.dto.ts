import {
  ArrayNotEmpty,
  IsArray,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreateMovieDto {
  @IsEmpty()
  title: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber(
    {},
    {
      each: true,
    },
  )
  genreIds: number[];

  @IsNotEmpty()
  movieDetail: string;

  @IsNotEmpty()
  directorId: number;
}
