import { PartialType } from '@nestjs/swagger';
import { CreateMilestoneDto } from './create-milestone.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateMilestoneDto extends PartialType(CreateMilestoneDto) {
  @IsString()
  @IsOptional()
  invoiceId?: string;
}
