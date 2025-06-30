import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule';
// import { BullService } from './bull.service';
import { log } from 'console';
import path from 'path';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../redis/redis.types';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';
import { SftpService } from '../sftp/sftp.service';

@Injectable()
export class CronJobService {
  constructor(
    @InjectQueue('transferQueue') private readonly transferQueue: Queue,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    private readonly configService: ConfigService,
    private readonly sftpService: SftpService,
  ) {}

   async processXmlFile(
    xmlFileName: string,
    xmlFileContent: any,
  ): Promise<void> {  
    await this.transferQueue.add('processXmlFile', {
      xmlFileName,
      xmlFileContent,
    });
  }
  
  @Cron(CronExpression.EVERY_30_SECONDS) // Adjust the cron expression as needed
  async handleXmlToJsonConversion() {
    const sourceFolderPath = this.configService.get(
      AppConfig.Sftp.Path,  
    ); // Replace with the actual source folder path 
    
    const filesInFolder = await this.sftpService.listFiles(sourceFolderPath);

    // Filter only XML files
    const xmlFiles = filesInFolder.filter((fileName) => {
      return path.extname(fileName).toLowerCase() === '.xml';
    });

    if (xmlFiles.length !== 0) {
      for (const xmlFileName of xmlFiles) {
        const xmlFilePath = path.join(sourceFolderPath, xmlFileName);

        if (this.configService.get(AppConfig.Features.Redis)) {
          let alreadyProcessed =
            await this.checkIfFileIsAlreadyProcessed(xmlFileName);

          // for each xml file check if there isn't the same name on the redis db
          // TO-DO: check if the file is already processed
          console.log('alreadyProcessed ', alreadyProcessed);
          
          if (alreadyProcessed) {
            log('File already processed: ' + xmlFilePath);
            continue;
          } else {
            log('Processing file: ' + xmlFilePath);
            const xmlFileContent = await this.sftpService.readFile(xmlFilePath);
            await this.processXmlFile(xmlFileName, xmlFileContent);
          }
        } else {
          log('Processing file: ' + xmlFilePath);
          const xmlFileContent = await this.sftpService.readFile(xmlFilePath);
          await this.processXmlFile(xmlFileName, xmlFileContent);
        }
      }
    }
  }

   async checkIfFileIsAlreadyProcessed(xmlFileName: string): Promise<boolean> {
    try {
      // check if the file is already processed
      // if the file is already processed return true
      // otherwise return false
      let alreadyExist = false;
      const value = await this.redisClient.get(xmlFileName);
      if (value) {
        alreadyExist = true;
      }
      return alreadyExist;
    } catch (error) {
      console.error('Error checking if file is already processed:', error);
      return false;
    }
  }
}
