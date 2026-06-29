import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { Role } from '@workledger/shared';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { nanoid } from 'nanoid';
import { RedisService } from '../../core/cache/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.passwordHash) {
      const match = await bcrypt.compare(pass, user.passwordHash);
      if (match) {
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    
    return this.prisma.$transaction(async (tx) => {
      
      const slug = dto.workspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      let finalSlug = slug;
      let counter = 1;
      while (await tx.workspace.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      const workspace = await tx.workspace.create({
        data: {
          name: dto.workspaceName,
          slug: finalSlug,
        },
      });

      const emailVerifyToken = nanoid(32);

      
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          name: dto.name,
          emailVerified: false,
          emailVerifyToken,
        },
      });

      
      await tx.member.create({
        data: {
          workspaceId: workspace.id,
          userId:      user.id,
          role:        Role.OWNER,
          joinedAt:    new Date(),
        },
      });

      console.log(`[SIMULATED EMAIL VERIFICATION] Verification link: http://localhost:8000/auth/email/verify?token=${emailVerifyToken}`);

      const { passwordHash: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, workspace };
    });
  }

  async generateAccessToken(user: any): Promise<string> {
    const membership = await this.prisma.member.findFirst({
      where: { userId: user.id },
      include: { workspace: true },
    });
    
    const payload = {
      userId:      user.id,
      workspaceId: membership?.workspaceId || '',
      role:        membership?.role || 'MEMBER',
      plan:        membership?.workspace?.plan || 'FREE',
    };
    
    return this.jwtService.sign(payload, {
      secret:    this.configService.get<string>('jwt.accessSecret'),
      expiresIn: (this.configService.get<string>('jwt.accessExpiry') || '15m') as any,
    });
  }

  async generateRefreshToken(userId: string, familyId?: string, ipAddress?: string, userAgent?: string): Promise<string> {
    const rawToken = nanoid(64);
    
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 
    
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        family:    familyId || nanoid(32),
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
    
    return rawToken;
  }

  async rotateRefreshToken(rawToken: string, ipAddress?: string, userAgent?: string) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    
    if (record.revokedAt) {
      
      await this.prisma.refreshToken.updateMany({
        where: { family: record.family },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Token reuse detected. All sessions revoked.');
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: {
        revokedAt: new Date(),
        replacedBy: 'rotated',
      },
    });

    
    const accessToken = await this.generateAccessToken(record.user);
    const newRawRefreshToken = await this.generateRefreshToken(
      record.userId,
      record.family,
      ipAddress,
      userAgent
    );

    return { accessToken, refreshToken: newRawRefreshToken };
  }

  async validateOrCreateOAuthUser(profile: {
    provider:    string;
    providerUid: string;
    email:       string;
    name:        string;
    avatarUrl?:  string;
  }) {
    const oauth = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUid: {
          provider:    profile.provider,
          providerUid: profile.providerUid,
        },
      },
      include: { user: true },
    });

    if (oauth) {
      return oauth.user;
    }

    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (user) {
      await this.prisma.oAuthAccount.create({
        data: {
          userId:      user.id,
          provider:    profile.provider,
          providerUid: profile.providerUid,
          email:       profile.email,
        },
      });
      return user;
    }

    
    return this.prisma.$transaction(async (tx) => {
      const workspaceName = `${profile.name}'s Workspace`;
      const slug = workspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      let finalSlug = slug;
      let counter = 1;
      while (await tx.workspace.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: finalSlug,
        },
      });

      const newUser = await tx.user.create({
        data: {
          email:         profile.email,
          name:          profile.name,
          avatarUrl:     profile.avatarUrl,
          emailVerified: true, 
        },
      });

      await tx.member.create({
        data: {
          workspaceId: workspace.id,
          userId:      newUser.id,
          role:        Role.OWNER,
          joinedAt:    new Date(),
        },
      });

      await tx.oAuthAccount.create({
        data: {
          userId:      newUser.id,
          provider:    profile.provider,
          providerUid: profile.providerUid,
          email:       profile.email,
        },
      });

      return newUser;
    });
  }

  async logout(rawToken: string) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    const membership = await this.prisma.member.findFirst({
      where: { userId },
      include: { workspace: true },
    });

    return {
      user,
      workspace: membership?.workspace || null,
      role:      membership?.role || null,
    };
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }
    const user = await this.prisma.user.findUnique({
      where: { emailVerifyToken: token },
    });
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });
    return { success: true };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      const token = nanoid(32);
      await this.redisService.set(`password_reset:${token}`, user.id, 3600); 
      console.log(`[SIMULATED PASSWORD RESET] Reset token: ${token}`);
    }
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(token: string, password: string) {
    if (!token) {
      throw new BadRequestException('Reset token is required');
    }
    const userId = await this.redisService.get(`password_reset:${token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      await tx.refreshToken.deleteMany({
        where: { userId },
      });
    });

    await this.redisService.del(`password_reset:${token}`);

    return { success: true };
  }
}
