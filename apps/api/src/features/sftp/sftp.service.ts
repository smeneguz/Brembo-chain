import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import SftpClient from 'ssh2-sftp-client';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';
import { SftpConfig } from './dto/sftp-config.dto';

@Injectable()
export class SftpService implements OnModuleInit, OnModuleDestroy {
  private sftp: SftpClient;

  constructor(private readonly configService: ConfigService) {
    this.sftp = new SftpClient();
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async createSftpConnectConfig(): Promise<SftpConfig> {
    if (this.configService.get(AppConfig.Sftp.PathKey) != '') {
      return {
        host: this.configService.get(AppConfig.Sftp.Url),
        port: this.configService.get(AppConfig.Sftp.Port),
        username: this.configService.get(AppConfig.Sftp.Username),
        privateKey: await fs.readFile(
          this.configService.get(AppConfig.Sftp.PathKey),
        ),
      };
    }
    return {
      host: this.configService.get(AppConfig.Sftp.Url),
      port: this.configService.get(AppConfig.Sftp.Port),
      username: this.configService.get(AppConfig.Sftp.Username),
      password: this.configService.get(AppConfig.Sftp.Password),
    };
  }

  async connect() {
    try {
      await this.sftp.connect(await this.createSftpConnectConfig());
      console.log('sftp connection established correctly!');
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async ensureConnection() {
    try {
      await this.sftp.list('/');
    } catch (error) {
      console.log('SFTP connection lost. Reconnecting...');
      await this.connect();
    }
  }

  async disconnect() {
    await this.sftp.end();
    console.log('Sftp connection closed!');
  }

  async listFiles(remoteFilePath: string) {
    await this.ensureConnection();
    try {
      const list = (await this.sftp.list(remoteFilePath)).map(
        (files) => files.name,
      );
      return list;
    } catch (error: any) {
      throw error;
    }
  }

  async readFile(remoteFilePath: string) {
    await this.ensureConnection();
    try {
      const data = await this.sftp.get(remoteFilePath);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async moveFile(sourcePath: string, destPath: string) {
    await this.ensureConnection();
    try {
      await this.sftp.rename(sourcePath, destPath);
    } catch (error: any) {
      console.error(error);
      throw Error(error);
    }
  }

  async uploadFile(remotePath: string, content: string) {
    await this.ensureConnection();
    try {
      await this.sftp.put(Buffer.from(content), remotePath);
    } catch (error: any) {
      throw Error(error);
    }
  }

  async uploadFileFromPath(remotePath: string, localPath: string) {
    await this.ensureConnection();
    try {
      await this.sftp.put(localPath, remotePath);
    } catch (error: any) {
      throw Error(error);
    }
  }
}
