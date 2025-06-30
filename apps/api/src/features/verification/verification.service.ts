import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async getVerificationResults() {
    try {
      const success = await this.prismaService.verificationXml.count({
        where: { status: true },
      });
      const failed = await this.prismaService.verificationXml.count({
        where: { status: false },
      });
      return { success, failed };
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async getVerificationInformation(state: boolean) {
    try {
      const verificationXmlInfo =
        await this.prismaService.verificationXml.findMany({
          where: { status: state },
        });
      return verificationXmlInfo;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}
