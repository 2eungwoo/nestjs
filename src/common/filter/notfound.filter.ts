import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';

@Catch(NotFoundException)
export class NotFoundFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const req = context.getRequest();
    const res = context.getResponse();

    const status = exception.getStatus();

    console.log('404 not found filter called');
    res.status(status).json({
      // 여기서 에러 응답 body를 커스텀 할수 있다.
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: '404 커스텀에러 메세지',
    });
  }
}
