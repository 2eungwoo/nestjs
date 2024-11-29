import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
} from '@nestjs/common';

@Catch(ForbiddenException)
export class UnauthorizedFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const req = context.getRequest();
    const res = context.getResponse();

    const status = exception.getStatus();
    console.log('UnauthorizedException custom filter called');
    res.status(status).json({
      // 여기서 에러 응답 body를 커스텀 할수 있다.
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: 'UnauthorizedException. 권한이 없습니다.',
    });
  }
}
