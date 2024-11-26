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
  @UseInterceptors(FilesInterceptor('movieFiles')) // file을 프로세싱 해주는 interceptor. 복수 업로드라 복수형을 쓴다.
  postMovie(@Body() body: CreateMovieDto, @Request() req, @UploadedFiles() files: Express.Multer.File) { // file을 인자로 받는 방법. 복수 업로드라 복수형을 쓴다.
    console.log(files);
    return this.movieService.createMovie(body, req.queryRunner);
  }
}
