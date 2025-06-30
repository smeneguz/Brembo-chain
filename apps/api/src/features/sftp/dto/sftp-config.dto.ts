import { IsOptional } from 'class-validator';

export class SftpConfig {
  host: string;
  port: number;
  username: string;
  @IsOptional()
  privateKey?: Buffer;
  @IsOptional()
  password?: string;
}
