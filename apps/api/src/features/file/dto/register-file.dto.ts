import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterFileDto {
  @ApiProperty({ example: 'design_spec.pdf' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'workspaces/123/projects/456/design_spec.pdf' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/cloud/raw/upload/workspaces/123/projects/456/design_spec.pdf' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ example: 102456 })
  @IsNumber()
  sizeBytes: number;

  @ApiProperty({ required: false, example: 'cmqqylkzs0009nwrwa3ijeav8' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ required: false, example: 'cmqqym6v1001dnwrwm4l8016l' })
  @IsString()
  @IsOptional()
  milestoneId?: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDeliverable?: boolean;
}
