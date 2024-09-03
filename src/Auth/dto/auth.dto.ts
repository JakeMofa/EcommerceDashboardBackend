// import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  u_email: string;

  @ApiProperty({ example: 'password123' })
  u_password: string;

  @ApiProperty({ example: 'John' })
  u_name: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'cxsdedffd' })
  token: string;

  @ApiProperty({ example: 'newpassword123' })
  u_password: string;
}
