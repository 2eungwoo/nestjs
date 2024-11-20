import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import AuthService from './auth.service';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { CustomAuthGuard } from './guard/auth.guard';
import { CustomPublicDecorator } from './decorator/public.decorator';
import { CustomRBAC } from './decorator/rabc.decorator';
import { Role } from 'src/users/entities/user.entity';

@Controller('/auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @CustomPublicDecorator()
  async registerUser(@Headers('authorization') token: string) {
    // authorization: Basic $token
    return await this.authService.register(token);
  }

  @Post('/login')
  @CustomPublicDecorator()
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

  // @Post('/reissue')
  // async reissueAccessToken(@Headers('authorization') token: string) {
  //   const payload = await this.authService.parseBearerToken(token, true);

  //   return {
  //     accessToken: await this.authService.issueToken(payload, false),
  //   };
  // }
  @Post('/reissue')
  @CustomPublicDecorator(true)
  async reissueAccessToken(@Request() req) {
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @Get('/guard-pass')
  @UseGuards(CustomAuthGuard)
  async guardPassTest() {
    return 'guard-pass';
  }

  @Get('/guard-fail')
  @UseGuards(CustomAuthGuard)
  async guardFailTest() {
    return 'guard-fail';
  }

  @Get('/public')
  @CustomPublicDecorator()
  @SetMetadata('isPublic', true)
  async getPublicByCustomDecorator() {
    return 'success';
  }

  @Get('/admin')
  @CustomRBAC(Role.admin)
  async getAdminPage() {
    return await 'admin';
  }
}
