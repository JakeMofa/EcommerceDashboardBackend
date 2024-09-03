// import { Injectable, Logger } from '@nestjs/common';
// import { Job, DoneCallback } from 'bull';
// import { PrismaClient as PrismaVendoCommerce } from '../../../prisma/commerce/generated/vendoCommerce';
// import { WalmartCampaignClient } from 'src/walmart-reports/walmart-reports-client.service';

// @Injectable()
// export class CampaignBudgetMonitorService {
//   private readonly logger = new Logger(CampaignBudgetMonitorService.name);
//   private readonly vendoCommerceDB = new PrismaVendoCommerce({
//     datasources: {
//       db: {
//         url: process.env.DATABASE_VENDO_COMMERCE_URL,
//       },
//     },
//   });

//   constructor(private readonly walmartCampaignClient: WalmartCampaignClient) {}

//   async checkCampaignBudgets(job: Job<{ advertiserId: string; brandId: number }>, cb: DoneCallback) {
//     try {
//       await this.vendoCommerceDB.$connect();
//       const campaigns = await this.walmartCampaignClient.createClient(job.data.advertiserId).walmartCampaignListCreate({
//         data: { advertiser_id: +job.data.advertiserId },
//       });

//       for (const campaign of campaigns.data) {
//         const budgetEntries = await this.vendoCommerceDB.budgets.findMany({
//           where: {
//             brandId: job.data.brandId,
//             campaign_id: campaign.campaign_id,
//           },
//         });

//         for (const budget of budgetEntries) {
//           const stat = await this.walmartCampaignClient.createClient(job.data.advertiserId).walmartCampaignStatsRead({
//             advertiserId: job.data.advertiserId,
//             campaignId: campaign.campaign_id.toString(),
//           });

//           // if (new Date(budget.end_date) <= new Date() && campaign.status === 'PAUSED' && budget.budget > stat.data) {
//           //   this.logger.log(`Resuming campaign ${campaign.campaign_id} as it is still within budget and timeframe.`);
//           //   // Call resume function
//           // } else if (budget.budget <= stat.spending) {
//           //   this.logger.log(`Pausing campaign ${campaign.campaign_id} due to budget limit reached.`);
//           //   // Call pause function
//           // }
//         }
//       }

//       cb(null, { brandId: job.data.brandId, isSuccess: true });
//     } catch (e) {
//       this.logger.error('Error processing campaign budgets', job.data.brandId, e);
//       cb(e, { brandId: job.data.brandId, isSuccess: false });
//     } finally {
//       await this.vendoCommerceDB.$disconnect();
//     }
//   }
// }
