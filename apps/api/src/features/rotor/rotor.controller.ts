import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RotorService } from './rotor.service';
import { CookieGuard } from '../auth/cookie.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../../decorators/enum/role.enum';
import { Roles } from '../../decorators/role.decorator';

@Controller('rotor')
@UseGuards(RolesGuard)
export class RotorController {
  constructor(private readonly rotorService: RotorService) {}

  //return all Stator table
  @Get()
  @UseGuards(CookieGuard)
  async getRotor() {
    return await this.rotorService.getRotorAll();
  }

  @Get(':idRotor/:idRotorPhase/downloadXml')
  @UseGuards(CookieGuard)
  async downloadXmlStatorPhase(
    @Param('idRotor') idRotor: number,
    @Param('idRotorPhase') idRotorPhase: number,
  ) {
    return await this.rotorService.downloadXmlFile(idRotor, idRotorPhase);
  }

  @Post(':idRotor/:idRotorPhase/verify')
  @UseGuards(CookieGuard)
  @Roles(Role.Admin, Role.Manager)
  @UseInterceptors(FileInterceptor('xmlFile'))
  async statorVerifyXmlFile(
    @Param('idRotor') idRotor: number,
    @Param('idRotorPhase') idRotorPhase: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.rotorService.rotorVerificationXmlFile(
      idRotor,
      idRotorPhase,
      file,
    );
  }

  //return all stator steps available for a specific statore (unique codiceMotore)
  @Get(':id')
  @UseGuards(CookieGuard)
  async getRotorSteps(@Param('id') id: number) {
    return await this.rotorService.getRotorSteps(id);
  }
}
