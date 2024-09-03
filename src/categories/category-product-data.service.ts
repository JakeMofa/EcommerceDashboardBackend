import { Injectable } from '@nestjs/common';
import { UpdateCategoryProductDatumDto } from './dto/update-category-product-datum.dto';
import { VendoBrandDBService, VendoCommerceDBService } from '../prisma.service';
import { Workbook } from 'exceljs';
import * as _ from 'lodash';
import { CreateProductDataDTO } from './dto/create-product-data-dto';

@Injectable()
export class CategoryProductDataService {
  constructor(private readonly brandDbService: VendoBrandDBService, private commerceDB: VendoCommerceDBService) {}

  async findAll(
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
  ) {
    const results: any = await this.brandDbService.client.$queryRawUnsafe(`
    WITH category_products AS (
      SELECT
        category_id,
        MIN(item_name) AS product_title,
        MIN(product_report_data.status) AS product_status,
        asin1 AS asin,
        GROUP_CONCAT(DISTINCT seller_sku ORDER BY seller_sku SEPARATOR ',') AS sku,
        0 AS case_pack_size
      FROM
        product_report_data
      LEFT JOIN
        vendo_commerce.category_product_data
        ON
          product_report_data.asin1 = category_product_data.asin AND
          category_product_data.brandId = ${brandId}
      WHERE
        category_product_data.id IS NULL
      GROUP BY
        category_id, asin1

      UNION

      SELECT
        category_product_data.category_id AS category_id,
        MIN(product_title) AS product_title,
        MIN(product_status) AS product_status,
        asin,
        MIN(sku) AS sku,
        MAX(case_pack_size) as case_pack_size
      FROM
        product_report_data
      RIGHT JOIN vendo_commerce.category_product_data ON product_report_data.asin1 = category_product_data.asin
      WHERE
        category_product_data.brandId = ${brandId}
      GROUP BY
        category_id, asin
      )

    SELECT
      categories.name as category,
      category_id,
      categories.parent_id as parent_category_id,
      parent_categories.name as parent_category,
      MIN(product_title) AS product_title,
      MIN(product_status) AS product_status,
      asin,
      MIN(sku) as sku,
      MAX(case_pack_size) AS case_pack_size
    FROM
      category_products
    LEFT JOIN
      vendo_commerce.categories ON category_products.category_id = categories.id AND (categories.brandID = ${brandId})
    LEFT JOIN
      vendo_commerce.categories parent_categories ON categories.parent_id = parent_categories.id AND (parent_categories.brandID = ${brandId})
    WHERE
      (${category ? `category_id IN (${category}) OR (${uncategorized ? 'category_id IS NULL' : 'false'})` : '1'}) AND
      (${asin ? `LOWER(asin) LIKE '%${asin.toLowerCase()}%'` : '1'}) AND
      (${sku ? `LOWER(sku) LIKE '%${sku.toLowerCase()}%'` : '1'}) AND
      (${product_title ? `LOWER(product_title) LIKE '%${product_title}%'` : '1'}) AND
      (${product_status ? `product_status = '${product_status}'` : '1'})
    GROUP BY
     category, category_id, parent_category_id, parent_category, asin
    ORDER BY ${orderBy === 'id' ? 'category' : orderBy} ${order}
    LIMIT ${limit}
    OFFSET ${(page - 1) * limit}
  `);

    return results;
  }

  async count(brandId, category, uncategorized, asin, sku, product_title, product_status) {
    const results: any = await this.brandDbService.client.$queryRawUnsafe(`
    SELECT COUNT(DISTINCT asin)
    FROM (
      SELECT
        category_id,
        MIN(item_name) AS product_title,
        MIN(product_report_data.status) AS product_status,
        asin1 AS asin,
        GROUP_CONCAT(seller_sku SEPARATOR ',') AS sku
      FROM
        product_report_data
      LEFT JOIN
        vendo_commerce.category_product_data
        ON
          product_report_data.asin1 = category_product_data.asin AND
          category_product_data.brandId = ${brandId}
      WHERE
        category_product_data.id IS NULL
      GROUP BY
        category_id, asin1

      UNION

      select category_product_data.category_id AS category_id,
        MIN(product_title) AS product_title,
        MIN(product_status) AS product_status,
        asin,
        MIN(sku) AS sku
      FROM
        product_report_data
      RIGHT JOIN vendo_commerce.category_product_data ON product_report_data.asin1 = category_product_data.asin
      WHERE
        category_product_data.brandId = ${brandId}
      GROUP BY
        category_id, asin
      ) AS category_products
    WHERE
    (${category ? `category_id IN (${category}) OR (${uncategorized ? 'category_id IS NULL' : 'false'})` : '1'}) AND
    (${asin ? `LOWER(asin) LIKE '%${asin.toLowerCase()}%'` : '1'}) AND
    (${sku ? `LOWER(sku) LIKE '%${sku.toLowerCase()}%'` : '1'}) AND
    (${product_title ? `product_title LIKE '%${product_title}%'` : '1'}) AND
    (${product_status ? `product_status = '${product_status}'` : '1'})
  `);

    return results[0]['COUNT(DISTINCT asin)'];
  }

  async getNoAsinSKUs(brandId, search, limit = 10) {
    const results: any = await this.brandDbService.client.$queryRawUnsafe(`
        SELECT
          distinct ga.sku, ga.product_name
        FROM
          get_amazon_fulfilled_shipments_data_general ga
        WHERE
          ${search ? `LOWER(ga.sku) LIKE '%${search.toLowerCase()}%'` : '1'} AND
          ga.sku not in (SELECT distinct asin FROM advertising_product_report) AND
          ga.sku not in (SELECT distinct asin1 FROM product_report_data) AND
          ga.sku not in (SELECT distinct asin FROM vendo_commerce.category_product_data WHERE brandId = ${brandId}) AND
          ga.sku not in (SELECT distinct astr_child_asin FROM asin_business_report)
        ORDER BY ga.sku
        LIMIT ${limit || 10}
    `);
    return results;
  }

  async productDataAllASINs(brandId, search, limit = 10) {
    const results: any = await this.brandDbService.client.$queryRawUnsafe(`
      SELECT distinct asin
      FROM (
        SELECT
          distinct asin1 AS asin
        FROM
          product_report_data
        WHERE
          ${search ? `LOWER(asin1) LIKE '%${search.toLowerCase()}%'` : '1'} AND
          asin1 IS NOT NULL
        UNION
        SELECT distinct asin
        FROM
          vendo_commerce.category_product_data
        WHERE
          brandId = ${brandId} AND
          ${search ? `LOWER(asin) LIKE '%${search.toLowerCase()}%'` : '1'} AND
          asin IS NOT NULL
        ) data
        ORDER BY asin
        LIMIT ${limit}
      `);

    return results.map((a) => a.asin);
  }

  async delete(brandId: number, asin: string) {
    const record = await this.commerceDB.category_product_data.deleteMany({
      where: {
        brandId,
        asin,
      },
    });

    return record;
  }

  async update(brandId: number, asin: string, updateCategoryProductDatumDto: UpdateCategoryProductDatumDto) {
    const categoryProductData = await this.commerceDB.category_product_data.findFirst({
      where: {
        asin,
        brandId,
      },
    });

    if (updateCategoryProductDatumDto.category) {
      let category = await this.commerceDB.categories.findFirst({
        where: {
          brandId,
          name: updateCategoryProductDatumDto.category,
        },
      });

      if (!category) {
        category = await this.commerceDB.categories.create({
          data: {
            name: updateCategoryProductDatumDto.category,
            brandId,
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
          },
        });
      }
      updateCategoryProductDatumDto.category_id = category.id;
    }

    let record;
    if (categoryProductData) {
      record = await this.commerceDB.category_product_data.update({
        where: {
          id: categoryProductData.id,
        },
        data: {
          ..._.pick(updateCategoryProductDatumDto, [
            'category_id',
            'product_title',
            'product_status',
            'case_pack_size',
          ]),
          updated_at: new Date().getTime(),
        },
      });
    } else {
      const rec = await this.brandDbService.client.product_report_data.findFirst({
        where: {
          asin1: asin,
        },
      });

      record = await this.commerceDB.category_product_data.create({
        data: {
          asin,
          brandId,
          sku: rec?.seller_sku,
          ..._.pick(updateCategoryProductDatumDto, [
            'category_id',
            'product_title',
            'product_status',
            'case_pack_size',
          ]),
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
        },
      });
    }

    return record;
  }

  rowToArray(columns, row) {
    return columns.map((column) => {
      return row.getCell(column.key)?.value?.toString() || '';
    });
  }

  async importProductData(brandId: number, file: Express.Multer.File) {
    const subcategoriesEnabled = (await this.commerceDB.brands.findFirst({ where: { id: brandId } }))
      ?.subcategories_enabled;

    let workbook = new Workbook();
    let success = 0;
    await workbook.xlsx.load(file.buffer);

    let sheet = workbook.worksheets[0];
    sheet.columns = [
      { header: 'Category', key: 'category' },
      { header: 'Subcategory', key: 'subcategory' },
      { header: 'Asin', key: 'asin' },
      { header: 'Sku', key: 'sku' },
      { header: 'Product Title', key: 'product_title' },
      { header: 'Product Status', key: 'product_status' },
    ];

    let recordUpdated = false;
    for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex++) {
      const row = sheet.getRow(rowIndex);
      recordUpdated = false;
      let [category, subcategory, asin, sku, product_title, product_status] = this.rowToArray(sheet.columns, row);

      if (category && category.length > 0 && asin && asin.length > 0) {
        let existingCategory = await this.commerceDB.categories.findFirst({
          where: {
            brandId,
            name: category,
            parent_id: null,
          },
        });

        if (!existingCategory) {
          existingCategory = await this.commerceDB.categories.create({
            data: { brandId, name: category, created_at: new Date().getTime(), updated_at: new Date().getTime() },
          });
        }

        subcategory = subcategoriesEnabled ? (subcategory && subcategory.length ? subcategory : 'Misc') : null;
        let existingSubcategory: any = null;
        if (subcategory && subcategory.length) {
          existingSubcategory = await this.commerceDB.categories.findFirst({
            where: {
              brandId,
              parent_id: existingCategory.id,
              name: subcategory,
            },
          });

          if (!existingSubcategory) {
            existingSubcategory = await this.commerceDB.categories.create({
              data: {
                brandId,
                name: subcategory,
                parent_id: existingCategory.id,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
              },
            });
          }
        }

        const categoryProductData = await this.commerceDB.category_product_data.findFirst({
          where: {
            brandId,
            asin,
          },
        });
        if (categoryProductData) {
          await this.commerceDB.category_product_data.update({
            where: {
              id: categoryProductData.id,
            },
            data: {
              category_id: existingSubcategory ? existingSubcategory.id : existingCategory.id,
              asin,
              sku: sku || categoryProductData.sku,
              product_title: product_title || categoryProductData.product_title,
              product_status: product_status || categoryProductData.product_status,
            },
          });
          recordUpdated = true;
        } else {
          const productReportData = await this.brandDbService.client.product_report_data.findFirst({
            where: {
              asin1: asin,
            },
          });

          const c = await this.commerceDB.category_product_data.create({
            data: {
              brandId,
              category_id: existingSubcategory ? existingSubcategory.id : existingCategory.id,
              asin,
              sku: sku || productReportData?.seller_sku,
              product_title: product_title || productReportData?.item_name,
              product_status: product_status || 'Active',
            },
          });
          recordUpdated = true;
        }
      }

      success = success + (recordUpdated ? 1 : 0);
    }

    return { message: `Successfully imported ${success} rows.` };
  }

  async CreateOrUpdateProductData(brandId: number, productData: CreateProductDataDTO) {
    const countOfSkuRecords = await this.commerceDB.category_product_data.count({
      where: {
        brandId,
        sku: productData.sku,
      },
    });
    const dataExists = countOfSkuRecords > 0;
    if (!dataExists) {
      return this.commerceDB.category_product_data.create({
        data: {
          brandId,
          product_title: productData.productTitle,
          product_status: productData.status,
          sku: productData.sku,
          asin: productData.asin,
        },
      });
    } else {
      const existingSkuProductDataRow = await this.commerceDB.category_product_data.findFirst({
        where: {
          brandId,
          sku: productData.sku,
        },
      });
      const partialUpdateData = {};
      if (productData.productTitle) {
        partialUpdateData['product_title'] = productData.productTitle;
      }
      if (productData.asin) {
        partialUpdateData['asin'] = productData.asin;
      }
      if (productData.status) {
        partialUpdateData['product_status'] = productData.status;
      }
      return this.commerceDB.category_product_data.update({
        where: {
          id: existingSkuProductDataRow!.id,
        },
        data: partialUpdateData,
      });
    }
  }
}
