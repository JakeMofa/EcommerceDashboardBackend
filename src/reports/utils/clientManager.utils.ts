import * as process from 'process';

export class ClientManagerUtils {
  getClientInfoByMarketPlace(marketPlace: string) {
    switch (marketPlace) {
      case 'A2EUQ1WTGCTBG2':
      case 'ATVPDKIKX0DER':
      case 'A1AM78C64UM0Y8':
      case 'A2Q3Y263D00KWC':
      case 'CA':
      case 'US':
      case 'MX':
      case 'BR':
        return this.getNAClientInfo();
      case 'A1RKKUPIHCS9HS':
      case 'A1F83G8C2ARO7P':
      case 'A13V1IB3VIYZZH':
      case 'AMEN7PMS3EDWL':
      case 'A1805IZSGTT6HS':
      case 'A1PA6795UKMFR9':
      case 'APJ6JRA9NG5V4':
      case 'A2NODRKZP88ZB9':
      case 'AE08WJ6YKNBMC':
      case 'A1C3SOZRARQ6R3':
      case 'ARBP9OOSHTCHU':
      case 'A33AVAJ2PDY3EV':
      case 'A17E79C6D8DWNP':
      case 'A2VIGQ35RCS4UG':
      case 'A21TJRUUN4KGV':
      case 'ES':
      case 'UK':
      case 'FR':
      case 'BE':
      case 'NL':
      case 'DE':
      case 'IT':
      case 'SE':
      case 'ZA':
      case 'PL':
      case 'EG':
      case 'TR':
      case 'SA':
      case 'AE':
      case 'IN':
        return this.getEuropeClientInfo();
      default:
        return null;
    }
  }

  private getNAClientInfo() {
    return {
      clientId: this.getOrThrowFromEnv('NA_CLIENT_ID'),
      clientSecret: this.getOrThrowFromEnv('NA_CLIENT_SECRET'),
      sellerName: this.getOrThrowFromEnv('SELLER_NAME'),
    };
  }

  private getEuropeClientInfo() {
    return {
      clientId: this.getOrThrowFromEnv('EU_CLIENT_ID'),
      clientSecret: this.getOrThrowFromEnv('EU_CLIENT_SECRET'),
      sellerName: this.getOrThrowFromEnv('SELLER_NAME'),
    };
  }

  private getOrThrowFromEnv(name: string) {
    const value = process.env[name];
    if (!value) {
      throw new Error(`${name} does not exists on environment variables!`);
    }
    return value;
  }
}
