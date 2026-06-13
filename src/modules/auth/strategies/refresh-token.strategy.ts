import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/services/users.service';
import {
  JwtPayload,
  RefreshAuthenticatedUser,
} from '../types/authenticated-user.type';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: JwtPayload,
  ): Promise<RefreshAuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!user || !refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      id: user.id,
      email: user.email,
      refreshToken,
    };
  }
}
