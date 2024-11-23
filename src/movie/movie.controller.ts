import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation';
import { CustomPublicDecorator } from 'src/auth/decorator/public.decorator';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { CacheInterceptor } from 'src/common/interceptor/cach-interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @CustomPublicDecorator()
  @UseInterceptors(CacheInterceptor)
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
  @UseInterceptors(TransactionInterceptor)
  createMovie(@Body() dto: CreateMovieDto, @Request() req) {
    return this.movieService.createMovie(dto, req.queryRunner);
  }

  @Delete(':id')
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.deleteMovie(id);
  }
}
