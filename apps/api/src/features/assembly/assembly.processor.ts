import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import phases from '../bull/bull.types';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../redis/redis.types';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';
import { AssemblyService } from './assembly.service';
import { SftpService } from '../sftp/sftp.service';

@Processor('assemblyQueue')
@Injectable()
export class WriteAssemblyProcessor {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    private readonly configService: ConfigService,
    private readonly assemblyService: AssemblyService,
    private readonly sftpService: SftpService,
  ) {}

  async isPhasePresent(
    codiceMotore: string,
    stazioneDiLavorazione: string,
  ): Promise<boolean> {
    const phaseItem = await this.prisma.statorPhase.findFirst({
      where: {
        stator: {
          codiceMotore: codiceMotore,
        },
        stazioneDiLavorazione: stazioneDiLavorazione,
      },
    });

    return !!phaseItem;
  }

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

  async isAssemblyPhasePresent(
    codiceMotore: string,
    stazioneDiLavorazione: string,
  ): Promise<boolean> {
    const phaseItem = await this.prisma.assemblyPhase.findFirst({
      where: {
        assembly: {
          codiceMotore: codiceMotore,
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

  @Process('writeToAssemblie')
  async handleWriteToAssemblie(
    job: Job<{ jsonData: any; hashFile: string; xmlFileName: string }>,
  ): Promise<any> {
    try {
      let { jsonData, hashFile, xmlFileName } = job.data;

      const Codice_Motore = jsonData.Dati.Dati_Generali.Codice_Motore;
      const Stazione_di_Lavorazione =
        jsonData.Dati.Dati_Generali.Stazione_di_Lavorazione;
      const sourcePath =
        this.configService.get(AppConfig.Sftp.Path) + '/' + xmlFileName;
      const destPath =
        this.configService.get(AppConfig.Sftp.PathProcessed) +
        '/' +
        xmlFileName;

      hashFile = await this.ensureHexPrefix(hashFile);
      let Codice_Flangia = '';

      if (Stazione_di_Lavorazione === phases.assemblyPhases[0]) {
        // Qua solo perchè è presente soltato nel primo step dell'assembly
        Codice_Flangia = jsonData.Dati.Dati_Generali.Codice_Flangia;

        const isCurrentPhasePresent = await this.isAssemblyPhasePresent(
          Codice_Motore,
          phases.assemblyPhases[0],
        );

        const isStatorFinished = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[11],
        );

        const isRotorFinished = await this.isRotorPhasePresent(
          Codice_Flangia,
          phases.rotorPhases[1],
        );

        if (!isCurrentPhasePresent && isStatorFinished && isRotorFinished) {
          const receipt =
            await this.assemblyService.createAssembly(Codice_Motore);

          if (receipt.events.AssemblyCreated) {
            console.log('Assembly created');
            const updateReceipt =
              await this.assemblyService.updateAssemblyPhase(
                Codice_Motore,
                Codice_Flangia,
                0,
                jsonData.Dati.Dati_Generali.Stato_Componente,
                Stazione_di_Lavorazione,
                '0.19750',
                hashFile,
              );

            if (updateReceipt.events.AssemblyPhaseUpdated) {
              console.log('Assembly Phase updated');

              await this.sftpService.moveFile(sourcePath, destPath);
              await this.prisma.assembly.create({
                data: {
                  codiceMotore: Codice_Motore,
                  tokenId:
                    +receipt.events.AssemblyCreated.returnValues.assemblyId,
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
                      lottoOR: jsonData.Dati.Dati_Generali.Lotto_OR,
                      lottoScrew: jsonData.Dati.Dati_Generali.Lotto_Screw,
                      codiceFlangia: jsonData.Dati.Dati_Generali.Codice_Flangia,
                      consumoEnergiaMotore: 0.1975,
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
          console.log(
            'Item with codice_motore already been registered or miss the final pieces Rotor and/or Stator.',
          );
          throw new Error(
            'Item with codice_motore already been registered or miss the final pieces Rotor and/or Stator.',
          );
        }
      } else if (Stazione_di_Lavorazione === phases.assemblyPhases[1]) {
        const isCurrentPhasePresent = await this.isAssemblyPhasePresent(
          Codice_Motore,
          phases.assemblyPhases[1],
        );

        const isPreviousPhasePresent = await this.isAssemblyPhasePresent(
          Codice_Motore,
          phases.assemblyPhases[0],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.assemblyService.updateAssemblyPhase(
            Codice_Motore,
            Codice_Flangia,
            1,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.05056',
            hashFile,
          );

          if (updateReceipt.events.AssemblyPhaseUpdated) {
            console.log('Assembly Phase updated');
            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.assembly.update({
              where: {
                codiceMotore: Codice_Motore,
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
                    consumoEnergiaMotore: 0.05056,
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
            'Item with codice_motore already been registered or miss the previous step.',
          );
          throw new Error(
            'Item with codice_motore already been registered or miss the previous step.',
          );
        }
      } else if (Stazione_di_Lavorazione === phases.assemblyPhases[2]) {
        const isCurrentPhasePresent = await this.isAssemblyPhasePresent(
          Codice_Motore,
          phases.assemblyPhases[2],
        );

        const isPreviousPhasePresent = await this.isAssemblyPhasePresent(
          Codice_Motore,
          phases.assemblyPhases[1],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.assemblyService.updateAssemblyPhase(
            Codice_Motore,
            Codice_Flangia,
            2,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.25000',
            hashFile,
          );

          if (updateReceipt.events.AssemblyPhaseUpdated) {
            console.log('Assembly Phase updated');
            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.assembly.update({
              where: {
                codiceMotore: Codice_Motore,
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
                    consumoEnergiaMotore: 0.25,
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
            'Item with codice_motore already been registered or miss the previous step.',
          );
          throw new Error(
            'Item with codice_motore already been registered or miss the previous step.',
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
      console.error('Error writing to Assembly:', error);
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
