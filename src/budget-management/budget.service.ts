import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { VendoCommerceDBService } from 'src/prisma.service';
import * as _ from 'lodash';
import dayjs from 'src/utils/date.util';
import { period_type, status } from 'prisma/commerce/generated/vendoCommerce';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { CampaignService } from './campaign.service';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(private readonly campaignService: CampaignService, private readonly commerceDb: VendoCommerceDBService) {}

  async findAll({
    walmart_tagId,
    brandId,
    budget_type,
    period_type,
    date,
  }: {
    walmart_tagId?: string;
    brandId: number;
    budget_type?: 'brand' | 'tag' | 'all';
    period_type?: period_type;
    date?: string;
  }) {
    const tagCondition = this.getTagCondition(budget_type, walmart_tagId);
    const budgets = await this.fetchBudgets(brandId, period_type, date, tagCondition);
    const spends = await this.campaignService.getCampaignSpending({
      brandId,
      walmart_tagId: _.toNumber(walmart_tagId),
      date,
      budget_type,
    });
    return { data: budgets, spends };
  }

  async createBudget(brandId: number, createBudgetDto: CreateBudgetDto): Promise<any> {
    const { walmart_tagId, date, period_type: periodType, budget, created_at, updated_at } = createBudgetDto;
    const startDate = dayjs(date).startOf('month');
    createBudgetDto.brandId = brandId;

    await this.checkExistingMonthlyBudget(brandId, walmart_tagId, startDate);
    if (walmart_tagId) {
      await this.monthlyBrandCapacityValidate({ brandId, date: startDate.format('YYYY-MM-DD'), budget });
    }
    if (periodType === period_type.MONTHLY) {
      const dailyBudget = this.calculateDailyBudget(startDate, budget);
      // await this.deleteExistingDailyBudgets(brandId, walmart_tagId, startDate);
      await this.createDailyBudgets(brandId, walmart_tagId, startDate, dailyBudget, created_at, updated_at);
      await this.createMonthlyBudget(createBudgetDto, startDate);
    }

    return this.findAll({ date: startDate.format('YYYY-MM-DD'), walmart_tagId: walmart_tagId?.toString(), brandId });
  }

  async updateBudget(id: number, updateBudgetDto: UpdateBudgetDto): Promise<any> {
    const { budget } = updateBudgetDto;

    if (budget < 0) {
      throw new BadRequestException('Budget cannot be negative.');
    }

    const existingBudget = await this.commerceDb.budgets.findUnique({ where: { id } });
    if (!existingBudget) {
      throw new BadRequestException('Budget does not exist.');
    }

    const startDate = dayjs(existingBudget.date).startOf('month');
    const { brandId, period_type: periodType, walmart_tagId } = existingBudget;

    if (periodType === period_type.MONTHLY) {
      await this.updateMonthlyBudget(brandId, walmart_tagId, budget, existingBudget, startDate);
    } else if (periodType === period_type.DAILY) {
      await this.updateDailyBudget(brandId, walmart_tagId, budget, existingBudget, startDate);
    }

    return this.findAll({ date: startDate.format('YYYY-MM-DD'), walmart_tagId: walmart_tagId?.toString(), brandId });
  }

  private getTagCondition(budget_type: 'brand' | 'tag' | 'all' | undefined, walmart_tagId?: string) {
    let tagCondition = {};
    if (budget_type === 'all') {
      if (_.isUndefined(walmart_tagId)) {
        throw new BadRequestException('walmart_tagId is required');
      }
      tagCondition = {
        AND: [{ OR: [{ walmart_tagId: { equals: null } }, { walmart_tagId: { in: [_.toNumber(walmart_tagId)] } }] }],
      };
    } else if (!_.isUndefined(walmart_tagId)) {
      tagCondition = { walmart_tagId: { in: [_.toNumber(walmart_tagId)] } };
    } else if (budget_type === 'brand') {
      tagCondition = { walmart_tagId: { equals: null } };
    }
    return tagCondition;
  }

  private async fetchBudgets(brandId: number, period_type?: period_type, date?: string, tagCondition?: any) {
    return await this.commerceDb.budgets.findMany({
      where: {
        brandId,
        period_type,
        date: {
          gte: date ? new Date(dayjs(date).startOf('month').format('YYYY-MM-DD')) : undefined,
          lte: date ? new Date(dayjs(date).endOf('month').format('YYYY-MM-DD')) : undefined,
        },
        ...tagCondition,
      },
      include: {
        walmart_tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  private async checkExistingMonthlyBudget(brandId: number, walmart_tagId: any, startDate: dayjs.Dayjs) {
    const existingMonthlyBudget = await this.commerceDb.budgets.findFirst({
      where: {
        brandId,
        walmart_tagId: _.isUndefined(walmart_tagId) ? { equals: null } : _.toNumber(walmart_tagId),
        date: new Date(startDate.format('YYYY-MM-DD')),
        period_type: period_type.MONTHLY,
      },
    });

    if (existingMonthlyBudget) {
      throw new BadRequestException('Monthly budget already exists for this period.');
    }
  }

  private calculateDailyBudget(startDate: dayjs.Dayjs, budget: number): number {
    const today = dayjs();
    if (budget <= 0) {
      throw new BadRequestException('Budget must be greater than zero.');
    }

    const daysInMonth = startDate.daysInMonth();
    const currentDay = today.date();
    const isCurrentMonth = startDate.isSame(today, 'month');
    const startDay = isCurrentMonth ? currentDay : 1;

    return budget / (daysInMonth - startDay + 1);
  }

  private async createDailyBudgets(
    brandId: number,
    walmart_tagId: any,
    startDate: dayjs.Dayjs,
    dailyBudget: number,
    createdAt: string,
    updatedAt: string,
  ) {
    if (dailyBudget <= 0) {
      throw new BadRequestException('Daily budget must be greater than zero.');
    }
    const daysInMonth = startDate.daysInMonth();
    const isCurrentMonth = startDate.isSame(dayjs(), 'month');
    const startRange = isCurrentMonth ? dayjs().date() : 1;
    const today = dayjs();

    const budgetEntries: CreateBudgetDto[] = _.range(startRange, daysInMonth + 1)
      .map((day) => startDate.date(day))
      .filter((date) => date.isSame(today, 'day') || date.isAfter(today, 'day'))
      .map((date) => ({
        budget: dailyBudget,
        date: new Date(date.format('YYYY-MM-DD')),
        created_at: createdAt,
        updated_at: updatedAt,
        status: status.ACTIVE,
        walmart_tagId: walmart_tagId,
        brandId,
        period_type: period_type.DAILY,
      }));

    if (budgetEntries.length === 0) {
      throw new BadRequestException('No valid days to create budgets for.');
    }

    await this.commerceDb.budgets.createMany({ data: budgetEntries });
  }

  private async createMonthlyBudget(createBudgetDto: CreateBudgetDto, startDate: dayjs.Dayjs) {
    if (createBudgetDto.budget <= 0) {
      throw new BadRequestException('Monthly budget must be greater than zero.');
    }
    if (!createBudgetDto.brandId || !createBudgetDto.period_type) {
      throw new BadRequestException('Invalid budget details.');
    }

    await this.commerceDb.budgets.create({
      data: { ...createBudgetDto, date: new Date(startDate.format('YYYY-MM-DD')) },
    });
  }

  private async updateMonthlyBudget(
    brandId: number,
    walmart_tagId: any,
    newBudget: number,
    existingBudget: any,
    startDate: dayjs.Dayjs,
  ) {
    if (newBudget <= 0) {
      throw new BadRequestException('Monthly budget must be greater than zero.');
    }
    const monthlyBudget = await this.commerceDb.budgets.findFirst({
      where: {
        brandId,
        walmart_tagId: _.isNil(walmart_tagId) ? { equals: null } : _.toNumber(walmart_tagId),
        date: new Date(startDate.format('YYYY-MM-DD')),
        period_type: period_type.MONTHLY,
      },
    });

    if (!monthlyBudget) {
      throw new BadRequestException('Monthly budget does not exist for this period.');
    }

    if (newBudget > monthlyBudget.budget) {
      await this.monthlyBrandCapacityValidate({ brandId, date: startDate.format('YYYY-MM-DD'), budget: newBudget });
    }

    const dailyBudgets = await this.commerceDb.budgets.findMany({
      where: {
        brandId,
        walmart_tagId: _.isNil(walmart_tagId) ? { equals: null } : _.toNumber(walmart_tagId),
        date: {
          gte: new Date(startDate.startOf('month').format('YYYY-MM-DD')),
          lte: new Date(startDate.endOf('month').format('YYYY-MM-DD')),
        },
        period_type: period_type.DAILY,
      },
    });

    const totalExistingDailyBudget = dailyBudgets.reduce((sum, dailyBudget) => sum + dailyBudget.budget, 0);

    if (totalExistingDailyBudget === 0) {
      const equalDailyBudget = newBudget / dailyBudgets.length;
      const adjustedDailyBudgets = dailyBudgets.map((dailyBudget) => ({
        id: dailyBudget.id,
        budget: equalDailyBudget,
        updated_at: new Date(),
      }));

      await this.commerceDb.$transaction(
        adjustedDailyBudgets.map(({ id, budget, updated_at }) =>
          this.commerceDb.budgets.update({
            where: { id },
            data: { budget, updated_at },
          }),
        ),
      );

      return;
    }

    const adjustedDailyBudgets = dailyBudgets.map((dailyBudget) => {
      const proportion = dailyBudget.budget / totalExistingDailyBudget;
      const newDailyBudget = proportion * newBudget;
      return {
        id: dailyBudget.id,
        budget: newDailyBudget,
        updated_at: new Date(),
      };
    });

    const roundingError = newBudget - adjustedDailyBudgets.reduce((sum, dailyBudget) => sum + dailyBudget.budget, 0);
    if (adjustedDailyBudgets.length > 0) {
      adjustedDailyBudgets[adjustedDailyBudgets.length - 1].budget += roundingError;
    }

    await this.commerceDb.$transaction(
      adjustedDailyBudgets.map(({ id, budget, updated_at }) =>
        this.commerceDb.budgets.update({
          where: { id },
          data: { budget, updated_at },
        }),
      ),
    );
  }

  private async deleteExistingDailyBudgets(brandId: number, walmart_tagId: any, startDate: dayjs.Dayjs) {
    const existingDailyBudgets = await this.commerceDb.budgets.findMany({
      where: {
        brandId,
        walmart_tagId: _.isUndefined(walmart_tagId) ? { equals: null } : _.toNumber(walmart_tagId),
        date: {
          gte: new Date(startDate.startOf('month').format('YYYY-MM-DD')),
          lte: new Date(startDate.endOf('month').format('YYYY-MM-DD')),
        },
        period_type: period_type.DAILY,
      },
    });

    if (existingDailyBudgets.length > 0) {
      const existingDailyBudgetIds = existingDailyBudgets.map((budget) => budget.id);
      await this.commerceDb.budgets.deleteMany({ where: { id: { in: existingDailyBudgetIds } } });
    }
  }

  private async updateDailyBudget(
    brandId: number,
    walmart_tagId: any,
    budget: number,
    existingBudget: any,
    startDate: dayjs.Dayjs,
  ) {
    if (budget <= 0) {
      throw new BadRequestException('Budget must be greater than zero.');
    }
    const monthlyBudget = await this.commerceDb.budgets.findFirst({
      where: {
        brandId,
        walmart_tagId: _.isNil(walmart_tagId) ? { equals: null } : _.toNumber(walmart_tagId),
        date: new Date(startDate.format('YYYY-MM-DD')),
        period_type: period_type.MONTHLY,
      },
    });

    if (!monthlyBudget) {
      throw new BadRequestException('Monthly budget does not exist for this period.');
    }
    if (budget > monthlyBudget.budget) {
      throw new BadRequestException('Updated budget exceeds the monthly limit.');
    }

    const dailyBudgets = await this.commerceDb.budgets.findMany({
      where: {
        brandId,
        walmart_tagId: _.isNil(walmart_tagId) ? { equals: null } : _.toNumber(walmart_tagId),
        date: {
          gte: new Date(startDate.startOf('month').format('YYYY-MM-DD')),
          lte: new Date(startDate.endOf('month').format('YYYY-MM-DD')),
        },
        period_type: period_type.DAILY,
      },
    });

    const totalCurrentDailyBudget = dailyBudgets.reduce((sum, dailyBudget) => sum + dailyBudget.budget, 0);
    const budgetChange = Math.abs(budget - existingBudget.budget);
    const remainingBudget = totalCurrentDailyBudget - budgetChange;

    if (remainingBudget > monthlyBudget.budget) {
      throw new BadRequestException('Updated budget exceeds the monthly limit.');
    }
    if (totalCurrentDailyBudget === 0) {
      const equalDailyBudget = budget / dailyBudgets.length;
      const adjustedDailyBudgets = dailyBudgets.map((dailyBudget) => ({
        id: dailyBudget.id,
        budget: equalDailyBudget,
        updated_at: new Date(),
      }));

      await this.commerceDb.$transaction(
        adjustedDailyBudgets.map(({ id, budget, updated_at }) =>
          this.commerceDb.budgets.update({
            where: { id },
            data: { budget, updated_at },
          }),
        ),
      );

      return;
    }

    const remainingDailyBudgets = dailyBudgets.filter((db) => db.id !== existingBudget.id);
    const totalRemainingDailyBudget = remainingDailyBudgets.reduce((sum, dailyBudget) => sum + dailyBudget.budget, 0);

    const remainingBudgetAfterUpdate = monthlyBudget.budget - budget;

    const updatedDailyBudgets = remainingDailyBudgets.map((dailyBudget) => {
      const newDailyBudget = (dailyBudget.budget / totalRemainingDailyBudget) * remainingBudgetAfterUpdate;
      return {
        id: dailyBudget.id,
        budget: newDailyBudget,
        updated_at: new Date(),
      };
    });

    updatedDailyBudgets.push({
      id: existingBudget.id,
      budget,
      updated_at: new Date(),
    });

    const roundingError =
      monthlyBudget.budget - updatedDailyBudgets.reduce((sum, dailyBudget) => sum + dailyBudget.budget, 0);
    if (updatedDailyBudgets.length > 0) {
      updatedDailyBudgets[updatedDailyBudgets.length - 1].budget += roundingError;
    }

    await this.commerceDb.$transaction(
      updatedDailyBudgets.map(({ id, budget, updated_at }) =>
        this.commerceDb.budgets.update({
          where: { id },
          data: { budget, updated_at },
        }),
      ),
    );
  }

  private async monthlyBrandCapacityValidate({
    brandId,
    date,
    budget,
  }: {
    brandId: number;
    date: string;
    budget: number;
  }) {
    const monthlyBudget = await this.commerceDb.budgets.findFirst({
      where: {
        brandId,
        date: new Date(dayjs(date).format('YYYY-MM-DD')),
        period_type: period_type.MONTHLY,
        walmart_tagId: { equals: null },
      },
    });
    if (!monthlyBudget) {
      return;
    }
    if (budget > (monthlyBudget?.budget || 0)) {
      throw new BadRequestException('Budget exceeds the monthly limit.');
    }
  }
}
