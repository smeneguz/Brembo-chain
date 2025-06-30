import { IsString } from 'class-validator';

export class LoginWithCredentialsDto {
  @IsString()
  login: string;

  @IsString()
  password: string;
}
