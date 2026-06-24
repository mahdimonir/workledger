import { IsEmail, IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClientHealth } from '@prisma/client';

export class CreateClientDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Acme Corp', required: false })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ example: 'billing@acme.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+1-555-0199', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'America/New_York', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({ example: 'United States', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: '123 Business Rd, Suite 100', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'US123456789', required: false })
  @IsString()
  @IsOptional()
  taxNumber?: string;

  @ApiProperty({ example: 'USD', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: ['enterprise', 'tech'], required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: 'Key account for Q3 rollout.', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ enum: ClientHealth, default: ClientHealth.ACTIVE, required: false })
  @IsEnum(ClientHealth)
  @IsOptional()
  healthStatus?: ClientHealth;
}
