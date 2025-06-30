import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CookieGuard } from '../auth/cookie.guard';
import { EspeService } from './espe.service';
import { CreateEspePhase } from './dto/create-espe-phase.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../../decorators/role.decorator';
import { Role } from '../../decorators/enum/role.enum';

@Controller('espe')
@UseGuards(RolesGuard)
export class EspeController {
  constructor(private readonly espeService: EspeService) {}

  @Post('/new/:cpd')
  @UseGuards(CookieGuard)
  @Roles(Role.Admin)
  async espeInitialization(@Param('cpd') cpd: string) {
    return await this.espeService.espeInitialization(cpd);
  }

  @Post('blockchain/:id')
  @UseGuards(CookieGuard)
  @Roles(Role.Admin)
  async espeUploadOnBlockchain(@Param('id') id: number) {
    return await this.espeService.espeBlockchainUpload(id);
  }

  @Post(':id/verify')
  @UseGuards(CookieGuard)
  @Roles(Role.Admin, Role.Manager)
  @UseInterceptors(FileInterceptor('xmlFile'))
  async espeVerifyXmlFile(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.espeService.espeVerificationXmlFile(id, file);
  }

  @Post(':id')
  @UseGuards(CookieGuard)
  @Roles(Role.Admin, Role.Manager)
  async espePhaseUpload(
    @Body() espePhase: CreateEspePhase[],
    @Param('id') id: number,
  ) {
    return await this.espeService.espePhaseInitialization(espePhase, id);
  }

  @Get()
  @UseGuards(CookieGuard)
  async getAllEspe() {
    return await this.espeService.getAllEspe();
  }

  @Get(':id/downloadXml')
  @UseGuards(CookieGuard)
  async downloadXmlEspe(@Param('id') id: number) {
    return await this.espeService.downloadXmlEspe(id);
  }

  @Get(':id')
  @UseGuards(CookieGuard)
  async getEspe(@Param('id') id: number) {
    return await this.espeService.getEspe(id);
  }
}
