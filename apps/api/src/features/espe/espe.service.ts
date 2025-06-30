import { Injectable, Inject, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEspePhase } from './dto/create-espe-phase.dto';
import { Builder } from 'xml2js';
import * as crypto from 'crypto';
import Web3 from 'web3';
import { SftpService } from '../sftp/sftp.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';
import { Readable } from 'stream';
import generator from 'generate-password';

@Injectable()
export class EspeService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CONTRACT') public contract: any,
    @Inject('WEB3') public web3: Web3,
    private readonly sftpService: SftpService,
    private readonly configService: ConfigService,
  ) {}

  async espeInitialization(cpd: string) {
    try {
      const passkey = generator.generate({ length: 20, numbers: true });

      return await this.prisma.espe.create({
        data: {
          cpd: cpd,
          passkey: passkey,
        },
      });
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async espeBlockchainUpload(id: number) {
    try {
      const address = this.web3.eth.accounts.wallet[0].address;
      const res = await this.contract.methods
        .createEspe()
        .send({ from: address, gas: 500000 });
      const tokenId = res.events.EspeCreated.returnValues.tokenId;
      let espe = await this.getEspe(id);
      espe.tokenId = tokenId;
      const converter = new Builder();
      const xmlEspe = converter.buildObject({ espe });
      const remotePath = `${this.configService.get(AppConfig.Sftp.PathEspe)}/espe${espe.id}.xml`;
      await this.sftpService.uploadFile(remotePath, xmlEspe);
      const hash = crypto.createHash('sha256');
      hash.update(xmlEspe);
      const hashFile = hash.digest('hex');
      await this.contract.methods
        .updateEspe(tokenId, '0x' + hashFile)
        .send({ from: address, gas: 500000 });

      return await this.prisma.espe.update({
        where: { id },
        data: {
          tokenId: parseInt(tokenId),
        },
      });
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async espeVerificationXmlFile(id: number, file: Express.Multer.File) {
    try {
      const espe = await this.prisma.espe.findUnique({
        where: { id },
        select: {
          tokenId: true,
        },
      });
      const hash = crypto.createHash('sha256');
      hash.update(file.buffer.toString());
      const hashFile = hash.digest('hex');
      const res = await this.contract.methods
        .verify(espe.tokenId, '0x' + hashFile)
        .call();
      await this.prisma.verificationXml.create({
        data: {
          status: res,
          hashToVerify: '0x' + hashFile,
          process: `espe - ${id}`,
        },
      });
      return res;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async espePhaseInitialization(espePhase: CreateEspePhase[], id: number) {
    try {
      const res = await this.prisma.espe.findFirst({
        where: {
          id: id,
        },
        include: {
          phases: true,
        },
      });
      const arrayPhase: String[] = res.phases.map((phase) => {
        return phase.phase.toString();
      });
      console.log(arrayPhase);
      espePhase.map(async (item: CreateEspePhase) => {
        if (arrayPhase.includes(item.phase.toString())) {
          console.log(true);
          //devo fare l'update
          await this.prisma.espePhase.update({
            where: { espeIdPhase: id.toString() + '-' + item.phase.toString() },
            data: {
              ...item,
            },
          });
        } else {
          console.log(false);
          //devo crearne uno nuovo
          await this.prisma.espe.update({
            where: { id: id },
            data: {
              phases: {
                create: {
                  espeIdPhase: id.toString() + '-' + item.phase.toString(),
                  ...item,
                },
              },
            },
          });
          if (item.codiceMotore != null) {
            console.log(item.codiceMotore);
            await this.prisma.espe.update({
              where: { id: id },
              data: {
                codiceMotore: item.codiceMotore,
              },
            });
          }
        }
      });
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async getAllEspe() {
    try {
      return await this.prisma.espe.findMany();
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async getEspe(id: number) {
    try {
      return await this.prisma.espe.findFirst({
        where: {
          id: id,
        },
        include: {
          phases: true,
        },
      });
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async downloadXmlEspe(id: number) {
    console.log(id);
    const fileContent = await this.sftpService.readFile(
      `${this.configService.get(AppConfig.Sftp.PathEspe)}/espe${id}.xml`,
    );
    const stream = new Readable();
    stream.push(fileContent);
    stream.push(null);
    return new StreamableFile(stream);
  }
}
