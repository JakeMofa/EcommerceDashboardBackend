import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrivateKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const privateKey = request.headers['x-api-key'];
    const VALID_PRIVATE_KEY = this.configService.get<string>('PRIVATE_KEY');
    console.log(VALID_PRIVATE_KEY, privateKey);
    if (!VALID_PRIVATE_KEY || privateKey !== VALID_PRIVATE_KEY) {
      throw new UnauthorizedException('Invalid private key');
    }

    return true;
  }
}
