import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { RoleGuard, Roles } from 'src/Auth/guards/role.guard';
import { Brand_status, Prisma, Role } from 'prisma/commerce/generated/vendoCommerce';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CreateBrandDto } from './dto/create-brand.dto';
import {
  ApiPagination,
  Pagination,
  PaginationInterceptor,
  PaginationOptions,
} from 'src/middlewares/pagination.middleware';
import * as _ from 'lodash';
import { BrandAccessMiddleware, db_write } from 'src/middlewares/brandAccess.middleware';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
@ApiBearerAuth('access-token')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @CheckAbility('admin')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @ApiPagination()
  @UseInterceptors(PaginationInterceptor)
  @Get('/all')
  async findAll(
    @Req() req: any,
    @Query('search') search: string,
    @Query('status') status: Brand_status = Brand_status.Created,
    @Query('source') source: 'Amazon' | 'Walmart',
    @Query('include', new ParseArrayPipe({ items: String, separator: ',', optional: true }))
    include: Array<'categories' | 'users' | 'AMs'>,
    @Pagination() pagination: PaginationOptions,
  ) {
    if (req.user?.role === 'Walmart_admin') {
      source = 'Walmart';
    } else if (req.user?.role === 'Amazon_admin') {
      source = 'Amazon';
    }
    const { page, limit, order, orderBy } = pagination;
    const filter: Prisma.BrandsFindManyArgs = {
      skip: (page - 1) * limit,
      take: limit,
      where: search
        ? {
            OR: [{ name: { contains: search } }, { u_amazon_seller_name: { contains: search } }],
            AND: [{ status: { equals: status } }, source ? { brand_source: { equals: source } } : {}],
          }
        : {
            AND: [{ status: { equals: status } }, source ? { brand_source: { equals: source } } : {}],
          },
      orderBy: [{ [orderBy]: order as Prisma.SortOrder }],
      ...(include && include.length > 0
        ? {
            include: {
              Categories: include.includes('categories'),
              ...(include.includes('users') ? { users: { include: { user: true } } } : {}),
              ...(include.includes('AMs') ? { account_manager: true } : {}),
            },
          }
        : {}),
    };
    const brands = await this.brandsService.findAll(filter);
    const count = await this.brandsService.count(_.omit(filter, ['skip', 'take', 'orderBy', 'include']));
    return { items: brands, page, limit, count, order, orderBy };
  }

  @CheckAbility('admin')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(PaginationInterceptor)
  @Get('/advertisers')
  async findAllAdvertiserNames(@Query('search') search: string) {
    const brands = await this.brandsService.findAllAdvertisername(search);
    return brands;
  }

  @ApiBody({ type: CreateBrandDto })
  @ApiQuery({
    name: 'createdb',
    required: false,
    type: Boolean,
    description: 'create database for brand',
  })
  @CheckAbility('admin')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Post()
  async create(@Req() req, @Body() body: Prisma.BrandsCreateInput, @Query('createdb') createdb: boolean) {
    const brand = await this.brandsService.create({
      data: {
        ...body,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      },
    });
    if (createdb) {
      return await this.brandsService.verify(brand.id);
    }
    return brand;
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Post('/category')
  async createCategory(
    @Body() body: { name: string },
    @Query('brandIds', new ParseArrayPipe({ items: Number, separator: ',' })) brandIds: number[],
  ) {
    return await this.brandsService.createBrandCategory(body.name, brandIds);
  }
  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/category')
  async getCategories() {
    return await this.brandsService.getAllCategories();
  }
  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Delete('/category/:categoryId')
  async deleteCategories(@Param('brandId', ParseIntPipe) id: number) {
    return await this.brandsService.removeCategory({ id });
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Put('/:brandId/category/:categoriesId')
  async assingCategories(
    @Param('brandId', ParseIntPipe) id: number,
    @Param('categoriesId', new ParseArrayPipe({ items: Number, separator: ',' })) categoriesId: number[],
  ) {
    return this.brandsService.update({
      where: { id },
      data: { Categories: { connect: categoriesId.map((cat) => ({ id: cat })) } },
    });
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Delete('/:brandId/category/:categoriesId')
  async unassignCategories(@Param('brandId') id: string, @Param('categoriesId') categoryId: string) {
    return this.brandsService.update({
      where: { id: Number(id) },
      data: { Categories: { disconnect: [{ id: Number(categoryId) }] } },
    });
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('/:brandId/category')
  async getBrandCategory(@Param('brandId', ParseIntPipe) id: number) {
    return this.brandsService.findOne({
      where: { id },
      select: {
        Categories: true,
      },
    });
  }

  @CheckAbility('admin')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/account-managers')
  async getAllAccountManagers() {
    return await this.brandsService.findAll({
      where: { account_manager: { isNot: null } },
      select: {
        id: true,
        name: true,
        u_amazon_seller_name: true,
        account_manager: { select: { id: true, u_name: true, u_email: true } },
      },
    });
  }

  @CheckAbility('admin')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Put('/:brandId/account-manager/:accountManagerId')
  async assingAccountManager(
    @Param('brandId', ParseIntPipe) id: number,
    @Param('accountManagerId', ParseIntPipe) accountManagerId: number,
  ) {
    return this.brandsService.update({
      where: { id },
      data: { account_manager: { connect: { id: accountManagerId } } },
    });
  }

  @CheckAbility('admin')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Delete('/:brandId/account-manager')
  async unassignAccountManager(@Param('brandId', ParseIntPipe) id: number) {
    return this.brandsService.update({
      where: { id },
      data: { account_manager: { disconnect: true } },
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/:brandId')
  async getBrand(@Req() req, @Param('brandId', ParseIntPipe) id: number) {
    // if (req.user.role === 'Admin') {
    return this.brandsService.findOne({
      where: { id },
      include: {
        users: { select: { role: true, user: true } },
        account_manager: { select: { id: true, u_name: true } },
        Categories: true,
      },
    });
  }

  @CheckAbility('delete')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Delete('/:brandId')
  async deleteBrand(@Req() req, @Param('brandId', ParseIntPipe) id: number) {
    return this.brandsService.update({
      where: { id },
      data: { status: Brand_status.Deleted },
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/:brandId/user/:userId')
  async assignUser(
    @Req() req,
    @Param('brandId', ParseIntPipe) brandId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('role') role: Role,
  ) {
    return await this.brandsService.assignUserToBrand({ userId, brandId, role });
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Delete('/:brandId/user/:userId')
  async removeUserFromBrand(
    @Req() req,
    @Param('brandId', ParseIntPipe) brandId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.brandsService.removeUserFromBrand({ userId, brandId });
  }

  @ApiBody({ type: CreateBrandDto })
  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Patch('/:brandId')
  async update(@Param('brandId', ParseIntPipe) id: number, @Body() body: Prisma.BrandsCreateInput) {
    return this.brandsService.update({
      where: { id },
      data: {
        ...body,
        updated_at: new Date().getTime(),
      },
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('/:brandId/credentials')
  async getCredList(
    @Param('brandId', ParseIntPipe) id: number,
    @Query('type') type: 'all' | 'SP-API' | 'Advertising-API',
  ) {
    return this.brandsService.findAllAdsCreds(type);
  }

  @CheckAbility('manage')
  @db_write()
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Delete('/:brandId/credentials/:credId')
  async removeCreds(@Param('credId', ParseIntPipe) credId: number) {
    return this.brandsService.removeCredential({ id: credId });
  }

  @CheckAbility('admin')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/:brandId/verify')
  async verify(@Param('brandId', ParseIntPipe) id: number) {
    return await this.brandsService.verify(id);
  }

  @CheckAbility('admin')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/:brandId/approve')
  async approve(@Param('brandId', ParseIntPipe) id: number) {
    return await this.brandsService.approve(id);
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/:brandId/brand-categories')
  async getBrandCategories(@Param('brandId', ParseIntPipe) id: number) {
    return await this.brandsService.getBrandCategories(id);
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Put('/:brandId/categories')
  async assignCategoryToBrand(
    @Query('categoriesId', new ParseArrayPipe({ items: Number, separator: ',' })) categoriesId: number[],
    @Param('brandId', ParseIntPipe) id: number,
  ) {
    return await this.brandsService.assignCategoryToBrand(categoriesId, id);
  }
}
