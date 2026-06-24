import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'mahdi@workledger.io' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'strongpassword123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Moniruzzaman Mahdi' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Nova Studio' })
  @IsString()
  @IsNotEmpty()
  workspaceName!: string;
}
