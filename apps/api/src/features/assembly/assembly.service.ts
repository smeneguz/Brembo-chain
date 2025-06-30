import { Injectable, Inject, StreamableFile } from '@nestjs/common';
import { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import Web3 from 'web3';
import * as crypto from 'crypto';
import { SftpService } from '../sftp/sftp.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';

@Injectable()
export class AssemblyService {
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

  async getAssemblyAll() {
    try {
      return await this.prismaService.assembly.findMany();
    } catch (err: any) {
      console.log(err);
      throw new Error(err.message);
    }
  }

  async getAssemblySteps(id: number) {
    try {
      const motorSteps = await this.prismaService.assemblyPhase.findMany({
        where: {
          assemblyId: id,
        },
      });
      return motorSteps;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async createAssembly(codiceMotore: string) {
    const fromAddress = this.web3.eth.accounts.wallet[0].address;
    return await this.contract.methods
      .createAssembly(codiceMotore)
      .send({ from: fromAddress, gas: 1500000 });
  }

  async downloadXmlFile(idAssembly: number, idAssemblyPhase: number) {
    try {
      const assembly = await this.prismaService.assembly.findFirst({
        where: { id: idAssembly },
      });

      const assemblyPhase = await this.prismaService.assemblyPhase.findFirst({
        where: { id: idAssemblyPhase },
      });

      const files = await this.sftpService.listFiles(
        this.configService.get(AppConfig.Sftp.PathProcessed),
      );

      const matchingFile = files.find(
        (file) =>
          file.includes(assemblyPhase.stazioneDiLavorazione) &&
          file.includes(assembly.codiceMotore),
      );

      const fileContent = await this.sftpService.readFile(
        this.configService.get(AppConfig.Sftp.PathProcessed) +
          '/' +
          matchingFile,
      );
      //const file = fs.createReadStream(`./misc/input/${matchingFile}`);
      const stream = new Readable();
      stream.push(fileContent);
      stream.push(null);
      return new StreamableFile(stream);
    } catch (error) {
      console.error(error);
      throw new Error(
        'Unable to download the file from the sftp server, please try again later.',
      );
    }
  }

  async updateAssemblyPhase(
    codiceMotore: string,
    codiceFlangia: string,
    phaseIndex: number,
    statoComponente: string,
    stazioneDiLavorazione: string,
    consumoEnergia: string,
    hash: string,
  ) {
    const fromAddress = this.web3.eth.accounts.wallet[0].address;
    return await this.contract.methods
      .updateAssemblyPhase(
        codiceMotore,
        codiceFlangia,
        phaseIndex,
        statoComponente,
        stazioneDiLavorazione,
        consumoEnergia,
        hash,
      )
      .send({ from: fromAddress, gas: 1500000 });
  }

  async assemblyVerificationXmlFile(
    idAssembly: number,
    idAssemblyPhase: number,
    file: Express.Multer.File,
  ) {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(file.buffer.toString());
      const hashFile = hash.digest('hex');
      const assembly = await this.prismaService.assembly.findFirst({
        where: { id: idAssembly },
      });

      const res = await this.contract.methods
        .verify(assembly.codiceMotore, idAssemblyPhase - 1, '0x' + hashFile)
        .call();

      await this.prismaService.verificationXml.create({
        data: {
          status: res,
          hashToVerify: '0x' + hashFile,
          process: `assembly - ${idAssembly} - ${idAssemblyPhase}`,
        },
      });

      return res;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}
