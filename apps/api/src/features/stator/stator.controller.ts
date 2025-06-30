import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Post,
} from '@nestjs/common';
import { CookieGuard } from '../auth/cookie.guard';
import { StatorService } from './stator.service';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../../decorators/role.decorator';
import { Role } from '../../decorators/enum/role.enum';

@Controller('stator')
@UseGuards(RolesGuard)
export class StatorController {
  constructor(private readonly statorService: StatorService) {}

  @Get()
  @UseGuards(CookieGuard)
  async getStator() {
    return await this.statorService.getStatorAll();
  }

  @Get(':idStator/:idStatorPhase/downloadXml')
  @UseGuards(CookieGuard)
  async downloadXmlStatorPhase(
    @Param('idStator') idStator: number,
    @Param('idStatorPhase') idStatorPhase: number,
  ) {
    return await this.statorService.downloadXmlFile(idStator, idStatorPhase);
  }

  @Post(':idStator/:idStatorPhase/verify')
  @UseGuards(CookieGuard)
  @Roles(Role.Admin, Role.Manager)
  @UseInterceptors(FileInterceptor('xmlFile'))
  async statorVerifyXmlFile(
    @Param('idStator') idStator: number,
    @Param('idStatorPhase') idStatorPhase: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.statorService.statorVerificationXmlFile(
      idStator,
      idStatorPhase,
      file,
    );
  }

  @Get(':id')
  @UseGuards(CookieGuard)
  async getStatorSteps(@Param('id') id: number) {
    return await this.statorService.getStatorSteps(id);
  }
}
