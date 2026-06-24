import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID:     config.get<string>('google.clientId') || 'google-client-id-placeholder',
      clientSecret: config.get<string>('google.clientSecret') || 'google-client-secret-placeholder',
      callbackURL:  config.get<string>('google.callbackUrl') || 'http://localhost:3001/api/v1/auth/google/callback',
      scope:        ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    const user = await this.authService.validateOrCreateOAuthUser({
      provider:    'google',
      providerUid: id,
      email:       emails[0].value,
      name:        `${name.givenName} ${name.familyName}`,
      avatarUrl:   photos[0]?.value,
    });
    done(null, user);
  }
}
