import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClientSignoffDto {
  @ApiProperty({ example: true, description: 'True to approve, false to request revision' })
  @IsBoolean()
  @IsNotEmpty()
  approved!: boolean;

  @ApiProperty({ example: 'John Client', description: 'Name of the client signing off' })
  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @ApiProperty({ example: 'Please change the branding color to deep blue.', required: false, description: 'Required if rejecting / requesting revision' })
  @IsString()
  @IsOptional()
  note?: string;
}
