import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const reqTime = Date.now();

    return next.handle().pipe(
      // delay(999), // 999ms 딜레이 주기
      tap(() => {
        const resTime = Date.now();
        const diff = resTime - reqTime; // ms으로 나옴

        if (diff > 1000) {
          console.log(`TIME OUT!!`);
        } else {
          console.log(`[${req.method} ${req.path}] ${diff}ms`);
        }
      }),
    );
  }
}
