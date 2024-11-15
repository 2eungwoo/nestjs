import {
  ClassSerializerInterceptor,
  Controller,
  Headers,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import AuthService from './auth.service';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';

@Controller('/auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async registerUser(@Headers('authorization') token: string) {
    // authorization: Basic $token
    return await this.authService.register(token);
  }

  @Post('/login')
  async loginUser(@Headers('authorization') token: string) {
    return await this.authService.login(token);
  }

  @Post('/passport-local/login')
  // @UseGuards(AuthGuard('local'))
  @UseGuards(LocalAuthGuard)
  async passportLoginUser(@Request() req) {
    return {
      refreshToken: await this.authService.issueToken(req.user, true),
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @Post('/private')
  // @UseGuards(AuthGuard('jwt'))
  @UseGuards(JwtAuthGuard)
  async private(@Request() req) {
    return req.user;
  }

  @Post('/reissue')
  async reissueAccessToken(@Headers('authorization') token: string) {
    const payload = await this.authService.parseBearerToken(token, true);

    return {
      accessToken: await this.authService.issueToken(payload, false),
    };
  }
}