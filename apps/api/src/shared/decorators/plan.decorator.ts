import { SetMetadata } from '@nestjs/common';
import { Plan } from '@workledger/shared';

export const PLAN_KEY = 'plan';
export const RequiredPlan = (plan: Plan) => SetMetadata(PLAN_KEY, plan);
