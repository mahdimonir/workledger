import { IsString, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlanDetailsDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  price!: string;

  @ApiProperty()
  @IsNumber()
  numericPrice!: number;

  @ApiProperty()
  @IsString()
  frequency!: string;

  @ApiProperty()
  @IsString()
  desc!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @ApiProperty()
  @IsBoolean()
  popular!: boolean;
}
