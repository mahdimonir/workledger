import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordPaymentDto {
  @ApiProperty({ example: 500.00, description: 'Amount paid' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'BANK_TRANSFER', description: 'Payment method, e.g., BANK_TRANSFER, CASH, STRIPE' })
  @IsString()
  @IsNotEmpty()
  method!: string;

  @ApiProperty({ example: 'TXN-123456789', required: false, description: 'Optional transaction or receipt reference' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ example: 'Paid via direct bank transfer.', required: false, description: 'Internal payment notes' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ example: '2026-06-22T12:00:00Z', description: 'When the payment was received' })
  @IsDateString()
  paidAt!: string;
}
