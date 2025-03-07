import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  passWord: string;

  @IsString()
  @IsNotEmpty()
  userName: string;
}
