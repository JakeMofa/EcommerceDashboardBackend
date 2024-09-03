import { Injectable } from '@nestjs/common';
import { PaginationOptions } from 'src/middlewares/pagination.middleware';
import { VendoBrandDBService } from '../prisma.service';
import { Prisma } from 'prisma/commerce/generated/vendoCommerce';
import dayjs from 'src/utils/date.util';
import * as _ from 'lodash';

@Injectable()
export class ReportLogService {
  constructor(private readonly brandDbService: VendoBrandDBService) {}

  async findAll(
    marketplace: string,
    reportType: string,
    reportRequestStatus: string,
    startDate: string,
    endDate: string,
    pagination: PaginationOptions,
  ) {
    const { page, limit, order, orderBy } = pagination;

    const filter = {
      where: {
        AND: [
          reportRequestStatus === '0' ? { status: { equals: 0 } } : {},
          marketplace ? { marketplace: { contains: marketplace } } : {},
          reportType ? { report_type: { equals: reportType } } : {},
          reportRequestStatus ? { report_request_status: { equals: parseInt(reportRequestStatus) } } : {},
          startDate ? { created_at: { gte: dayjs(startDate).valueOf() } } : {},
          endDate ? { created_at: { lte: dayjs(endDate).endOf('day').valueOf() } } : {},
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ [orderBy]: order as Prisma.SortOrder }],
    };

    const items = await this.brandDbService.client.report_log.findMany(filter);
    const count = await this.count({ where: filter.where });

    return { items: items, count: count };
  }

  async count(param: {}) {
    return await this.brandDbService.client.report_log.count(param);
  }

  async getTableData(values, key, table, column) {
    const val = (
      await this.brandDbService.client.$queryRawUnsafe(`
      SELECT ${column}
      FROM ${table}
      ORDER BY ${column} DESC
      LIMIT 1
    `)
    )?.[0]?.[column];

    values[key].push(val ? (column === 'report_date' ? val.getTime() : val) : 0);
  }

  async summary() {
    const values = {
      sales: [],
      customer_acquisition: [],
      ads: [],
    };

    const promises = [
      this.getTableData(values, 'sales', 'asin_business_report', 'updated_at'),
      this.getTableData(values, 'customer_acquisition', 'get_amazon_fulfilled_shipments_data_general', 'updated_at'),
      this.getTableData(values, 'ads', 'advertising_manual_report', 'report_date'),
      this.getTableData(values, 'ads', 'advertising_product_report', 'created_at'),
      this.getTableData(values, 'ads', 'advertising_brands_video_campaigns_report', 'created_at'),
      this.getTableData(values, 'ads', 'advertising_display_campaigns_report', 'created_at'),
    ];

    await Promise.all(promises);

    return {
      sales: values.sales[0],
      customer_acquisition: values.customer_acquisition[0],
      ads: _.max(values.ads),
    };
  }
}
