import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { VendoCommerceDBService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private commerceDB: VendoCommerceDBService) {}

  async findAll(param: {}) {
    const categories: any = await this.commerceDB.categories.findMany(param);
    const subcategories = await this.commerceDB.categories.findMany({
      where: {
        parent_id: { in: categories.map((c) => c.id) },
      },
    });

    return categories.map((c) => ({ ...c, subcategories: subcategories.filter((s) => s.parent_id === c.id) }));
  }

  async count(brandId) {
    return this.commerceDB.categories.count({ where: { brandId, parent_id: null } });
  }

  async create(brandId: number, category: CreateCategoryDto) {
    const records = await this.commerceDB.categories.findMany({
      where: { name: category.name, brandId: brandId, parent_id: category.parent_id },
    });

    if (records.length > 0) {
      throw new BadRequestException('Category with same name already exists');
    }

    return await this.commerceDB.categories.create({
      data: { ...category, brandId: brandId, created_at: new Date().getTime(), updated_at: new Date().getTime() },
    });
  }

  async update(id: number, category: UpdateCategoryDto) {
    const records = await this.commerceDB.categories.findMany({
      where: { AND: [{ name: category.name }, { id: { not: id } }] },
    });

    if (records.length > 0) {
      throw new BadRequestException('Category with same name already exists');
    }

    const record = await this.commerceDB.categories.findUnique({
      where: { id },
    });

    const data = await this.commerceDB.categories.update({
      where: { id },
      data: { ...category, updated_at: new Date().getTime() },
    });

    if (record) {
      await this.commerceDB.category_product_data.updateMany({
        where: { category: record.name },
        data: { category: data.name },
      });
    }

    return data;
  }

  async remove(id: number) {
    const record = await this.commerceDB.categories.delete({
      where: { id },
    });

    if (record) {
      await this.commerceDB.category_product_data.updateMany({
        where: { category: record.name },
        data: { category: null },
      });
    }

    return record;
  }
}
