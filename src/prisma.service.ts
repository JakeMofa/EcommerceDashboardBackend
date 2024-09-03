import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit, Scope } from '@nestjs/common';
import { PrismaClient as PrismaVendo } from 'prisma/vendo/generated/vendo';
import { PrismaClient as PrismaVendoBrand } from 'prisma/brand/generated/vendoBrand';
import { PrismaClient as PrismaVendoCommerce } from 'prisma/commerce/generated/vendoCommerce';

@Injectable()
export class VendoDBService extends PrismaVendo implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

@Injectable()
export class VendoCommerceDBService extends PrismaVendoCommerce implements OnModuleInit {
  constructor() {
    super({
      log: [
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

@Injectable({ scope: Scope.REQUEST })
export class VendoBrandDBService implements OnModuleInit, OnModuleDestroy {
  client: PrismaVendoBrand;
  private logger = new Logger(VendoBrandDBService.name);
  log: any = [
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ];

  async onModuleInit() {
    this.client = new PrismaVendoBrand({
      datasources: { db: { url: process.env.DATABASE_VENDO_BRAND_URL } },
      log: this.log,
    });
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  async createDatabase(databaseName: string) {
    if (!this.client) {
      this.client = new PrismaVendoBrand({
        datasources: { db: { url: process.env.DATABASE_VENDO_BRAND_URL } },
        log: this.log,
      });
      await this.client.$connect();
    }
    await this.client.$executeRawUnsafe(`CREATE DATABASE ${databaseName};`);
  }

  async reconnect(url: string) {
    if (this.client) {
      await this.client.$disconnect();
    }
    this.client = new PrismaVendoBrand({
      datasources: { db: { url: process.env.DATABASE_URL + url } },
      log: this.log,
    });
    await this.client.$connect().then(() => console.log('connected to', url));
  }
  async reconnectMaster(url: string) {
    if (this.client) {
      await this.client.$disconnect();
    }
    this.client = new PrismaVendoBrand({
      datasources: { db: { url: process.env.DATABASE_URL + url } },
      log: this.log,
    });
    await this.client.$connect().then(() => console.log('connected to', url));
  }
  async createClient(dbName: string) {
    return new PrismaVendoBrand({
      datasources: { db: { url: process.env.DATABASE_URL + dbName } },
      log: this.log,
    });
  }

  async queryAllDatabases(databaseUrls: string[], query: string) {
    const promises = databaseUrls.map(async (url) => {
      const client = new PrismaVendoBrand({
        datasources: { db: { url: process.env.DATABASE_URL + url } },
        log: this.log,
      });
      try {
        await client.$connect();
        const result = await client.$queryRawUnsafe(query); // replace with your actual query
        this.logger.debug(`query on database ${url} ran successfully`);
        await client.$disconnect();
        return result;
      } catch (e) {
        this.logger.error(`query on database ${url} has an error:`, e);
        await client.$disconnect();
      }
    });

    const allData = await Promise.all(promises);
    return allData; // this will be an array of arrays with the results from all databases
  }

  async runFunctionOnAllDatabases(databaseUrls: string[], runFunction: any) {
    const promises = databaseUrls.map(async (url) => {
      const client = new PrismaVendoBrand({
        datasources: { db: { url: process.env.DATABASE_URL + url } },
        log: this.log,
      });
      try {
        await client.$connect();
        this.logger.debug(`Started =======> ${url}`);
        const result = await runFunction(client); // replace with your actual query
        this.logger.debug(`Function on database ${url} ran successfully`);
        await client.$disconnect();
        return result;
      } catch (e) {
        this.logger.error(`Function on database ${url} has an error:`, e);
        await client.$disconnect();
      }
    });

    const allData = await Promise.all(promises);
    return allData; // this will be an array of arrays with the results from all databases
  }

  async enableShutdownHooks(app: INestApplication) {
    this.client.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
