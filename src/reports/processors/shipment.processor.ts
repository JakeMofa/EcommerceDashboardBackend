import { Job, DoneCallback } from 'bull';
import { PrismaClient as PrismaVendoCommerce } from '../../../prisma/commerce/generated/vendoCommerce';
import { PrismaClient as PrismaVendoBrand } from '../../../prisma/brand/generated/vendoBrand';
import * as process from 'process';

const newVsRepeatQuery = ({ week, brandId }: { week: boolean; brandId: number }) => {
  const period_variable = week ? 'week' : 'month';
  const period_Function = week ? 'WEEK' : 'MONTH';
  const table_name = week ? 'weekly_customer_acquistion' : 'monthly_customer_acquistion';
  return `
      INSERT INTO vendo_commerce.${table_name}
    (year,${period_variable}, unique_buyer, unique_buyer_sale,returned_buyer, returned_buyer_sale,brandId)
    with purchase_status as (
        select ga.*,
               if(${period_Function}(ga.purchase_date) = fga.min_${period_variable} and YEAR(ga.purchase_date) = fga.min_year, 'new',
                  'repeated') as purchase_status
        from get_amazon_fulfilled_shipments_data_general ga
                 left join (
            select buyer_email, YEAR(min(purchase_date)) as min_year, ${period_Function}(min(purchase_date)) as min_${period_variable}
            from get_amazon_fulfilled_shipments_data_general ga1
            group by ga1.buyer_email) fga on fga.buyer_email = ga.buyer_email),
         period_count as (
             select ps.year,
                    ps.${period_variable},
                    ps.purchase_status,
                    count(distinct ps.buyer_email) as count,
                    sum(item_price)                as sale
             from purchase_status ps
             group by ps.year, ps.${period_variable}, ps.purchase_status
             order by ps.year, ps.${period_variable})
    select wk.year,
           wk.${period_variable},
           sum(IF(wk.purchase_status = 'new', wk.count, 0))      as unique_buyer,
           sum(IF(wk.purchase_status = 'new', wk.sale, 0))       as unique_buyer_sale,
           sum(IF(wk.purchase_status = 'repeated', wk.count, 0)) as returned_buyer,
           sum(IF(wk.purchase_status = 'repeated', wk.sale, 0))  as returned_buyer_sale,
           ${brandId}
    from period_count wk
    GROUP BY year, ${period_variable}
    ON DUPLICATE KEY UPDATE unique_buyer = VALUES(unique_buyer),
                            returned_buyer = VALUES(returned_buyer),
                            unique_buyer_sale = VALUES(unique_buyer_sale),
                            returned_buyer_sale = VALUES(returned_buyer_sale);
    `;
};
export default async function (job: Job<{ brandId: number }>, cb: DoneCallback) {
  const vendoCommerceDB = new PrismaVendoCommerce({
    datasources: {
      db: {
        url: process.env.DATABASE_VENDO_COMMERCE_URL,
      },
    },
  });
  await vendoCommerceDB.$connect();
  const brand = await vendoCommerceDB.brands.findFirst({
    where: {
      id: job.data.brandId,
    },
  });
  if (!brand) {
    cb(null, { brandId: job.data.brandId, isSuccess: false });
    return false;
  }
  const vendoBrandDB = new PrismaVendoBrand({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '' + brand.db_name,
      },
    },
  });
  await vendoBrandDB.$connect();
  try {
    await vendoBrandDB.$transaction([
      vendoBrandDB.$executeRawUnsafe(newVsRepeatQuery({ week: true, brandId: job.data.brandId })),
      vendoBrandDB.$executeRawUnsafe(newVsRepeatQuery({ week: false, brandId: job.data.brandId })),
    ]);
    cb(null, { brandId: job.data.brandId, isSuccess: true });
  } catch (e) {
    cb(e, { brandId: job.data.brandId, isSuccess: false });
  } finally {
    await vendoCommerceDB.$disconnect();
    await vendoBrandDB.$disconnect();
  }
}
