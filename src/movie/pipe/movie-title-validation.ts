import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class MovieTitleValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) return value;

    if (value.length <= 2) {
      throw new Error('2글자 이상이어야함');
    }
    return value;
  }
}
