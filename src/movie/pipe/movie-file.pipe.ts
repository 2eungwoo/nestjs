// import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

// @Injectable()
// export class MovieFilePipe implements PipeTransform<Express.Multer.File, Express.Multer.File> {
//     constructor(private readonly options: {
//         maxSize: number,
//         mimetype: string,
//     }) {

//     }
//     transform(value: Express.Multer.File, metadata: ArgumentMetadata): Express.Multer.File {
//         if (!value) {
//             throw new BadRequestException('movie 필드는 필수입니다.');
//         }

//         const byteSize = this.options.maxSize * 1000000;
//         if (value.size > byteSize) {
//             throw new BadRequestException(`${this.options.maxSize}MB 이하의 사이즈만 업로드 가능합니다.`);
//         }

//         if (value.mimetype !== this.options.mimetype) {
//             throw new BadRequestException(`${this.options.mimetype}만 업로드 가능합니다.`);
//         }

//         return value;

//     }
// }