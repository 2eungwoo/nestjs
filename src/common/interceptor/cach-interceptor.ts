import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, any>(); // 이렇게 메모리에 넣는건 사실 좋지 않음

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const key = `${req.method} - ${req.path}`; // ex) GET /movie

    if (this.cache.has(key)) {
      console.log(`${req.method} ${req.path} : 이미 요청된 api`);
      // 만약 이미 부른 요청이어서 캐시에 있으면 바로 return
      return of(this.cache.get(key)); // of : rxjs에 있는건데, 일반 변수를 Observable로 만들어줌
    }

    return next.handle().pipe(
      tap((response) => {
        console.log(`${req.method} ${req.path} : 처음 요청된 api`);
        this.cache.set(key, response);
      }),
    );
  }
}
