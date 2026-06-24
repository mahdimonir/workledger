import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEmail,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkspaceSettingsDto {
  @ApiPropertyOptional({ example: 'My Workspace' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '#2563EB' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  brandColor?: string;

  @ApiPropertyOptional({ example: 'INV' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  invoicePrefix?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  invoiceNextNum?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  defaultCurrency?: string;

  @ApiPropertyOptional({ example: 5.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  defaultTaxRate?: number;

  @ApiPropertyOptional({ example: 'US123456789' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  taxNumber?: string;

  @ApiPropertyOptional({ example: 'My Business LLC' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional({ example: 'billing@mybusiness.com' })
  @IsEmail()
  @IsOptional()
  businessEmail?: string;

  @ApiPropertyOptional({ example: '123 Main St, New York, NY' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  paymentTerms?: number;
}
