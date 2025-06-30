import { Injectable, Inject, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Readable } from 'stream';
import Web3 from 'web3';
import * as crypto from 'crypto';
import { SftpService } from '../sftp/sftp.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';

@Injectable()
export class StatorService {
  public web3: Web3;
  public contract: any;

  constructor(
    @Inject('WEB3') public _web3: Web3,
    @Inject('CONTRACT') public _contract: any,
    private readonly prismaService: PrismaService,
    private readonly sftpService: SftpService,
    private readonly configService: ConfigService,
  ) {
    this.web3 = _web3;
    this.contract = _contract;
  }

  async getStatorAll() {
    try {
      const res = await this.prismaService.stators.findMany();
      return res;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async getStatorSteps(id: number) {
    try {
      const statorSteps = await this.prismaService.statorPhase.findMany({
        where: {
          statorId: id,
        },
      });
      return statorSteps;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async downloadXmlFile(idStator: number, idStatorPhase: number) {
    const stator = await this.prismaService.stators.findFirst({
      where: { id: idStator },
    });

    const statorPhase = await this.prismaService.statorPhase.findFirst({
      where: { id: idStatorPhase },
    });

    const files = await this.sftpService.listFiles(this.configService.get(AppConfig.Sftp.PathProcessed));
    let searchFileName = '';
    let matchingFile;
    if (
      statorPhase.stazioneDiLavorazione == '1' ||
      statorPhase.stazioneDiLavorazione == '2'
    ) {
      searchFileName =
        '_' + statorPhase.stazioneDiLavorazione + '_' + stator.codiceMotore;
      matchingFile = files.find((file) => file.includes(searchFileName));
    } else if (
      statorPhase.stazioneDiLavorazione == 'ATRA - Incapsulamento statore'
    ) {
      searchFileName = stator.codiceMotore + '_ATRA';
      matchingFile = files.find((file) => file.includes(searchFileName));
    } else {
      matchingFile = files.find(
        (file) =>
          file.includes(statorPhase.stazioneDiLavorazione) &&
          file.includes(stator.codiceMotore),
      );
    }

      
    const fileContent = await this.sftpService.readFile(this.configService.get(AppConfig.Sftp.PathProcessed)+'/'+matchingFile)
    //const file = fs.createReadStream(`./misc/input/${matchingFile}`);
    const stream = new Readable();
    stream.push(fileContent);
    stream.push(null);
    return new StreamableFile(stream);
  }

  async createStator(codiceMotore: string) {
    const fromAddress = this.web3.eth.accounts.wallet[0].address;
    return await this.contract.methods
      .createStator(codiceMotore)
      .send({ from: fromAddress, gas: 1500000 });
  }

  async updateStatorPhase(
    codiceMotore: string,
    phaseIndex: number,
    statoComponente: string,
    stazioneDiLavorazione: string,
    consumoEnergia: string,
    hash: string,
  ) {
    const fromAddress = this.web3.eth.accounts.wallet[0].address;
    return await this.contract.methods
      .updateStatorPhase(
        codiceMotore,
        phaseIndex,
        statoComponente,
        stazioneDiLavorazione,
        consumoEnergia,
        hash,
      )
      .send({ from: fromAddress, gas: 1500000 });
  }

  async statorVerificationXmlFile(
    idStator: number,
    idStatorPhase: number,
    file: Express.Multer.File,
  ) {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(file.buffer.toString());
      const hashFile = hash.digest('hex');
      const stator = await this.prismaService.stators.findFirst({
        where: { id: idStator },
      });

      const res = await this.contract.methods
        .verify(stator.codiceMotore, idStatorPhase - 1, '0x' + hashFile)
        .call();

      await this.prismaService.verificationXml.create({
        data: {
          status: res,
          hashToVerify: '0x' + hashFile,
          process: `stator - ${idStator} - ${idStatorPhase}`,
        },
      });
      return res;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}
