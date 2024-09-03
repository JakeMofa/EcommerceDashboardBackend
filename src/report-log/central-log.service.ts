import { Inject, Injectable } from '@nestjs/common';
import { CommerceApi, CommerceApiCommerceCentralLogsListRequest } from '../walmart-communicator';

@Injectable()
export class CentralLogService {
  constructor(@Inject('DJANGO_COMMERCE_API') private readonly commerceApi: CommerceApi) {}

  async listCentralLogs(data: CommerceApiCommerceCentralLogsListRequest) {
    const response = await this.commerceApi.commerceCentralLogsList(data);
    return response.data;
  }
}
