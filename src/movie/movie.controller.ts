import { Controller, Get, Query } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation';
import { CustomPublicDecorator } from 'src/auth/decorator/public.decorator';
import { GetMoviesDto } from './dto/get-movies.dto';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @CustomPublicDecorator()
  getMovie(
    @Query('title', MovieTitleValidationPipe)
    title?: string,
  ) {
    return this.movieService.findAll(title);
  }

  @Get()
  @CustomPublicDecorator()
  getMovieWithPagination(@Query() dto: GetMoviesDto) {
    return this.movieService.findAllWithPagination(dto);
  }
}
