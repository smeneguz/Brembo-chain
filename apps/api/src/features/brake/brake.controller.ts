import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BrakeService } from './brake.service';
import { BrakeDto } from './dto/brake.dto';
import { EspeService } from '../espe/espe.service';

@Controller('brake')
export class BrakeController {
  constructor(
    private readonly brakeService: BrakeService,
    private readonly espeService: EspeService,
  ) {}

  @Get(':codiceMotore')
  async checkCodiceMotore(@Param('codiceMotore') codiceMotore: string) {
    return await this.brakeService.checkExistence(codiceMotore);
  }

  @Post(':codiceMotore')
  async transferOwnership(
    @Param('codiceMotore') codiceMotore: string,
    @Body('brakeDto') brakeDto: BrakeDto,
  ) {
    console.log(codiceMotore, brakeDto.passkey, brakeDto.address);
    return await this.brakeService.transferOwnership(
      codiceMotore,
      brakeDto.passkey,
      brakeDto.address,
    );
  }

  @Get('/downloadCertificate/:codiceMotore')
  async downloadCertificate(@Param('codiceMotore') codiceMotore: string) {
    return await this.brakeService.downloadBrakeCertificate(codiceMotore);
  }

  @Get('/downloadXml/:id')
  async downloadXmlEspe(@Param('id') id: number) {
    return await this.espeService.downloadXmlEspe(id + 1);
  }
}
