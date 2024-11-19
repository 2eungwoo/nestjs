/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export default class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  parseBasicToken(rawToken: string) {
    // 1: 토큰을 띄어쓰기 기준으로 split 후 토큰 값 추출
    // ['Basic', $token]
    const basicSplit = rawToken.split(' ');

    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다');
    }
    const [basic, token] = basicSplit;

    if (basic.toLowerCase() !== 'basic') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    // 2: 추출한 토큰을 base64 디코딩해서 이메일과 비밀번호로 나눈다
    // base64로 encoded 돼있는 token을 utf-8 string으로 변환하기.
    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    // email:password 이므로 ':' 기준으로 split 후 추출
    // ['email', 'password']
    const tokenSplit = decoded.split(':');
    if (tokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [email, password] = tokenSplit;

    return { email, password };
  }

  async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다');
    }

    const [bearer, token] = basicSplit;
    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다');
    }

    try {
      // token 검증. payload 가져오면서 검증하는 메서드(verifyAsync())
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(
          isRefreshToken ? 'REFRESH_TOKEN_SECRET' : 'ACCESS_TOKEN_SECRET',
        ),
      });

      if (isRefreshToken) {
        if (payload.type !== 'refresh') {
          throw new BadRequestException('refresh token이 아님');
        }
      } else {
        if (payload.type !== 'access') {
          throw new BadRequestException('access token이 아님');
        }
      }

      return payload;
    } catch (e) {
      console.log(`================ token error : ${e}`);
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }
  }

  // rawToken -> "Basic $token"   id:password
  async register(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    // email 중복 체크
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일입니다.');
    }

    // password bcrypt hashing
    const hashedPassword = await bcrypt.hash(
      password,
      this.configService.get<number>('HASH_ROUNDS'),
    );

    await this.userRepository.save({
      email: email,
      password: hashedPassword,
      //role: Role.user,
    });

    console.log(`register method called`);
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
  }

  async login(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    const user = await this.authenticate(email, password);
    console.log(`========= user:${user}`);

    return {
      refreshToken: await this.issueToken(user, true),
      accessToken: await this.issueToken(user, false),
    };
  }

  async authenticate(email: string, password: string) {
    // email 중복 체크
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    // 비밀번호가 일치하면 passOK
    // password => raw password
    // user.password => hashed password
    // password를 암호화해서 hashed랑 일치하는지를 판별한다.
    const passOK = await bcrypt.compare(password, user.password);

    if (!passOK) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    return user;
  }

  async issueToken(user: { id: number; role: Role }, isRefreshToken: boolean) {
    const refreshTokenSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );
    const accessTokenSecret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );

    return await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefreshToken ? '24h' : 300,
      },
    );
  }
}
