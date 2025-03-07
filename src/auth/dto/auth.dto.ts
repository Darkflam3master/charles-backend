import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class AuthLogInDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  userName: string;
}
export class AuthSignUpDto extends AuthLogInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
