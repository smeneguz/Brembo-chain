import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AssemblyService } from './assembly.service';
import { CookieGuard } from '../auth/cookie.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../../decorators/role.decorator';
import { Role } from '../../decorators/enum/role.enum';

@Controller('assembly')
@UseGuards(RolesGuard)
export class AssemblyController {
  constructor(private readonly assemblyService: AssemblyService) {}

  @Get()
  @UseGuards(CookieGuard)
  async getAssembly() {
    return await this.assemblyService.getAssemblyAll();
  }

  @Get(':idAssembly/:idAssemblyPhase/downloadXml')
  @UseGuards(CookieGuard)
  async downloadXmlStatorPhase(
    @Param('idAssembly') idAssembly: number,
    @Param('idAssemblyPhase') idAssemblyPhase: number,
  ) {
    return await this.assemblyService.downloadXmlFile(
      idAssembly,
      idAssemblyPhase,
    );
  }

  @Post(':idAssembly/:idAssemblyPhase/verify')
  @UseGuards(CookieGuard)
  @Roles(Role.Admin, Role.Manager)
  @UseInterceptors(FileInterceptor('xmlFile'))
  async statorVerifyXmlFile(
    @Param('idAssembly') idAssembly: number,
    @Param('idAssemblyPhase') idAssemblyPhase: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.assemblyService.assemblyVerificationXmlFile(
      idAssembly,
      idAssemblyPhase,
      file,
    );
  }

  @Get(':id')
  @UseGuards(CookieGuard)
  async getAssemblySteps(@Param('id') id: number) {
    return await this.assemblyService.getAssemblySteps(id);
  }
}
