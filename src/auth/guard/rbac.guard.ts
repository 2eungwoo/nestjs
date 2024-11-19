import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomRBAC } from '../decorator/rabc.decorator';
import { Role } from 'src/users/entities/user.entity';

@Injectable()
export class CustomRBACGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get<Role>(CustomRBAC, context.getHandler());

    // Role eum에 해당되는 값이 데코레이터에 들어갔는지 확인하기
    // Role에서 가져온 값에 role이 포함돼있는지 분기. 애초에 이 값이 없으면 RBAC 데코레이터를 적용하지 않은 것이므로 검증할 필요가 없음
    if (!Object.values(Role).includes(role)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // AuthGuard를 먼저 통과했는지 검증
    if (!user) {
      console.log('RBAD Guard 막힘. user 정보 없음. 로그인하지 않았다는 뜻');
      return false;
    }

    return user.role <= role; // ??
  }
}
