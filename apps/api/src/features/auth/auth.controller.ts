import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from '../../shared/guards/local-auth.guard'; 
import { JwtAuthGuard, Public } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user and workspace' })
  @ApiResponse({ status: 201, description: 'User and workspace successfully created.' })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Public()
  @Post('password/reset-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset token' })
  @ApiResponse({ status: 200, description: 'Password reset token request processed.' })
  async requestPasswordReset(@Body() dto: ResetPasswordRequestDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() _dto: LoginDto, 
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.authService.generateAccessToken(req.user);
    const refreshToken = await this.authService.generateRefreshToken(
      req.user.id,
      undefined,
      req.ip,
      req.headers['user-agent'],
    );

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and get a new access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.rotateRefreshToken(
          token,
          req.ip,
          req.headers['user-agent'],
        );

      this.setRefreshTokenCookie(res, newRefreshToken);

      return { accessToken };
    } catch (err) {
      
      this.clearRefreshTokenCookie(res);
      throw err;
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token session' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refreshToken;
    if (token) {
      await this.authService.logout(token);
    }
    this.clearRefreshTokenCookie(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile and workspace' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google OAuth provider login' })
  async googleAuth(@Req() _req: Request) {
    
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback handler' })
  async googleAuthRedirect(
    @Req() req: any,
    @Res() res: Response,
  ) {
    const accessToken = await this.authService.generateAccessToken(req.user);
    const refreshToken = await this.authService.generateRefreshToken(
      req.user.id,
      undefined,
      req.ip,
      req.headers['user-agent'],
    );

    this.setRefreshTokenCookie(res, refreshToken);

    const redirectUrl = `${
      process.env.FRONTEND_URL ?? 'http://localhost:3000'
    }/auth/callback?token=${accessToken}`;

    return res.redirect(redirectUrl);
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions: any = {
      httpOnly: true,
      secure:   true,
      sameSite: isProd ? 'lax' : 'none',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    };
    if (isProd) {
      cookieOptions.domain = '.workledger.io';
    }
    res.cookie('refreshToken', token, cookieOptions);
  }

  private clearRefreshTokenCookie(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions: any = {
      httpOnly: true,
      secure:   true,
      sameSite: isProd ? 'lax' : 'none',
    };
    if (isProd) {
      cookieOptions.domain = '.workledger.io';
    }
    res.clearCookie('refreshToken', cookieOptions);
  }
}
