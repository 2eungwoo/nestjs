import { IsEmpty, IsNotEmpty } from 'class-validator';

export class CreateMovieDto {
  @IsEmpty()
  title: string;

  @IsNotEmpty()
  genre: string;

  @IsNotEmpty()
  movieDetail: string;
}
