import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { MovieDetail } from './entities/movie-detail.entity';
import { Director } from 'src/director/entities/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { diskStorage } from 'multer';
import { v4 } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, MovieDetail, Director, Genre]),
    CommonModule,
    MulterModule.register({
      storage: diskStorage({
        // 전체 프로젝트 경로 얻기 : process.cwd()
        // 그 이후에 인자로 폴더이름을 넣어서 join 해준다. ( import {join} from 'path'; )
        // process.cwd() + '/public' + '/temp'  이런 식으로 해줘도 되지만 단, 윈도우는 경로가 '\'로 돼있기 때문에 제약이 있음
        // 그래서 join을 써주는게 안전하다.
        destination: join(process.cwd(), 'public', 'persist-storage-movie-file'),
        filename: (req, file, callback) => {
          const split = file.originalname.split('');
          let extension = 'mp4'; // default
          if (split.length > 1) {
            extension = split[split.length - 1];
          }
          callback(null, `${v4()}_${Date.now()}.${extension}`); // 원하는 파일 이름으로 저장하기
        }
      }),
    }),
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule { }
