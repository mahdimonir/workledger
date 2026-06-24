import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Plan } from '@workledger/shared';
import { PLAN_KEY } from '../decorators/plan.decorator';

const PLAN_HIERARCHY: Record<Plan, number> = {
  [Plan.FREE]: 0,
  [Plan.PRO]: 1,
  [Plan.AGENCY]: 2,
  [Plan.ENTERPRISE]: 3,
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.getAllAndOverride<Plan>(PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPlan) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.plan) {
      return false;
    }
    const userPlanLevel = PLAN_HIERARCHY[user.plan as Plan] ?? 0;
    const requiredPlanLevel = PLAN_HIERARCHY[requiredPlan] ?? 0;
    return userPlanLevel >= requiredPlanLevel;
  }
}
