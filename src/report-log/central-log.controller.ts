import { Controller, UseGuards, Body, Post } from '@nestjs/common';
import { CentralLogService } from './central-log.service';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { CommerceApiCommerceCentralLogsListRequest } from '../walmart-communicator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';

@Controller('/central-report-logs')
export class CentralLogController {
  constructor(private readonly centralLog: CentralLogService) {}
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Post('list')
  async getCentralLog(@Body() data: CommerceApiCommerceCentralLogsListRequest) {
    return await this.centralLog.listCentralLogs(data);
  }
}
