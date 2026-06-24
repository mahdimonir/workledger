import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptProposalDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the client accepting the proposal' })
  @IsString()
  @IsNotEmpty()
  acceptedBy!: string;
}
