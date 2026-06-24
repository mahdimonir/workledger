import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskCommentDto {
  @ApiProperty({ example: 'I have started working on this controller.' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
