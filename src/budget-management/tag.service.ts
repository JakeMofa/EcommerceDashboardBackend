import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { VendoCommerceDBService } from 'src/prisma.service';
import { CampaignService } from './campaign.service';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);
  constructor(
    @Inject(forwardRef(() => CampaignService))
    private readonly campaignService: CampaignService,
    private readonly commerceDb: VendoCommerceDBService,
  ) {}

  async findAllTags({ brandId, search }: { brandId: number; search?: string }) {
    const tags = await this.commerceDb.walmart_tag.findMany({
      where: {
        brand: { id: brandId },
        ...(search ? { OR: [{ name: { contains: search } }] } : {}),
      },
      include: {
        budgets: true,
        walmart_campaigns: {
          include: {
            walmart_campaign_stat: true,
          },
        },
        walmart_calendars: true,
        owner: { select: { id: true, u_name: true } },
        brand: { select: { id: true, name: true } },
      },
    });
    const tagsWithSpending = await this.campaignService.getSpendingForAllTags({ brandId });

    // Map the spending data to the tags
    const tagsWithSpend = tags.map((tag) => {
      const tagWithSpending = tagsWithSpending.find((t) => t.id === tag.id);
      return tagWithSpending ? { ...tag, spending: tagWithSpending.spending } : tag;
    });

    return tagsWithSpend;
  }
  async findByTagId({ brandId, id }: { brandId: number; id: number }) {
    const tag = await this.commerceDb.walmart_tag.findUnique({
      where: { id },
      include: {
        budgets: true,
        walmart_campaigns: {
          include: {
            walmart_campaign_stat: true,
          },
        },
        walmart_calendars: true,
        owner: { select: { id: true, u_name: true } },
        brand: { select: { id: true, name: true } },
      },
    });
    const tagWithSpending = await this.campaignService.getSpendingByTagId({ brandId, tagId: id });
    return tagWithSpending ? { ...tag, spending: tagWithSpending } : tag;
  }
}
