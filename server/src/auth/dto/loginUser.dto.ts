import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @MaxLength(16)
  username?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
