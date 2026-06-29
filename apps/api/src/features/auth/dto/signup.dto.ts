import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'test@workledger.io' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'strongpassword123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Moniruzzaman test' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Nova Studio' })
  @IsString()
  @IsNotEmpty()
  workspaceName!: string;
}
