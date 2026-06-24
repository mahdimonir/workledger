import { PartialType } from '@nestjs/swagger';
import { CreateProposalDto } from './create-proposal.dto';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ProposalStatus } from '@workledger/shared';

export class UpdateProposalDto extends PartialType(CreateProposalDto) {
  @IsEnum(ProposalStatus)
  @IsOptional()
  status?: ProposalStatus;

  @IsBoolean()
  @IsOptional()
  createVersion?: boolean;
}
