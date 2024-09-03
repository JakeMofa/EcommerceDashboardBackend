import {
  Controller,
  Get,
  Put,
  Query,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  UploadedFile,
  FileTypeValidator,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryProductDataService } from './category-product-data.service';
import { CategoryReportService } from './category-report.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateCategoryProductDatumDto } from './dto/update-category-product-datum.dto';
import { Prisma } from 'prisma/commerce/generated/vendoCommerce';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { Pagination, PaginationInterceptor, PaginationOptions } from 'src/middlewares/pagination.middleware';
import { BrandAccessMiddleware, db_write } from 'src/middlewares/brandAccess.middleware';
import { FileInterceptor } from '@nestjs/platform-express';
import { VendoCommerceDBService } from '../prisma.service';
import { CreateProductDataDTO } from './dto/create-product-data-dto';
import { BrandSource, CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';

@BrandSource('Amazon')
@Controller('/brands/:brandId/categories')
export class CategoriesController {
  constructor(
    private readonly CategoriesService: CategoriesService,
    private readonly categoryProductDataService: CategoryProductDataService,
    private readonly categoryReportService: CategoryReportService,
    private commerceDB: VendoCommerceDBService,
  ) {}

  // Get All Categories
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(PaginationInterceptor)
  @UseInterceptors(BrandAccessMiddleware)
  @Get()
  async getAllCategories(@Param('brandId', ParseIntPipe) brandId: number, @Pagination() pagination: PaginationOptions) {
    const { page, limit, order, orderBy } = pagination;

    const categories = await this.CategoriesService.findAll({
      where: { parent_id: null, brandId: brandId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ [orderBy]: order as Prisma.SortOrder }],
    });
    const count = await this.CategoriesService.count(brandId);
    return { items: categories, page, limit, count, order, orderBy };
  }

  // Create Category
  @db_write()
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Post()
  create(@Param('brandId', ParseIntPipe) brandId: number, @Body() category: CreateCategoryDto) {
    return this.CategoriesService.create(brandId, category);
  }

  // Update Category
  @Patch(':id')
  @db_write()
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.CategoriesService.update(+id, updateCategoryDto);
  }

  // Delete Category
  @Delete(':id')
  @db_write()
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  remove(@Param('id') id: string) {
    return this.CategoriesService.remove(+id);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('product-data')
  async findProductData(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query('search')
    search: { category: string; asin: string; sku: string; product_title: string; product_status: string },
    @Pagination() pagination: PaginationOptions,
  ) {
    const { page, limit, order, orderBy } = pagination;
    // eslint-disable-next-line prefer-const
    let { category, asin, sku, product_title, product_status } = search;
    const uncategorized = category?.includes('Uncategorizerd');
    category = category && JSON.stringify(category.split(',')).replace(/\[|\]/g, '');

    const items = await this.categoryProductDataService.findAll(
      brandId,
      category,
      uncategorized,
      asin,
      sku,
      product_title,
      product_status,
      page,
      limit,
      order,
      orderBy,
    );

    if (page > 1) {
      return { items: items, page, limit, order, orderBy };
    }

    const count = await this.categoryProductDataService.count(
      brandId,
      category,
      uncategorized,
      asin,
      sku,
      product_title,
      product_status,
    );

    return { items: items, page, limit, count, order, orderBy };
  }

  // Create or Update Product Data
  @CheckAbility('read')
  @db_write()
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Post('/product-data')
  createProductData(@Param('brandId', ParseIntPipe) brandId: number, @Body() productData: CreateProductDataDTO) {
    return this.categoryProductDataService.CreateOrUpdateProductData(brandId, productData);
  }

  @Patch('product-data/:id')
  @db_write()
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  updateProductData(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Param('id') id: string,
    @Body() updateCategoryProductDatumDto: UpdateCategoryProductDatumDto,
  ) {
    return this.categoryProductDataService.update(brandId, id, updateCategoryProductDatumDto);
  }

  // SKUs in shipment records that don't have ASINs associated
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('/product-data-no-asin-skus')
  async NoAsinSKUs(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query('search') search: string,
    @Query('limit') limit: number,
  ) {
    return await this.categoryProductDataService.getNoAsinSKUs(brandId, search, limit);
  }

  // Skus in shipment records that don't have product data record related
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('/product-data-asins')
  async NoAsinProductData(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query('search') search: string,
    @Query('limit') limit: number,
  ) {
    return await this.categoryProductDataService.productDataAllASINs(brandId, search, limit);
  }

  @CheckAbility('read')
  @db_write()
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Put('product-data')
  @UseInterceptors(BrandAccessMiddleware)
  @UseInterceptors(FileInterceptor('file'))
  async importProductData(
    @Param('brandId', ParseIntPipe) brandId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'sheet' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.categoryProductDataService.importProductData(brandId, file);
  }

  // Delete Category Product Data
  @Delete('product-data/:asin')
  @db_write()
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  deleteCategoryProductData(@Param('brandId', ParseIntPipe) brandId: number, @Param('asin') asin: string) {
    return this.categoryProductDataService.delete(brandId, asin);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('product-report')
  async productReport(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query('year') year: string,
    @Query('weeks') weeks: string,
    @Query('months') months: string,
    @Query('asin') asin: string,
    @Query('category') category: string,
  ) {
    const subcategoriesEnabled = (await this.commerceDB.brands.findFirst({ where: { id: brandId } }))
      ?.subcategories_enabled;

    return subcategoriesEnabled
      ? {
          data: await this.categoryReportService.productReportWithSubcategories(
            brandId,
            year,
            weeks,
            months,
            asin,
            category,
          ),
          paginated: true,
        }
      : await this.categoryReportService.productReport(brandId, year, weeks, months, asin, category);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('product-report-export')
  async categoryProductsReportExport(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query('year') year: string,
    @Query('weeks') weeks: string,
    @Query('months') months: string,
    @Query('asin') asin: string,
    @Query('category') category: string,
  ) {
    const subcategoriesEnabled = (await this.commerceDB.brands.findFirst({ where: { id: brandId } }))
      ?.subcategories_enabled;

    return (await subcategoriesEnabled)
      ? this.categoryReportService.productReportWithSubcategories(brandId, year, weeks, months, asin, category)
      : (await this.categoryReportService.productReport(brandId, year, weeks, months, asin, category, true)).data;
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('category-product-report')
  async categoryProductsReport(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query('year') year: string,
    @Query('weeks') weeks: string,
    @Query('months') months: string,
    @Query('asin') asin: string,
    @Query('category_id') category_id: number,
    @Pagination() pagination: PaginationOptions,
  ) {
    return this.categoryReportService.categoryProductsData(
      brandId,
      year,
      weeks,
      months,
      asin,
      category_id,
      pagination.page,
      pagination.limit,
    );
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(BrandAccessMiddleware)
  @Get('performance-report')
  async categoryPerformanceReport(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query('year') year: string,
    @Query('weeks') weeks: string,
    @Query('months') months: string,
    @Query('category') category: string,
  ) {
    const subcategoriesEnabled = (await this.commerceDB.brands.findFirst({ where: { id: brandId } }))
      ?.subcategories_enabled;

    return (await subcategoriesEnabled)
      ? this.categoryReportService.categoryPerformanceReportWithSubcategories(brandId, year, weeks, months, category)
      : this.categoryReportService.categoryPerformanceReport(brandId, year, weeks, months, category);
  }
}
