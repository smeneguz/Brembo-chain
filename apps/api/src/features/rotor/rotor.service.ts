import { Inject, Injectable, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Web3 from 'web3';
import { Readable } from 'stream';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';
import { SftpService } from '../sftp/sftp.service';

@Injectable()
export class RotorService {
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

  //return all Stator rows (not the steps!)
  async getRotorAll() {
    try {
      const res = await this.prismaService.rotors.findMany();
      return res;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async getRotorSteps(id: number) {
    try {
      const rotorSteps = await this.prismaService.rotorPhase.findMany({
        where: {
          rotorId: id,
        },
      });
      return rotorSteps;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async createRotor(codiceFlangia: string) {
    const fromAddress = this.web3.eth.accounts.wallet[0].address;
    return await this.contract.methods
      .createRotor(codiceFlangia)
      .send({ from: fromAddress, gas: 1500000 });
  }

  async downloadXmlFile(idRotor: number, idRotorPhase: number) {
    const rotor = await this.prismaService.rotors.findFirst({
      where: { id: idRotor },
    });

    const rotorPhase = await this.prismaService.rotorPhase.findFirst({
      where: { id: idRotorPhase },
    });

    const files = await this.sftpService.listFiles(this.configService.get(AppConfig.Sftp.PathProcessed));
    
    const matchingFile = files.find(
      (file) =>
        file.includes(rotorPhase.stazioneDiLavorazione) &&
        file.includes(rotor.codiceFlangia),
    );

    const fileContent = await this.sftpService.readFile(this.configService.get(AppConfig.Sftp.PathProcessed)+'/'+matchingFile)
  
      const stream = new Readable();
      stream.push(fileContent);
      stream.push(null);
      return new StreamableFile(stream);
  }

  async updateRotorPhase(
    codiceFlangia: string,
    phaseIndex: number,
    statoComponente: string,
    stazioneDiLavorazione: string,
    consumoEnergia: string,
    hash: string,
  ) {
    const fromAddress = this.web3.eth.accounts.wallet[0].address;
    return await this.contract.methods
      .updateRotorPhase(
        codiceFlangia,
        phaseIndex,
        statoComponente,
        stazioneDiLavorazione,
        consumoEnergia,
        hash,
      )
      .send({ from: fromAddress, gas: 1500000 });
  }

  async rotorVerificationXmlFile(
    idRotor: number,
    idRotorPhase: number,
    file: Express.Multer.File,
  ) {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(file.buffer.toString());
      const hashFile = hash.digest('hex');
      const rotor = await this.prismaService.rotors.findFirst({
        where: { id: idRotor },
      });

      const res = await this.contract.methods
        .verify(rotor.codiceFlangia, idRotorPhase - 1, '0x' + hashFile)
        .call();
      await this.prismaService.verificationXml.create({
        data: {
          status: res,
          hashToVerify: '0x' + hashFile,
          process: `rotor - ${idRotor} - ${idRotorPhase}`,
        },
      });
      return res;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}
