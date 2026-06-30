import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Plan } from '@prisma/client';
import { UpdatePlanDetailsDto } from './dto/update-plan-details.dto';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlans() {
    return this.prisma.planDetail.findMany({
      orderBy: { numericPrice: 'asc' },
    });
  }

  async updatePlan(key: Plan, dto: UpdatePlanDetailsDto) {
    const plan = await this.prisma.planDetail.findUnique({
      where: { key },
    });

    if (!plan) {
      throw new NotFoundException(`Plan detail with key ${key} not found`);
    }

    return this.prisma.planDetail.update({
      where: { key },
      data: {
        name: dto.name,
        price: dto.price,
        numericPrice: dto.numericPrice,
        frequency: dto.frequency,
        desc: dto.desc,
        features: dto.features,
        popular: dto.popular,
      },
    });
  }
}
