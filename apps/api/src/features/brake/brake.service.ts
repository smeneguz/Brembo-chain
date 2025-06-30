import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Web3 from 'web3';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { SftpService } from '../sftp/sftp.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';
import path from 'path';
import { Readable } from 'stream';

@Injectable()
export class BrakeService {
  // consumo energetico dei singoli step insieme
  energyConsumption: number[] = [
    0.09806, 1.28025, 0.03795, 0.59042, 0.017, 0.02556, 0.30333, 0.017, 0.40994,
    3.3435, 0.17233, 0.18056, 0.13467, 0.57994, 0.1975, 0.05056, 0.25,
  ];

  readonly energyBrake: number;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('CONTRACT_BRAKE') public contract_brake: any,
    @Inject('WEB3_PUB') public web3_pub: Web3,
    @Inject('WEB3') public web3: Web3,
    @Inject('CONTRACT') public contract_espe: any,
    private readonly sftp: SftpService,
    private readonly configService: ConfigService,
  ) {
    this.energyBrake = this.calculateAverage(this.energyConsumption);
  }

  private calculateAverage(values: number[]): number {
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return sum / values.length;
  }

  private getRandomEnergy(): string {
    const lowerBound = this.energyBrake * 0.9; // media - 10%
    const upperBound = this.energyBrake * 1.1; // media + 10%
    return (Math.random() * (upperBound - lowerBound) + lowerBound)
      .toFixed(5)
      .toString();
  }

  async checkExistence(codiceMotore: string) {
    try {
      const espe = await this.prisma.espe.findUnique({
        where: { codiceMotore },
      });

      if (!espe || espe.tokenId == undefined) {
        // controllo su tokenId per capire se è almeno stato caricato su chain privata
        throw new Error('Motor Code is not valid!');
      }
      const hash = await this.contract_espe.methods
        .getEspe(espe.tokenId)
        .call();
      const energy: string = this.getRandomEnergy();
      const address = this.web3_pub.eth.accounts.wallet[0].address;
      const testnetCheck = await this.contract_brake.methods
        .checkExistenceToken(codiceMotore)
        .call({ from: address });
      if (testnetCheck == false) {
        await this.contract_brake.methods
          .createBrakeEspe(
            codiceMotore,
            //string consumoEnergia; // random tra valori medi di tutte le altre macchine (10% di variabilità)
            energy,
            // bytes32 hash;
            hash.hash,
            // string createdAt; // time piece was created
            '' +
              espe.createdAt.getFullYear() +
              '/' +
              String(espe.createdAt.getMonth() + 1).padStart(2, '0') +
              '/' +
              String(espe.createdAt.getDate()).padStart(2, '0') +
              ' ' +
              String(espe.createdAt.getHours()).padStart(2, '0') +
              ':' +
              String(espe.createdAt.getMinutes()).padStart(2, '0') +
              ':' +
              String(espe.createdAt.getSeconds()).padStart(2, '0'), //
            //string pfc;
            espe.cpd,
          )
          .send({ from: address, gas: 500000 })
          .on('receipt', function (receipt: any) {
            console.log(receipt.events.BrakeCreated.returnValues);
          });

        return false; // sta a indicare che non era sulla pubblica e quindi sono andato a metterlo
      }

      return true; // sta a indicare che era già sulla pubblica
    } catch (err: any) {
      console.log(err.message);
      throw new HttpException({ message: err.message }, HttpStatus.NOT_FOUND);
    }
  }

  async transferOwnership(
    codiceMotore: string,
    passkey: string,
    address: string,
  ) {
    try {
      await this.checkExistence(codiceMotore);
      const _passkey = await this.prisma.espe.findUnique({
        where: { codiceMotore },
        select: { passkey: true },
      });

      if (_passkey.passkey != passkey) {
        throw new Error('Passkey inserted is not the right one!');
      }
      const contractOwner = this.web3_pub.eth.accounts.wallet[0].address;
      // trasferisco la ownership all'owner dell'nft
      await this.contract_brake.methods
        .transferOwnership(address, codiceMotore)
        .send({ from: contractOwner, gas: 500000 });
      // prendo le informazioni degli nft di cui ora addresso dovrebbe essere diventato l'owner
      const brake: Array<any> = await this.contract_brake.methods
        .getOwnershipBrake(address)
        .call();
      // ATTENZIONE! Più di uno ma io devo prendere solo quello che ha codiceMotore uguale a quello che si trova in questa funzione
      const brakeSingle = brake.find(
        (brake: any) => brake.codiceMotore == codiceMotore,
      );
      if (!brakeSingle) {
        throw new Error(
          `Unable to find ${codiceMotore} in nfts of ${address} user`,
        );
      }
      const filePath = `/tmp/certificate-${codiceMotore}.pdf`; // Percorso temporaneo
      await this.generateCertificatePDF({
        brakeSingle,
        address,
        filePath,
      });

      //carico il file sull'sftp
      await this.sftp.uploadFileFromPath(
        `${this.configService.get(AppConfig.Sftp.PathCertificate)}/certificate-${codiceMotore}.pdf`,
        filePath,
      );
      fs.unlinkSync(filePath);
    } catch (err: any) {
      throw new HttpException({ message: err.message }, HttpStatus.BAD_REQUEST);
    }
  }

  async downloadBrakeCertificate(codiceMotore: string) {
    const fileContent = await this.sftp.readFile(
      `${this.configService.get(AppConfig.Sftp.PathCertificate)}/certificate-${codiceMotore}.pdf`,
    );
    const stream = new Readable();
    stream.push(fileContent);
    stream.push(null);
    return new StreamableFile(stream);
  }

  private async generateCertificatePDF(data: {
    brakeSingle: any;
    address: string;
    filePath: string;
  }) {
    return new Promise<void>((resolve, reject) => {
      const { brakeSingle, address, filePath } = data;

      const doc = new PDFDocument({
        size: 'A4', // Formato del foglio
        margins: { top: 50, left: 50, right: 50, bottom: 50 }, // Margini
      });

      const logoPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'public',
        'brembo.png',
      );

      // Salva il PDF su un file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = 595.28; // Larghezza A4 in punti
      const logoWidth = 150; // Dimensione del logo
      const logoHeight = 50; // Altezza del logo

      doc.image(logoPath, (pageWidth - logoWidth) / 2, 50, {
        width: logoWidth,
        height: logoHeight,
      }); // Posiziona al centro

      // Aggiungi uno spazio dopo il logo
      doc.moveDown(5);

      // Contenuto del PDF
      doc
        .fontSize(20)
        .text('Certificate of Product Ownership and Production Traceability', {
          align: 'center',
        })
        .moveDown();

      doc.text(`Token ID: ${brakeSingle.tokenId}`).moveDown();
      doc.text(`Codice Motore: ${brakeSingle.codiceMotore}`).moveDown();
      doc.text(`Energy Consumption: ${brakeSingle.consumoEnergia}`).moveDown();
      doc.text(`Hash: ${brakeSingle.hash}`).moveDown();
      doc.text(`Date: ${brakeSingle.createdAt}`).moveDown();
      doc.text(`PFL: ${brakeSingle.cpd}`).moveDown();

      doc.text(`New Owner Address: ${address}`).moveDown();

      doc.text(`Transfer Date: ${new Date().toLocaleString()}`).moveDown();

      // Chiudi il documento
      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', (err: any) => reject(err));
    });
  }
}
