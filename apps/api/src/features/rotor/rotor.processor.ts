import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import phases from '../bull/bull.types';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../redis/redis.types';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';
import { RotorService } from './rotor.service';
import { SftpService } from '../sftp/sftp.service';

@Processor('rotorQueue')
@Injectable()
export class WriteRotorProcessor {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    private readonly configService: ConfigService,
    private readonly rotorService: RotorService,
    private readonly sftpService: SftpService,
  ) {}

  async isRotorPhasePresent(
    codiceFlangia: string,
    stazioneDiLavorazione: string,
  ): Promise<boolean> {
    const phaseItem = await this.prisma.rotorPhase.findFirst({
      where: {
        rotor: {
          codiceFlangia: codiceFlangia,
        },
        stazioneDiLavorazione: stazioneDiLavorazione,
      },
    });

    return !!phaseItem;
  }

  /*
  // For the future
  // Function to update 'updatedAt' in 'Stators' table
  async updateStatorsUpdatedAt(statorId: number): Promise<void> {
    await this.prisma.stators.update({
      where: {
        id: statorId,
      },
      data: {
        updatedAt: new Date(), // Update 'updatedAt' to the current date and time
      },
    });
  }
  */
  /**
   * Assicura che un hash sia in formato esadecimale corretto con il prefisso '0x'.
   * Se il valore non è un esadecimale valido o manca del prefisso, cerca di correggerlo.
   * @param {string} hash Il valore hash da verificare e correggere.
   * @returns {string} L'hash corretto con prefisso '0x', oppure una stringa vuota se il valore non è valido.
   */
  async ensureHexPrefix(hash: string) {
    // Rimuove lo spazio bianco e converte in minuscolo per la verifica
    let trimmedHash = hash.trim().toLowerCase();

    // Controlla se il valore inizia con '0x'. Se non inizia, prova ad aggiungerlo.
    if (!trimmedHash.startsWith('0x')) {
      trimmedHash = `0x${trimmedHash}`;
    }

    // Verifica che il valore, incluso il prefisso '0x', sia un esadecimale valido
    if (/^0x[0-9a-f]+$/i.test(trimmedHash)) {
      return trimmedHash;
    } else {
      console.warn('The value provided is not a valid hexadecimal hash:', hash);
      return ''; // Ritorna una stringa vuota o gestisci come meglio credi
    }
  }

  @Process('writeToRotor')
  async handleWriteToRotor(
    job: Job<{ jsonData: any; hashFile: string; xmlFileName: string }>,
  ): Promise<any> {
    try {
      let { jsonData, hashFile, xmlFileName } = job.data;

      const Stazione_di_Lavorazione =
        jsonData.Dati.Dati_Generali.Stazione_di_Lavorazione;
      hashFile = await this.ensureHexPrefix(hashFile);

      const sourcePath =
        this.configService.get(AppConfig.Sftp.Path) + '/' + xmlFileName;
      const destPath =
        this.configService.get(AppConfig.Sftp.PathProcessed) +
        '/' +
        xmlFileName;

      if (Stazione_di_Lavorazione === phases.rotorPhases[0]) {
        // Porto all'interno questa assegnazione perchè step diversi del rotore hanno nomi diversi per il campo Flangia
        const Codice_Flangia = jsonData.Dati.Dati_Generali.SerialNumberFlangia;

        const isCurrentPhasePresent = await this.isRotorPhasePresent(
          Codice_Flangia,
          phases.rotorPhases[0],
        );

        if (!isCurrentPhasePresent) {
          const receipt = await this.rotorService.createRotor(Codice_Flangia);
          if (receipt.events.RotorCreated) {
            console.log('Rotor created');
            const updateReceipt = await this.rotorService.updateRotorPhase(
              Codice_Flangia,
              0,
              jsonData.Dati.Dati_Generali.Stato_Componente,
              Stazione_di_Lavorazione,
              '0.13467',
              hashFile,
            );

            if (updateReceipt.events.RotorPhaseUpdated) {
              console.log('Rotor Phase updated');

              await this.sftpService.moveFile(sourcePath, destPath);
              await this.prisma.rotors.create({
                data: {
                  codiceFlangia: Codice_Flangia,
                  tokenId: +receipt.events.RotorCreated.returnValues.tokenId,
                  phases: {
                    create: {
                      statoComponente:
                        jsonData.Dati.Dati_Generali.Stato_Componente,
                      stazioneDiLavorazione: Stazione_di_Lavorazione,
                      dataInizioProcesso: new Date(
                        jsonData.Dati.Dati_Generali.Data_Inizio_Processo,
                      ),
                      dataFineProcesso: new Date(
                        jsonData.Dati.Dati_Generali.Data_Fine_Processo,
                      ),
                      lottoFlangia: jsonData.Dati.Dati_Generali.Lotto_flangia,
                      lottoCuscinetto:
                        jsonData.Dati.Dati_Generali.Lotto_cuscinetto,
                      lottoPCB: jsonData.Dati.Dati_Generali.Lotto_PCB,
                      consumoEnergiaMotore: 0.13467,
                      hash: hashFile,
                    },
                  },
                },
                include: {
                  phases: true,
                },
              });
            }
          }
        } else {
          console.log('Item with Codice_Flangia already exists.');
          throw new Error('Item with Codice_Flangia already exists.');
        }
      } else if (Stazione_di_Lavorazione === phases.rotorPhases[1]) {
        // Porto all'interno questa assegnazione perchè step diversi del rotore hanno nomi diversi per il campo Flangia
        const Codice_Flangia = jsonData.Dati.Dati_Generali.Codice_Flangia;

        const isCurrentPhasePresent = await this.isRotorPhasePresent(
          Codice_Flangia,
          phases.rotorPhases[1],
        );

        const isPreviousPhasePresent = await this.isRotorPhasePresent(
          Codice_Flangia,
          phases.rotorPhases[0],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.rotorService.updateRotorPhase(
            Codice_Flangia,
            1,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.57994',
            hashFile,
          );

          if (updateReceipt.events.RotorPhaseUpdated) {
            console.log('Rotor Phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.rotors.update({
              where: {
                codiceFlangia: Codice_Flangia,
              },
              data: {
                phases: {
                  create: {
                    statoComponente:
                      jsonData.Dati.Dati_Generali.Stato_Componente,
                    stazioneDiLavorazione: Stazione_di_Lavorazione,
                    dataInizioProcesso: new Date(
                      jsonData.Dati.Dati_Generali.Data_Inizio_Processo,
                    ),
                    dataFineProcesso: new Date(
                      jsonData.Dati.Dati_Generali.Data_Fine_Processo,
                    ),
                    lottoFlangia: jsonData.Dati.Dati_Generali.Lotto_flangia,
                    lottoCuscinetto:
                      jsonData.Dati.Dati_Generali.Lotto_cuscinetto,
                    lottoPCB: jsonData.Dati.Dati_Generali.Lotto_PCB,

                    consumoEnergiaMotore: 0.57994,
                    hash: hashFile,
                  },
                },
              },
              include: {
                phases: true,
              },
            });
          }
        } else {
          console.log(
            "Item with Codice_Flangia doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with Codice_Flangia doesn't exist in the previous step or this step already been register.",
          );
        }
      } else {
        console.error(`Unsupported processType: ${Stazione_di_Lavorazione}`);
        throw new Error('Unrecognized process phase');
      }

      // If everything is successful, mark the job as completed
      console.log('Job Complete', Stazione_di_Lavorazione);

      if (this.configService.get(AppConfig.Features.Redis)) {
        // Set redis queue after the write procedure
        this.redisClient.set(xmlFileName, xmlFileName);
      }

      await job.moveToCompleted();
    } catch (error) {
      // Gestisci eventuali errori
      console.error('Error writing to Rotor:', error);
      await job.moveToFailed({ message: error.toString() }); // capire bene come viene gestito il moveToFailed e il tempo di ritorno
    } finally {
      await this.prisma.$disconnect(); // Close the Prisma connection
    }
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
