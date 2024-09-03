import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as _ from 'lodash';
@Injectable()
export class ResponseSanitizerMiddleware implements NestMiddleware {
  private readonly excludeKeys: string[] = [
    'id',
    'title',
    'name',
    'parent_asin',
    'child_asin',
    'sku',
    'asin',
    'category',
    'category_id',
    'parent_category',
    'parent_category_id',
    'product_title',
    'walmart_tag',
    'walmart_campaign',
    'walmart_tag_id',
    'campaign_id',
    'walmart_tagId',
    'date_type',
    'week',
    'month',
    'year',
    'campaign',
    'start_date',
    'end_date',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    res.send = (body) => {
      try {
        body = JSON.parse(body);
        if (_.isObject(body) || _.isArray(body)) {
          body = this.transformData(body);
        }
      } catch (e) {
        console.log('response sanitizer error', e);
      }

      return originalSend.call(res, JSON.stringify(body));
    };

    next();
  }

  private transformData(data: any): any {
    if (_.isArray(data)) {
      return data.map((v) => this.transformData(v));
    } else if (_.isObject(data)) {
      return _.mapValues(data, (value, key) => {
        if (this.excludeKeys.includes(key)) {
          return value;
        }
        if (this.isStringRepresentationOfFalsy(value)) {
          return 0;
        }
        return this.isFalsyValue(value) ? 0 : this.transformData(value);
      });
    } else {
      return this.isStringRepresentationOfFalsy(data) ? 0 : data;
    }
  }

  private isFalsyValue(value: any): boolean {
    return value === null || value === undefined || Number.isNaN(value);
  }

  private isStringRepresentationOfFalsy(value: any): boolean {
    return value === 'null' || value === 'undefined' || value === 'NaN';
  }
}
