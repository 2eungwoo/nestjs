import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation';
import { CustomPublicDecorator } from 'src/auth/decorator/public.decorator';
import { GetMoviesPageDto } from './dto/get-movies.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { CacheInterceptor } from 'src/common/interceptor/cach-interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { CustomRBAC } from 'src/auth/decorator/rabc.decorator';
import { Role } from 'src/users/entities/user.entity';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UserId } from 'src/users/decorator/user-id.decorator';
import { QueryRunnerDecorator } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner } from 'typeorm';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

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
  getMovieWithPagination(@Query() dto: GetMoviesPageDto) {
    return this.movieService.findAllWithPagination(dto);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  createMovie(@Body() dto: CreateMovieDto, @UserId() userId: number, @Request() req) {
    return this.movieService.createMovie(dto, userId, req.queryRunner);
  }

  @Delete(':id')
  @CustomRBAC(Role.admin)
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.deleteMovie(id);
  }


  // common에서 파일 업로드를 다뤄주고 있으므로
  // movie 컨텐츠를 생성하는 엔드포인트에서는
  // createMovieDto에서는 파일 이름만 가지고 temp -> persist로 저장을 바꿔주면 된다.
  @Post()
  @CustomRBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  postMovie(
    @Body() createMovieDto: CreateMovieDto,
    @Request() req,
    @QueryRunnerDecorator() queryRunner: QueryRunner,
    @UserId() userId: number,
  ) {
    console.log(`@Body(): : ${createMovieDto}`);
    console.log(`@Request(): req.body.createMovieDto : ${req.body.createMovieDto}`);
    return this.movieService.createMovie(createMovieDto, userId, queryRunner);
  }

  @Post(':movieId/like')
  async createMovieLike(@Param('movieId', ParseIntPipe) movieId: number, @UserId() userId: number) {
    return await this.movieService.toggleMovieLike(movieId, userId, true);
  }

  @Post(':movieId/dislike')
  async createMovieDislike(@Param('movieId', ParseIntPipe) movieId: number, @UserId() userId: number) {
    return await this.movieService.toggleMovieLike(movieId, userId, false);
  }
}
