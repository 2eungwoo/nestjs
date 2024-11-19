import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction } from 'express';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  // Bearer 토큰을 검증하는 미들웨어
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async use(req: any, res: any, next: NextFunction) {
    // Basic $token 또는 Bearer $token
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      next(); // authHeader가 존재하지 않는다는건 인증을 할 의도가 없는 메소드이기 때문에 그냥 다음 미들웨어로 넘겨라.
      return;
    }

    try {
      const token = this.validateBearToken(authHeader);
      const decodedPayload = this.jwtService.decode(token);

      if (
        decodedPayload.type !== 'refresh' &&
        decodedPayload.type !== 'access'
      ) {
        throw new UnauthorizedException('잘못된 토큰입니다.');
      }

      const secretKey =
        decodedPayload.type === 'refresh'
          ? 'REFRESH_TOKEN_SECRET'
          : 'ACCESS_TOKEN_SECRET';

      // token 검증. payload 가져오면서 검증하는 메서드(verifyAsync())
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(secretKey),
      });

      // 이런 문법이 있네. payload.type이 'refresh'인 경우 할당
      // const isRefreshToken = payload.type === 'refresh';

      req.user = payload;
      next(); // request.user에 payload 주고 다음 미들웨어로.
    } catch (e) {
      console.log(`================ token error : ${e}`);
      //throw new UnauthorizedException('토큰이 만료되었습니다.');
      next();
    }
  }

  validateBearToken(rawToken: string) {
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다');
    }

    const [bearer, token] = basicSplit;
    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다');
    }

    return token;
  }
}
