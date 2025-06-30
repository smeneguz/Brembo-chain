import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateOwnProfileDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  surname: string;

  @IsEmail()
  @IsOptional()
  email: string;
}
