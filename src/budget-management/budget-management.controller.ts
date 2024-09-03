import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Query,
  Post,
  Req,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { WalmartConfigMiddleware } from 'src/middlewares/walmartConfig.middleware';
import { ExtractWalmartConfig, WalmartConfig, WalmartExceptionFilter } from 'src/utils/walmart';
import { VendoCommerceDBService } from 'src/prisma.service';
import * as _ from 'lodash';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateWalmartCalendarDto,
  CreateWalmartCalendarPeriodDto,
  UpdateWalmartCalendarDto,
  UpdateWalmartCalendarPeriodDto,
  WalmartCalendarDto,
  WalmartCalendarPeriodDto,
} from './dto/walmart_calendar.dto';
import { CreateWalmartTagDto, UpdateWalmartTagDto, WalmartTagDto } from './dto/tag.dto';
import { BudgetDto, CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { calendar_type, period_type } from 'prisma/commerce/generated/vendoCommerce';
import { BudgetService } from './budget.service';
import { TagService } from './tag.service';
import { BulkUpdateCampaignArgs } from 'src/walmart-campaign/dto/campaign-filters.dto';
import { CampaignService } from './campaign.service';
import { UpdateCampaignArgs } from 'src/walmart-communicator';

@ApiBearerAuth('access-token')
@ApiTags('Budget Management')
@Controller('brands/:brandId/')
export class BudgetManagementController {
  constructor(
    private readonly budgetService: BudgetService,
    private readonly tagService: TagService,
    private readonly campaignService: CampaignService,
    private readonly commerceDb: VendoCommerceDBService,
  ) {}

  @ApiOperation({ summary: 'List all campaigns for a brand' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully.' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Get('campaigns')
  async findAllCampaigns(@Param('brandId', new ParseIntPipe()) brandId: number, @Query('search') search: string) {
    return await this.commerceDb.walmart_campaign.findMany({
      where: {
        brand: { id: brandId },
        ...(search ? { OR: [{ name: { contains: search } }] } : {}),
      },
      include: {
        walmart_tags: true,
      },
    });
  }

  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully.' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Get('campaigns/:id')
  getCampaign(@Param('id', new ParseIntPipe()) id: number) {
    return this.commerceDb.walmart_campaign.findUnique({
      where: { id },
      include: {
        walmart_tags: true,
      },
    });
  }

  @ApiOperation({ summary: 'Create a tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully.', type: WalmartTagDto })
  @ApiBody({ type: CreateWalmartTagDto })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Post('tags')
  createTag(
    @Req() req: any,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Body() createTagDto: CreateWalmartTagDto,
  ) {
    return this.commerceDb.walmart_tag.create({
      data: {
        ..._.omit(createTagDto, 'walmart_calendars', 'walmart_campaigns'),
        ...(Array.isArray(createTagDto.walmart_calendars) && {
          walmart_calendars: { connect: _.map(createTagDto.walmart_calendars, (id) => ({ id })) },
        }),
        ...(Array.isArray(createTagDto.walmart_campaigns) && {
          walmart_campaigns: { connect: _.map(createTagDto.walmart_campaigns, (id) => ({ id })) },
        }),
        owner: { connect: { id: req.user.id } },
        brand: { connect: { id: brandId } },
      },
      include: {
        walmart_calendars: true,
        walmart_campaigns: true,
        owner: { select: { id: true, u_name: true } },
        brand: { select: { id: true, name: true } },
      },
    });
  }

  @ApiOperation({ summary: 'Get a tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully.', type: WalmartTagDto })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Get('tags/:id')
  getTag(@Param('id', new ParseIntPipe()) id: number, @Param('brandId', new ParseIntPipe()) brandId: number) {
    return this.tagService.findByTagId({ brandId, id });
  }

  @ApiOperation({ summary: 'Update a tag' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully.', type: WalmartTagDto })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @ApiBody({ type: UpdateWalmartTagDto })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Put('tags/:id')
  updateTag(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Body() updateTagDto: UpdateWalmartTagDto,
  ) {
    return this.commerceDb.walmart_tag.update({
      where: { id },
      data: {
        ..._.omit(updateTagDto, 'walmart_calendars', 'walmart_campaigns'),
        ...(Array.isArray(updateTagDto.walmart_calendars) && {
          walmart_calendars: { connect: _.map(updateTagDto.walmart_calendars, (id) => ({ id })) },
        }),
        ...(Array.isArray(updateTagDto.walmart_campaigns) && {
          walmart_campaigns: { connect: _.map(updateTagDto.walmart_campaigns, (id) => ({ id })) },
        }),
      },
    });
  }

  @Put('tags/:id/campaigns/bulk-update')
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @UseFilters(WalmartExceptionFilter)
  bulkUpdate(
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Param('tagId', new ParseIntPipe()) tagId: number,
    @ExtractWalmartConfig() config: WalmartConfig,
    @Body() updateCampaignReq: UpdateCampaignArgs,
  ) {
    return this.campaignService.bulkUpdateApiCampaignsByTag({
      advertiser_id: config.advertiser_id,
      data: updateCampaignReq,
      brandId,
      tagId,
    });
  }

  @ApiOperation({ summary: 'Delete a tag' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully.', type: WalmartTagDto })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Delete('tags/:id')
  deleteTag(@Param('id', new ParseIntPipe()) id: number) {
    return this.commerceDb.walmart_tag.delete({
      where: { id },
    });
  }

  @ApiOperation({ summary: 'List all tags for a brand' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully.', type: [WalmartTagDto] })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Get('tags')
  findAllTags(@Param('brandId', new ParseIntPipe()) brandId: number, @Query('search') search: string) {
    return this.tagService.findAllTags({ brandId, search });
  }

  @ApiOperation({ summary: 'List all budgets for a campaign or tag' })
  @ApiResponse({ status: 200, description: 'Budgets retrieved successfully.', type: BudgetDto })
  @ApiQuery({ name: 'campaign_id', required: false, description: 'campaign_id query' })
  @ApiQuery({ name: 'walmart_tagId', required: false, description: 'tagId query' })
  @ApiQuery({ name: 'date', required: false, description: 'date query' })
  @ApiQuery({ name: 'period_type', enum: period_type, required: false, description: 'period_type query' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Get('/budgets')
  findAllBudgets(
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('walmart_tagId') walmart_tagId?: string,
    @Query('budget_type') budget_type?: 'brand' | 'tag' | 'all',
    @Query('period_type') period_type?: period_type,
    @Query('date') date?: string,
  ) {
    return this.budgetService.findAll({
      brandId,
      budget_type,
      period_type,
      date,
      walmart_tagId,
    });
  }

  @ApiOperation({ summary: 'Create a budget' })
  @ApiResponse({ status: 201, description: 'Budget created successfully.', type: BudgetDto })
  @ApiBody({ type: CreateBudgetDto })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Post('budgets')
  createBudget(@Param('brandId', new ParseIntPipe()) brandId: number, @Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetService.createBudget(brandId, createBudgetDto);
  }

  @ApiOperation({ summary: 'Get a budget by ID' })
  @ApiResponse({ status: 200, description: 'Budget retrieved successfully.', type: BudgetDto })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Get('budgets/:id')
  getBudget(@Param('id', new ParseIntPipe()) id: number) {
    return this.commerceDb.budgets.findUnique({
      where: { id },
      include: {
        walmart_tag: true,
        brand: {
          select: { id: true, name: true, u_amazon_seller_name: true },
        },
      },
    });
  }

  @ApiOperation({ summary: 'Update a budget' })
  @ApiResponse({ status: 200, description: 'Budget updated successfully.', type: BudgetDto })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @ApiBody({ type: UpdateBudgetDto })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Put('budgets/:id')
  updateBudget(@Param('id', new ParseIntPipe()) id: number, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetService.updateBudget(id, updateBudgetDto);
  }

  @ApiOperation({ summary: 'Delete a budget' })
  @ApiResponse({ status: 200, description: 'Budget deleted successfully.', type: BudgetDto })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Delete('budgets/:id')
  deleteBudget(@Param('id', new ParseIntPipe()) id: number) {
    return this.commerceDb.budgets.delete({
      where: { id },
    });
  }

  @ApiOperation({ summary: 'Create a calendar' })
  @ApiResponse({ status: 201, description: 'Calendar created successfully.', type: WalmartCalendarDto })
  @ApiBody({ type: CreateWalmartCalendarDto })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Post('calendars')
  createCalendar(
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Body() createCalendarDto: CreateWalmartCalendarDto,
  ) {
    return this.commerceDb.walmart_calendar.create({
      data: {
        ..._.omit(createCalendarDto, 'walmart_campaigns', 'walmart_tags', 'periods'),
        ...(Array.isArray(createCalendarDto.walmart_tags) && {
          walmart_tags: { connect: createCalendarDto.walmart_tags.map((id) => ({ id })) },
        }),
        brandId,
        periods: { create: createCalendarDto.periods },
      },
      include: {
        brands: { select: { id: true, name: true, u_amazon_seller_name: true } },
        walmart_tags: true,
        periods: true,
      },
    });
  }

  @ApiOperation({ summary: 'Get a calendar by ID' })
  @ApiResponse({ status: 200, description: 'Calendar retrieved successfully.', type: WalmartCalendarDto })
  @ApiParam({ name: 'id', description: 'Calendar ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Get('calendars/:id')
  getCalendar(@Param('id', new ParseIntPipe()) id: number) {
    return this.commerceDb.walmart_calendar.findUnique({
      where: { id },
      include: {
        brands: { select: { id: true, name: true, u_amazon_seller_name: true } },
        walmart_tags: true,
        periods: true,
      },
    });
  }

  @ApiOperation({ summary: 'Update a calendar' })
  @ApiResponse({ status: 200, description: 'Calendar updated successfully.', type: WalmartCalendarDto })
  @ApiParam({ name: 'id', description: 'Calendar ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @ApiBody({ type: UpdateWalmartCalendarDto })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Put('calendars/:calendarId')
  updateCalendar(
    @Param('calendarId', new ParseIntPipe()) id: number,
    @Body() updateCalendarDto: UpdateWalmartCalendarDto,
  ) {
    return this.commerceDb.walmart_calendar.update({
      where: { id },
      data: {
        ..._.omit(updateCalendarDto, 'walmart_campaigns', 'walmart_tags', 'periods'),
        ...(Array.isArray(updateCalendarDto.walmart_tags) && {
          walmart_tags: { connect: updateCalendarDto.walmart_tags.map((id) => ({ id })) },
        }),
        ...(Array.isArray(updateCalendarDto.periods) && {
          periods: { create: updateCalendarDto.periods },
        }),
      },
      include: {
        brands: { select: { id: true, name: true, u_amazon_seller_name: true } },
        walmart_tags: true,
        periods: true,
      },
    });
  }

  @ApiOperation({ summary: 'Delete a calendar' })
  @ApiResponse({ status: 200, description: 'Calendar deleted successfully.', type: WalmartCalendarDto })
  @ApiParam({ name: 'id', description: 'Calendar ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Delete('calendars/:id')
  deleteCalendar(@Param('id', new ParseIntPipe()) id: number) {
    return this.commerceDb.walmart_calendar.delete({
      where: { id },
    });
  }

  @ApiOperation({ summary: 'List all calendars for a brand' })
  @ApiResponse({ status: 200, description: 'Calendars retrieved successfully.', type: [WalmartCalendarDto] })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  @ApiQuery({ name: 'campaign_id', required: false, description: 'campaign_id query' })
  @ApiQuery({ name: 'walmart_tagId', required: false, description: 'tagId query' })
  @ApiQuery({ name: 'type', required: false, description: 'calendar type', enum: calendar_type })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @ApiOkResponse({ type: [WalmartCalendarDto] })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Get('calendars')
  findAllCalendarsForBrand(
    @Param('brandId', new ParseIntPipe()) brandId: number,
    @Query('search') search?: string,
    @Query('campaign_id') campaign_id?: string,
    @Query('walmart_tagId') walmart_tagId?: string,
    @Query('type') type?: calendar_type,
  ) {
    return this.commerceDb.walmart_calendar.findMany({
      where: {
        brands: { id: brandId },
        AND: {
          OR: [
            campaign_id ? { walmart_campaigns: { every: { id: parseInt(campaign_id) } } } : {},
            walmart_tagId ? { walmart_tags: { every: { id: parseInt(walmart_tagId) } } } : {},
            search ? { name: { contains: search } } : {},
          ].filter(Boolean),
          ...(type ? { type } : {}),
        },
      },
      include: {
        brands: { select: { id: true, name: true, u_amazon_seller_name: true } },
        walmart_tags: true,
        periods: true,
      },
    });
  }

  @ApiOperation({ summary: 'Add a period to a calendar' })
  @ApiResponse({ status: 201, description: 'Period added successfully.', type: WalmartCalendarPeriodDto })
  @ApiBody({ type: CreateWalmartCalendarPeriodDto })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Post('calendars/:calendarId/periods')
  addPeriodToCalendar(
    @Param('calendarId', new ParseIntPipe()) calendarId: number,
    @Body() createPeriodDto: CreateWalmartCalendarPeriodDto,
  ) {
    return this.commerceDb.walmart_calendar_period.create({
      data: {
        ...createPeriodDto,
        calendarId,
      },
    });
  }

  @ApiOperation({ summary: 'Update a period' })
  @ApiResponse({ status: 200, description: 'Period updated successfully.', type: WalmartCalendarPeriodDto })
  @ApiParam({ name: 'id', description: 'Period ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @ApiBody({ type: UpdateWalmartCalendarPeriodDto })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Put('periods/:id')
  updatePeriod(@Param('id', new ParseIntPipe()) id: number, @Body() updatePeriodDto: UpdateWalmartCalendarPeriodDto) {
    return this.commerceDb.walmart_calendar_period.update({
      where: { id },
      data: {
        ...updatePeriodDto,
      },
    });
  }

  @ApiOperation({ summary: 'Delete a period' })
  @ApiResponse({ status: 200, description: 'Period deleted successfully.', type: WalmartCalendarPeriodDto })
  @ApiParam({ name: 'id', description: 'Period ID' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @UseInterceptors(WalmartConfigMiddleware)
  @Delete('periods/:id')
  deletePeriod(@Param('id', new ParseIntPipe()) id: number) {
    return this.commerceDb.walmart_calendar_period.delete({
      where: { id },
    });
  }
}
