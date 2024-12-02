import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class CommonController {

    /*
       비디오 파일 업로드
    */
    @Post('/common/video')
    @UseInterceptors(FileInterceptor('video', {
        limits: {
            fileSize: 200000,
        },
        fileFilter(req, file, callback) {
            console.log(file);
            if (file.mimetype !== 'video/mp4') {
                return callback(new BadRequestException('mp4 파일만 업로드 가능'), false);
            }
            return callback(null, true);
        }
    }
    ))
    createVideo(@UploadedFile() file: Express.Multer.File) {
        return {
            fileName: file.filename,
        }
    }

}
