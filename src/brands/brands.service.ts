import { Injectable } from '@nestjs/common';
import { VendoBrandDBService, VendoCommerceDBService } from 'src/prisma.service';
import { DatabaseService } from './database.service';
import { Brand_status, Prisma } from 'prisma/commerce/generated/vendoCommerce';
import * as crypto from 'crypto';

@Injectable()
export class BrandsService {
  constructor(
    private brandDB: VendoBrandDBService,
    private commerceDB: VendoCommerceDBService,
    private databaseService: DatabaseService,
  ) {}

  async findAll(param: Prisma.BrandsFindManyArgs = {}) {
    const advertisers: { advertiserName: string; brandsId: number }[] = await this.commerceDB
      .$queryRaw`select distinct advertiserName, brandsId from dsp_data;`;

    const brands = await this.commerceDB.brands.findMany(param);
    return brands.map((brand) => {
      const advertiser = advertisers.find((a) => a.brandsId === brand.id);
      return { ...brand, advertiserName: advertiser?.advertiserName || '' };
    });
  }

  async findAllAdsCreds(type: 'SP-API' | 'Advertising-API' | 'all') {
    let where: object;
    switch (type) {
      case 'SP-API':
        where = { credential_type: 'SP-API' };
        break;
      case 'Advertising-API':
        where = { credential_type: 'Advertising-API' };
        break;
      default:
        where = {};
        break;
    }
    return this.brandDB.client.user_credentials.findMany({
      where,
      select: {
        id: true,
        app_id: true,
        marketplace_id: true,
        status: true,
        app_type: true,
        credential_type: true,
        marketplace: true,
        credential_details: true,
      },
    });
  }
  async softDeleteBrand({ id }) {
    return this.commerceDB.brands.update({
      where: { id },
      data: { status: Brand_status.Deleted },
    });
  }

  async findAllAdvertisername(search: string) {
    const where: Prisma.dsp_dataWhereInput = {};
    if (search) {
      where.advertiserName = { contains: search };
    }
    return this.commerceDB.dsp_data.groupBy({
      by: ['advertiserName'],
      where,
    });
  }
  async removeCredential({ id }) {
    return this.brandDB.client.user_credentials.delete({
      where: {
        id: parseInt(id),
      },
    });
  }
  async removeCategory({ id }) {
    return this.commerceDB.brandCategories.delete({
      where: {
        id,
      },
    });
  }
  async assignUserToBrand({ userId, brandId, role }) {
    const brand = await this.commerceDB.brands.findUnique({ where: { id: brandId } });
    const user = await this.commerceDB.users.findUnique({ where: { id: userId } });
    return this.commerceDB.userBrand.create({
      data: {
        brand: { connect: { id: brand?.id } },
        user: { connect: { id: user?.id } },
        role,
      },
      include: {
        brand: true,
        user: true,
      },
    });
  }

  async removeUserFromBrand({ userId, brandId }) {
    return this.commerceDB.userBrand.delete({
      where: {
        userId_brandId: {
          userId,
          brandId,
        },
      },
    });
    // return brand;
  }
  async count(filter) {
    return this.commerceDB.brands.count({
      ...filter,
      where: {
        ...filter.where,
      },
    });
  }

  async findOne(param: Prisma.BrandsFindUniqueArgs) {
    const advertisers: { advertiserName: string; brandsId: number }[] = await this.commerceDB
      .$queryRaw`select distinct advertiserName, brandsId from dsp_data;`;

    const brands = await this.commerceDB.brands.findUnique({
      ...param,
    });
    const advertiser = advertisers.find((a) => a.brandsId === brands?.id);
    return { ...brands, advertiserName: advertiser?.advertiserName || '' };
  }

  async update(param: Prisma.BrandsUpdateArgs) {
    return this.commerceDB.brands.update(param);
  }

  async userAccess(userId: number, brandId: number) {
    const brand = await this.commerceDB.userBrand.findFirstOrThrow({
      where: {
        userId,
        brandId,
      },
      include: {
        user: true,
        brand: true,
      },
    });
    return this.commerceDB.brands.findFirst({
      where: { id: brand?.brand.id, status: { not: Brand_status.Deleted } },
      include: {
        users: {
          select: { role: true, user: true },
        },
      },
    });
  }

  private generateRandomId(length: number): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  async create(param: Prisma.BrandsCreateArgs) {
    return this.commerceDB.brands.create(param);
  }

  async verify(id: number) {
    // create database
    await this.createDb(id);
    return this.commerceDB.brands.update({
      where: { id },
      data: {
        status: Brand_status.Created,
      },
    });
  }

  async approve(id: number) {
    return this.commerceDB.brands.update({
      where: { id },
      data: {
        status: Brand_status.Created,
      },
    });
  }

  async createDb(id: number) {
    const brand = await this.commerceDB.brands.findUnique({ where: { id } });
    const name = brand?.name || brand?.u_amazon_seller_name;

    const db_name = this.generateRandomId(10) + '_' + name?.replace(/[^\p{L}\p{N}]/gu, '_');
    await this.databaseService.createAndInitDatabase(db_name);
    await this.commerceDB.brands.update({
      where: { id },
      data: {
        db_name,
        status: Brand_status.Created,
      },
    });
  }

  async getBrandCategories(id: number) {
    return this.commerceDB.brands.findMany({
      where: { id },
      select: { Categories: true },
    });
  }
  async createBrandCategory(name: string, brandsId: number[]) {
    return this.commerceDB.brandCategories.create({
      data: { name, brands: { connect: brandsId.map((b) => ({ id: b })) } },
    });
  }
  async getAllCategories() {
    return this.commerceDB.brandCategories.findMany();
  }
  async assignCategoryToBrand(categoriesId: number[], brandId: number) {
    return this.commerceDB.brands.update({
      where: { id: brandId },
      data: {
        Categories: { connect: categoriesId.map((b) => ({ id: b })) },
      },
    });
  }
}
