import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  invoice: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  project: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  task: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  message: boolean;
}
