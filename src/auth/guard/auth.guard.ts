import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { CustomPublicDecorator } from '../decorator/public.decorator';

@Injectable()
export class CustomAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 만약에 CustomPublic 데코레이터 적용했으면 모든 로직을 통과시키도록 하자
    const isPublicAnnotated = this.reflector.get(
      CustomPublicDecorator,
      context.getHandler(),
    );
    // console.log(isPublicAnnotated); -> 커스텀 데코레이터 파라미터에 넣은 값이 출력됨
    // ex) customDeco('test') -> test
    // 값을 아무것도 안넣음 or 데코레이터 안달아주면 console.log는 undefined가 나올거임
    // 이 점을 노려서 데코레이터를 달았는지 안달았는지 체크가 가능하다.
    if (isPublicAnnotated) {
      return true;
    }

    // 요청에서 user 객체가 존재하는지 확인
    // middleware에서 모든 라우터에 대해서 request에 user객체가 담기도록 해놨기 때문에
    // guard에서는 user객체의 존재 여부만 따져주고, 객체가 없으면 guard 통과 못하게 해보자
    const request = context.switchToHttp().getRequest();
    if (!request.user || request.user.type !== 'access') {
      // user가 없거나 access토큰이 아니면,
      console.log('auth guard 막힘. 로그인 해서 엑세스 토큰 집어넣어주셈');
      console.log(`request.user.type : ${request.user.type}`);
      return false; // 가드 막히게 return false
    }

    return true; // 가드 통과하게 return true
  }
}
