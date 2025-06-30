import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import xml2js from "xml2js";
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import phases from './bull.types';
import * as crypto from 'crypto';



@Processor('transferQueue')
export class ManageDataProcessor {
  constructor(@InjectQueue('statorQueue') private readonly statorQueue: Queue, @InjectQueue('rotorQueue') private readonly rotorQueue: Queue, @InjectQueue('assemblyQueue') private readonly assemblyQueue: Queue) { }

  calculateHash(fileContent: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try{
        const hash = crypto.createHash('sha256');
        hash.update(fileContent);
        resolve(hash.digest('hex'))
      } catch(error: any){
        reject(error)
      }
    });
  }

  @Process('processXmlFile')
  async handleConvertXmlToJson(job: Job<{ xmlFileName: string, xmlFileContent: any }>): Promise<any> {
    try {
      const { xmlFileName, xmlFileContent } = job.data;
     
      const xmlFileContentBuffer = Buffer.from(xmlFileContent.data)
  
      // Read and parse the XML file to JSON
      //const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');
      const jsonResult = await xml2js.parseStringPromise(xmlFileContentBuffer.toString(), { explicitArray: false });

      let hashFile = await this.calculateHash(xmlFileContentBuffer)
        .then((fileHash) => {
          return fileHash;
        })
        .catch((error) => {
          console.error('Error calculating hash:', error);
        });

      // estrai stazione di lavorazione e determina il tipo di processo 
      // considerare di fare dei check di esistenza sul json generato e sull'esistenza dello specifico campo
      const phase = jsonResult.Dati.Dati_Generali.Stazione_di_Lavorazione;
      const processType = this.determineProcessType(phase);



      switch (processType) {
        case 'stators':
          // Schedule a job to write to Stator table
          await this.statorQueue.add('writeToStator', { jsonData: jsonResult, hashFile: hashFile, xmlFileName: xmlFileName });
          break;
        case 'rotors':
          // Schedule a job to write to Rotor table
          await this.rotorQueue.add('writeToRotor', { jsonData: jsonResult, hashFile: hashFile, xmlFileName: xmlFileName });
          break;
        case 'assemblies':
          // Schedule a job to write to Assemblies table
          await this.assemblyQueue.add('writeToAssemblie', { jsonData: jsonResult, hashFile: hashFile, xmlFileName: xmlFileName });
          break;
        // Uncomment if needed
        // case 'espe':
        //   // Schedule a job to write to TableD
        //   await this.transferQueue.add('writeToTableD', { jsonData: jsonResult });
        //   break;
        default:
          // Handle other cases or default behavior
          console.error(`Unsupported processType: ${processType}`);
          throw new Error('Unrecognized process phase');

      }

    } catch (error) {
      // Handle validation or parsing errors
      console.error('Error processing XML file:', error);

      // Retry the job by re-adding it to the end of the queue
      // Adjust the delay and other options based on your requirements
    }
  }

  isStringInContainer(targetString: string, container: string[]): boolean {
    return container.includes(targetString);
  }

  // Helper function to determine the target table based on JSON data
  determineProcessType(jsonDataStation: string): string {

    let isStatorPhase = this.isStringInContainer(jsonDataStation, phases.statorPhases);
    if (isStatorPhase) {
      return 'stators';
    }

    let isRotorPhase = this.isStringInContainer(jsonDataStation, phases.rotorPhases);
    if (isRotorPhase) {
      return 'rotors';
    }

    const isassemblyPhase = this.isStringInContainer(jsonDataStation, phases.assemblyPhases);
    if (isassemblyPhase) {
      return 'assemblies';
    }


    console.log("Not a register phase");
    //// Manage if the phase is not a register phase

    throw new Error('Not a register phase');
  }


  @OnQueueFailed()
  async handleFailedJob(job: Job<any>, error: any): Promise<void> {
    // Handle the failed job, log the error, or perform any other actions
    console.error(`Job ${job.id} failed: ${error.message}`);

    // Check job.attemptsMade and job.opts.attempts
    if (job.attemptsMade < job.opts.attempts) {
      console.log(`Retrying job ${job.id}...`);
      // await job.retry();
    } else {
      console.log(`Job ${job.id} reached the maximum number of attempts.`);
    }
  }
}


