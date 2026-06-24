import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LineItemDto {
  @ApiProperty({ example: 'Custom logo design', description: 'Item description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 1, description: 'Quantity of item' })
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiProperty({ example: 1500.00, description: 'Rate of item' })
  @IsNumber()
  @Min(0)
  rate!: number;

  @ApiProperty({ example: 15.0, description: 'Tax rate percentage', required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;
}

export class CreateProposalDto {
  @ApiProperty({ example: 'cmqpf90a60000nwzkvar0pta2', description: 'Linked client ID' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({ example: 'E-commerce Website redesign proposal' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'We are pleased to submit this proposal for your website redesign.', required: false })
  @IsString()
  @IsOptional()
  introduction?: string;

  @ApiProperty({ type: [LineItemDto], description: 'Proposal line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems!: LineItemDto[];

  @ApiProperty({ example: 500.00, required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @ApiProperty({ example: 'USD', default: 'USD', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: '2026-08-30T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  validUntil?: string;
}
