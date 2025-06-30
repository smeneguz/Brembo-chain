import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class BullService {
  constructor(@InjectQueue('transferQueue') private readonly transferQueue: Queue) { }

  async processXmlFile(xmlFilePath: string): Promise<void> {
    await this.transferQueue.add('processXmlFile', { xmlFilePath });
  }

  // OLD VERSION
  async processXmlToJson(xmlFilePath: string): Promise<any> {
    await this.transferQueue.add('convertXmlToJson', { xmlFilePath });

    // Attendere il completamento del processo e ricevere i dati JSON
    return new Promise((resolve) => {
      this.transferQueue.on('completed', (_job, result) => {
        if (result) {
          resolve(result);
        }
      });
    });
  }
}