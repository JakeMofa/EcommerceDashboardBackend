import { Injectable, Logger } from '@nestjs/common';
// import { WalmartCampaignClient, WalmartReportClient } from 'src/walmart-reports/walmart-reports-client.service';
import { VendoCommerceDBService } from 'src/prisma.service';

import * as _ from 'lodash';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  constructor(private readonly commerceDb: VendoCommerceDBService) {}
}
