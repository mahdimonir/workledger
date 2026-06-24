import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Please check the design assets uploaded to the files tab.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false, example: 'cmqqym8j5001lnwrwhre7h8lf' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;

  @ApiProperty({ required: false, type: () => Object })
  @IsOptional()
  attachments?: any;
}
