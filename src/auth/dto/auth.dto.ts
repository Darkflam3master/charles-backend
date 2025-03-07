import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class AuthLogInDto {
  @IsString()
  @IsNotEmpty()
  passWord: string;

  @IsString()
  @IsNotEmpty()
  userName: string;
}
export class AuthSignUpDto extends AuthLogInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
