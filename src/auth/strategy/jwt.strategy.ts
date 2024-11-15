import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      // passport-jwt에서 제공해주는 기본 파라미터 값들 세팅
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // jwt token 추출을 Bearer $token 으로 설정
      ignoreExpiration: false, // jwt 토큰 만료기간 무시할거냐? false
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'), // access token을 검증하겠다.
    });
  }

  async validate(payload: any) {
    return payload;
  }
}

export class JwtAuthGuard extends AuthGuard('jwt') {}
