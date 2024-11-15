// email, password 로 로그인하는 strategy

import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import AuthService from '../auth.service';

export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // username 이라 부르는 field를 email로 바꾸겠다.
    });
  }

  /**
   * LocalStrategy는 username, password를 두개 인자로 쓴다.
   * @Param username, password (username은 email로 바꿀거임)
   * @return Reqest();
   */
  async validate(email: string, password: string) {
    const user = await this.authService.authenticate(email, password);
    return user;
  }
}
