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
import { GetMoviesDto } from './dto/get-movies.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { CacheInterceptor } from 'src/common/interceptor/cach-interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { CustomRBAC } from 'src/auth/decorator/rabc.decorator';
import { Role } from 'src/users/entities/user.entity';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

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
  getMovieWithPagination(@Query() dto: GetMoviesDto) {
    return this.movieService.findAllWithPagination(dto);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  createMovie(@Body() dto: CreateMovieDto, @Request() req) {
    return this.movieService.createMovie(dto, req.queryRunner);
  }

  @Delete(':id')
  @CustomRBAC(Role.admin)
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.deleteMovie(id);
  }

  @Post()
  @CustomRBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FileFieldsInterceptor([
    {
      name: 'movies',
      maxCount: 3,
    },
    {
      name: 'posters',
      maxCount: 3,
    }
  ], {
    limits: {
      fileSize: 200000,
    },
    fileFilter(req, file, callback) {
      console.log(file); // mimetype으로 파일 타입을 필터링해줄 수 있다.
      if (file.mimetype !== 'video/mp4') {
        return callback(new BadRequestException('mp4 파일만 업로드 가능'), false);
      }
      return callback(null, true);
      // null 자리에 에러를 넣어주면 에러가 있을 때 자동으로 에러를 넘겨준다.
      // 두번째 인자에 false를 하면 파일을 안받는다. true로 해야 파일을 받는다.
    }
  }
  ))
  postMovie(
    @Body() body: CreateMovieDto,
    @Request() req,
    @UploadedFiles() files: {
      movie?: Express.Multer.File[],
      poster?: Express.Multer.File[]
    }) {
    console.log(files);
    return this.movieService.createMovie(body, req.queryRunner);
  }
}
