import { Module } from '@nestjs/common';
import { CommonService } from './Common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        // 전체 프로젝트 경로 얻기 : process.cwd()
        // 그 이후에 인자로 폴더이름을 넣어서 join 해준다. ( import {join} from 'path'; )
        // process.cwd() + '/public' + '/temp'  이런 식으로 해줘도 되지만 단, 윈도우는 경로가 '\'로 돼있기 때문에 제약이 있음
        // 그래서 join을 써주는게 안전하다.
        destination: join(process.cwd(), 'public', 'temp'),
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
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule { }
