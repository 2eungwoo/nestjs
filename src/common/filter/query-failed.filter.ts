import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError) // typeorm에서 쿼리 중 에러가 날 때 QueryFailedError가 날아온다.
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log('query failed exception filter called');
    const context = host.switchToHttp();
    const req = context.getRequest();
    const res = context.getResponse();

    // const status = exception.getStatus(); queryfailederror는 사실 http로 오는게 아니라서 getStatus() 못함
    // 따라서 그냥 클라이언트에서 뭔가 잘못된 값을 넣었을 때 에러가 난다고 가정하고 400이라고 임의로 써본다.
    const statusCode = 400;
    let message = '데이터베이스 에러!';

    // 이렇게 프로덕트 코드 단에서 직접 못잡아줬던 에러들은 분기해서 처리해줄 수 있다.
    // typeorm에서 발생할 수 있는 에러들을 집어넣어줄 수 있다.
    if (exception.message.includes('duplicate key')) {
      message = '중복 키 에러!';
    }

    res.status(statusCode).json({
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: message,
    });
  }
}
