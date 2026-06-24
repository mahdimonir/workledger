import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetUploadUrlDto {
  @ApiProperty({ example: 'design_spec.pdf' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ required: false, example: 'cmqqylkzs0009nwrwa3ijeav8' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ required: false, example: 'cmqqym6v1001dnwrwm4l8016l' })
  @IsString()
  @IsOptional()
  milestoneId?: string;
}
