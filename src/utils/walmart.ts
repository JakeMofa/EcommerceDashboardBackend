import { createParamDecorator, ExecutionContext, ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { AxiosError } from 'axios';
class WalmartConfig {
  /**
   *
   * @type {string}
   * @memberof WalmartConfigObj
   */
  'advertiser_id': string;
}

const ExtractWalmartConfig = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const result = new WalmartConfig();
  result.advertiser_id = request.advertiser_id;
  return result;
});

@Catch(AxiosError)
class WalmartExceptionFilter implements ExceptionFilter {
  catch(exception: AxiosError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.status;
    const data = exception.response?.data;
    const message = data && data['stack_trace'] ? JSON.parse(data['stack_trace']) : exception.message;

    response.status(status ?? 500).json({
      statusCode: status,
      message: message.error ?? exception.message,
    });
  }
}
export { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter };
