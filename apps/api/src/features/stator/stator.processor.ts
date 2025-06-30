import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import phases from '../bull/bull.types';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../redis/redis.types';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';
import { StatorService } from './stator.service';
import { SftpService } from '../sftp/sftp.service';

@Processor('statorQueue')
@Injectable()
export class WriteStatorProcessor {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    private readonly configService: ConfigService,
    private readonly statorService: StatorService,
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

  @Process('writeToStator')
  async handleWriteToStator(
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

      if (Stazione_di_Lavorazione === phases.statorPhases[0]) {
        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[0],
        );

        if (!isCurrentPhasePresent) {
          const receipt = await this.statorService.createStator(Codice_Motore);

          if (receipt.events.StatorCreated) {
            console.log('Stator created');
            const updateReceipt = await this.statorService.updateStatorPhase(
              Codice_Motore,
              0,
              jsonData.Dati.Dati_Generali.Stato_Componente,
              Stazione_di_Lavorazione,
              '0.09806',
              hashFile,
            );

            if (updateReceipt.events.StatorPhaseUpdated) {
              console.log('Stator phase updated');
              await this.sftpService.moveFile(sourcePath, destPath);
              await this.prisma.stators.create({
                data: {
                  codiceMotore: Codice_Motore,
                  tokenId: +receipt.events.StatorCreated.returnValues.tokenId,
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
                      consumoEnergiaMotore: 0.09806,
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
          console.log('Item with codice_motore already exists.');
          throw new Error('Item with codice_motore already exists.');
        }
      } else if (Stazione_di_Lavorazione === phases.statorPhases[1]) {
        // Check if an item with the same codice_motore exists in the previous step

        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[1],
        );

        const isPreviousPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[0],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.statorService.updateStatorPhase(
            Codice_Motore,
            1,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '1.28025',
            hashFile,
          );

          if (updateReceipt.events.StatorPhaseUpdated) {
            console.log('Stator phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.stators.update({
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
                    consumoEnergiaMotore: 1.28025,
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
            "Item with codice_motore doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with codice_motore doesn't exist in the prevoius step or this step already been register.",
          );
        }
      } else if (Stazione_di_Lavorazione === phases.statorPhases[2]) {
        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[2],
        );

        const isPreviousPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[1],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.statorService.updateStatorPhase(
            Codice_Motore,
            2,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.03795',
            hashFile,
          );

          if (updateReceipt.events.StatorPhaseUpdated) {
            console.log('Stator phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.stators.update({
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
                    consumoEnergiaMotore: 0.03795,
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
            "Item with codice_motore doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with codice_motore doesn't exist in the prevoius step or this step already been register.",
          );
        }
      } else if (Stazione_di_Lavorazione === phases.statorPhases[3]) {
        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[3],
        );

        const isPreviousPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[2],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.statorService.updateStatorPhase(
            Codice_Motore,
            3,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.59042',
            hashFile,
          );

          if (updateReceipt.events.StatorPhaseUpdated) {
            console.log('Stator phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.stators.update({
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
                    consumoEnergiaMotore: 0.59042,
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
            "Item with codice_motore doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with codice_motore doesn't exist in the prevoius step or this step already been register.",
          );
        }
      } else if (Stazione_di_Lavorazione === phases.statorPhases[4]) {
        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[4],
        );

        const isPreviousPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[3],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.statorService.updateStatorPhase(
            Codice_Motore,
            4,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.01700',
            hashFile,
          );

          if (updateReceipt.events.StatorPhaseUpdated) {
            console.log('Stator phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.stators.update({
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
                    // dataFineProcesso: new Date(jsonData.Dati.Dati_Generali.Data_Fine_Processo), NON è presente D1.1 version 4
                    consumoEnergiaMotore: 0.017,
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
            "Item with codice_motore doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with codice_motore doesn't exist in the prevoius step or this step already been register.",
          );
        }
      } else if (Stazione_di_Lavorazione === phases.statorPhases[5]) {
        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[5],
        );

        const isPreviousPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[4],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.statorService.updateStatorPhase(
            Codice_Motore,
            5,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.02556',
            hashFile,
          );

          if (updateReceipt.events.StatorPhaseUpdated) {
            console.log('Stator phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.stators.update({
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
                    consumoEnergiaMotore: 0.02556,
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
            "Item with codice_motore doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with codice_motore doesn't exist in the prevoius step or this step already been register.",
          );
        }
      } else if (Stazione_di_Lavorazione === phases.statorPhases[6]) {
        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[6],
        );

        const isPreviousPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[5],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.statorService.updateStatorPhase(
            Codice_Motore,
            6,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.30333',
            hashFile,
          );

          if (updateReceipt.events.StatorPhaseUpdated) {
            console.log('Stator phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.stators.update({
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
                    consumoEnergiaMotore: 0.30333,
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
            "Item with codice_motore doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with codice_motore doesn't exist in the prevoius step or this step already been register.",
          );
        }
      } else if (Stazione_di_Lavorazione === phases.statorPhases[7]) {
        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[7],
        );

        const isPreviousPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[6],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.statorService.updateStatorPhase(
            Codice_Motore,
            7,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.01700',
            hashFile,
          );

          if (updateReceipt.events.StatorPhaseUpdated) {
            console.log('Stator phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.stators.update({
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
                    // dataFineProcesso: new Date(jsonData.Dati.Dati_Generali.Data_Fine_Processo), NON ha la dati di fine processo come inserito sul D1.1 v4
                    consumoEnergiaMotore: 0.017,
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
            "Item with codice_motore doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with codice_motore doesn't exist in the prevoius step or this step already been register.",
          );
        }
      } else if (Stazione_di_Lavorazione === phases.statorPhases[8]) {
        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[8],
        );

        const isPreviousPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[7],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.statorService.updateStatorPhase(
            Codice_Motore,
            8,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.40994',
            hashFile,
          );
          if (updateReceipt.events.StatorPhaseUpdated) {
            console.log('Stator phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.stators.update({
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
                    consumoEnergiaMotore: 0.40994,
                    hash: hashFile,
                    lottoHousing: jsonData.Dati.Dati_Generali.Lotto_Housing,
                    lottoResina: jsonData.Dati.Dati_Generali.Lotto_Resina,
                    lottoIndurente: jsonData.Dati.Dati_Generali.Lotto_Indurente,
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
            "Item with codice_motore doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with codice_motore doesn't exist in the prevoius step or this step already been register.",
          );
        }
      } else if (Stazione_di_Lavorazione === phases.statorPhases[9]) {
        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[9],
        );

        const isPreviousPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[8],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.statorService.updateStatorPhase(
            Codice_Motore,
            9,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '3.34350',
            hashFile,
          );
          if (updateReceipt.events.StatorPhaseUpdated) {
            console.log('Stator phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.stators.update({
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
                    consumoEnergiaMotore: 3.3435,
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
            "Item with codice_motore doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with codice_motore doesn't exist in the prevoius step or this step already been register.",
          );
        }
      } else if (Stazione_di_Lavorazione === phases.statorPhases[10]) {
        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[10],
        );

        const isPreviousPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[9],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.statorService.updateStatorPhase(
            Codice_Motore,
            10,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.17233',
            hashFile,
          );
          if (updateReceipt.events.StatorPhaseUpdated) {
            console.log('Stator phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.stators.update({
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
                    consumoEnergiaMotore: 0.17233,
                    hash: hashFile,
                    lottoCuscinetti:
                      jsonData.Dati.Dati_Generali.Lotto_Cuscinetti,
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
            "Item with codice_motore doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with codice_motore doesn't exist in the prevoius step or this step already been register.",
          );
        }
      } else if (Stazione_di_Lavorazione === phases.statorPhases[11]) {
        const isCurrentPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[11],
        );

        const isPreviousPhasePresent = await this.isPhasePresent(
          Codice_Motore,
          phases.statorPhases[10],
        );

        if (isPreviousPhasePresent && !isCurrentPhasePresent) {
          const updateReceipt = await this.statorService.updateStatorPhase(
            Codice_Motore,
            11,
            jsonData.Dati.Dati_Generali.Stato_Componente,
            Stazione_di_Lavorazione,
            '0.18056',
            hashFile,
          );
          if (updateReceipt.events.StatorPhaseUpdated) {
            console.log('Stator phase updated');

            await this.sftpService.moveFile(sourcePath, destPath);
            await this.prisma.stators.update({
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
                    consumoEnergiaMotore: 0.18056,
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
            "Item with codice_motore doesn't exist in the previous step or this step already been register.",
          );
          throw new Error(
            "Item with codice_motore doesn't exist in the prevoius step or this step already been register.",
          );
        }
      } else {
        console.error(`Unsupported processType: ${Stazione_di_Lavorazione}`);
        throw new Error('Unrecognized process phase');
      }

      // If everything is successful, mark the job as completed
      console.log('Job Complete', Stazione_di_Lavorazione);

      // set the procedure after the writing procedure
      if (this.configService.get(AppConfig.Features.Redis)) {
        this.redisClient.set(xmlFileName, xmlFileName);
      }
      await job.moveToCompleted();
    } catch (error) {
      // Handle any errors that may occur during the process
      console.error('Error writing to Stator:', error);

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
