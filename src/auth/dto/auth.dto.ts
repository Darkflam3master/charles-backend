import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
} from 'class-validator';

export class AuthLogInDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  userName: string;
}
export class AuthSignUpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @MaxLength(64, { message: 'Password must not exceed 64 characters.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain uppercase, lowercase, number, and special character.',
    },
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty()
  email: string;

  @IsDateString({}, { message: 'Invalid date format.' })
  dateOfBirth?: Date;
  twoFactorEnabled: boolean;
}
