import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class NotificationPreferenceService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultPreferences = {
    invoice: true,
    project: true,
    task: true,
    message: true,
  };

  async getPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    if (!user.notificationPreferences) {
      return this.defaultPreferences;
    }

    return user.notificationPreferences;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: dto as any,
      },
    });

    return updatedUser.notificationPreferences;
  }
}
