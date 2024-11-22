import { Controller, Get, Post, Query } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation';
import { CustomPublicDecorator } from 'src/auth/decorator/public.decorator';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CreateMovieDto } from './dto/create-movie.dto';

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

  @Get('/pagination')
  getMovieWithPagination(@Query() dto: GetMoviesDto) {
    return this.movieService.findAllWithPagination(dto);
  }

  @Post()
  createMovie(dto: CreateMovieDto) {
    return this.movieService.createMovie(dto);
  }
}
