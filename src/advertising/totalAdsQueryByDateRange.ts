export const totalAdsQueryByDateRange = ({
  start_date,
  end_date,
  brandId,
}: {
  start_date: string;
  end_date: string;
  brandId: string;
}) => `WITH product_data AS (
       SELECT b.report_date AS report_date,
              IFNULL(SUM(b.impressions), 0) AS impression,
              IFNULL(SUM(b.clicks), 0) AS clicks,
              IFNULL(SUM(b.attributed_conversions14d), 0) AS conversions,
              IFNULL(SUM(b.attributed_units_ordered14d), 0) AS unit_ordered,
              ROUND(IFNULL(SUM(b.attributed_sales7d), 0), 2) AS revenue,
              ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
       FROM advertising_product_report b
       WHERE b.report_date BETWEEN "${start_date}" AND "${end_date}"
       GROUP BY b.report_date
),
 dsp_api_data AS (SELECT d.date                                 AS date,
                             ROUND(IFNULL(SUM(d.totalSales), 0), 2) AS revenue,
                             ROUND(IFNULL(SUM(d.totalCost), 0), 2)  AS spend
                      FROM vendo_commerce.dsp_data d
                      WHERE d.date BETWEEN "${start_date}" AND "${end_date}"
                        AND brandsId = ${brandId}
                      GROUP BY d.date),
     dsp_manual_data AS (SELECT b.report_date                     AS date,
                                ROUND(IFNULL(SUM(b.sales), 0), 2) AS revenue,
                                ROUND(IFNULL(SUM(b.spend), 0), 2) AS spend
                         FROM vendo_commerce.manual_dsp_data b
                         WHERE b.report_date BETWEEN "${start_date}" AND "${end_date}"
                           AND brandsId = ${brandId}
                         GROUP BY b.report_date),
     dsp_combined AS (
    SELECT api_data.date AS date,
           api_data.revenue AS api_revenue,
           api_data.spend AS api_spend,
           IFNULL(manual_data.revenue, 0) AS manual_revenue,
           IFNULL(manual_data.spend, 0) AS manual_spend
    FROM dsp_api_data api_data
    LEFT JOIN dsp_manual_data manual_data ON api_data.date = manual_data.date
    UNION
    SELECT manual_data.date AS date,
           IFNULL(api_data.revenue, 0) AS api_revenue,
           IFNULL(api_data.spend, 0) AS api_spend,
           manual_data.revenue AS manual_revenue,
           manual_data.spend AS manual_spend
    FROM dsp_manual_data manual_data
    LEFT JOIN dsp_api_data api_data ON api_data.date = manual_data.date
),
dsp_total_sums AS (
    SELECT SUM(api_revenue) AS total_api_revenue,
           SUM(api_spend) AS total_api_spend,
           SUM(manual_revenue) AS total_manual_revenue,
           SUM(manual_spend) AS total_manual_spend
    FROM dsp_combined
),
dsp_data AS (
    SELECT date as report_date,
           CASE
               WHEN (SELECT total_api_spend FROM dsp_total_sums) > (SELECT total_manual_spend FROM dsp_total_sums) THEN api_spend
               ELSE manual_spend
           END AS spend,
           CASE
               WHEN (SELECT total_api_revenue FROM dsp_total_sums) > (SELECT total_manual_revenue FROM dsp_total_sums) THEN api_revenue
               ELSE manual_revenue
           END AS revenue
    FROM dsp_combined
),
brands_data AS (
       SELECT b.report_date AS report_date,
              IFNULL(SUM(b.impressions), 0) AS impression,
              IFNULL(SUM(b.clicks), 0) AS clicks,
              IFNULL(SUM(b.attributed_conversions_14d), 0) AS conversions,
              ROUND(IFNULL(SUM(b.attributed_sales_14d), 0), 2) AS revenue,
              ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend,
              0 AS unit_ordered
       FROM advertising_brands_video_campaigns_report b
       WHERE b.report_date BETWEEN "${start_date}" AND "${end_date}"
       GROUP BY b.report_date
),
display_data AS (
       SELECT b.report_date AS report_date,
              IFNULL(SUM(b.impressions), 0) AS impression,
              IFNULL(SUM(b.clicks), 0) AS clicks,
              IFNULL(SUM(b.attributed_conversions14d), 0) AS conversions,
              IFNULL(SUM(b.attributed_units_ordered14d), 0) AS unit_ordered,
              ROUND(IFNULL(SUM(b.attributed_sales14d), 0), 2) AS revenue,
              ROUND(IFNULL(SUM(b.cost), 0), 2) AS spend
       FROM advertising_display_campaigns_report b
       WHERE b.report_date BETWEEN "${start_date}" AND "${end_date}"
       GROUP BY b.report_date
),
product_brand_data AS (
       SELECT pd.report_date AS report_date,
              pd.impression AS pd_impression,
              pd.clicks AS pd_clicks,
              pd.conversions AS pd_conversions,
              pd.unit_ordered AS pd_unit_ordered,
              pd.revenue AS pd_revenue,
              pd.spend AS pd_spend,
              bd.impression AS bd_impression,
              bd.clicks AS bd_clicks,
              bd.conversions AS bd_conversions,
              bd.revenue AS bd_revenue,
              bd.spend AS bd_spend,
              bd.unit_ordered AS bd_unit_ordered
       FROM product_data pd
              LEFT OUTER JOIN brands_data bd ON pd.report_date = bd.report_date
       UNION
       SELECT bd.report_date AS report_date,
              pd.impression AS pd_impression,
              pd.clicks AS pd_clicks,
              pd.conversions AS pd_conversions,
              pd.unit_ordered AS pd_unit_ordered,
              pd.revenue AS pd_revenue,
              pd.spend AS pd_spend,
              bd.impression AS bd_impression,
              bd.clicks AS bd_clicks,
              bd.conversions AS bd_conversions,
              bd.revenue AS bd_revenue,
              bd.spend AS bd_spend,
              bd.unit_ordered AS bd_unit_ordered
       FROM product_data pd
              RIGHT OUTER JOIN brands_data bd ON pd.report_date = bd.report_date
),
product_brand_dsp_data AS (
       SELECT pbd.*,
              dd.revenue as dsp_revenue,
              dd.spend as dsp_spend
       FROM product_brand_data pbd
              LEFT OUTER JOIN dsp_data dd ON pbd.report_date = dd.report_date
       UNION
       SELECT dd.report_date AS report_date,
              pbd.pd_impression,
              pbd.pd_clicks,
              pbd.pd_conversions,
              pbd.pd_unit_ordered,
              pbd.pd_revenue,
              pbd.pd_spend,
              pbd.bd_impression,
              pbd.bd_clicks,
              pbd.bd_conversions,
              pbd.bd_revenue,
              pbd.bd_spend,
              pbd.bd_unit_ordered,
              dd.revenue AS dsp_revenue,
              dd.spend AS dsp_spend
       FROM product_brand_data pbd
              RIGHT OUTER JOIN dsp_data dd ON pbd.report_date = dd.report_date
),
all_api_data AS (
       SELECT pbd.*,
              dd.impression AS dd_impression,
              dd.clicks AS dd_clicks,
              dd.conversions AS dd_conversions,
              dd.unit_ordered AS dd_unit_ordered,
              dd.revenue AS dd_revenue,
              dd.spend AS dd_spend
       FROM product_brand_dsp_data pbd
              LEFT OUTER JOIN display_data dd ON pbd.report_date = dd.report_date
       UNION
       SELECT dd.report_date AS report_date,
              pbd.pd_impression,
              pbd.pd_clicks,
              pbd.pd_conversions,
              pbd.pd_unit_ordered,
              pbd.pd_revenue,
              pbd.pd_spend,
              pbd.bd_impression,
              pbd.bd_clicks,
              pbd.bd_conversions,
              pbd.bd_revenue,
              pbd.bd_spend,
              pbd.bd_unit_ordered,
              pbd.dsp_revenue,
              pbd.dsp_spend,
              dd.impression AS dd_impression,
              dd.clicks AS dd_clicks,
              dd.conversions AS dd_conversions,
              dd.unit_ordered AS dd_unit_ordered,
              dd.revenue AS dd_revenue,
              dd.spend AS dd_spend
       FROM product_brand_dsp_data pbd
              RIGHT OUTER JOIN display_data dd ON pbd.report_date = dd.report_date
),
api_partial_aggregated_data AS (
       SELECT base.report_date AS report_date,
              COALESCE(base.pd_impression, 0) + COALESCE(base.dd_impression, 0) + COALESCE(base.bd_impression, 0) as impression,
              COALESCE(base.pd_clicks, 0) + COALESCE(base.dd_clicks, 0) + COALESCE(base.bd_clicks, 0) as clicks,
              COALESCE(base.pd_conversions, 0) + COALESCE(base.dd_conversions, 0) + COALESCE(base.bd_conversions, 0) as conversions,
              COALESCE(base.pd_unit_ordered, 0) + COALESCE(base.dd_unit_ordered, 0) as unit_ordered,
              COALESCE(base.pd_revenue, 0) + COALESCE(base.dd_revenue, 0) + COALESCE(base.dsp_revenue, 0) + COALESCE(base.bd_revenue, 0) as revenue,
              COALESCE(base.pd_spend, 0) + COALESCE(base.dd_spend, 0) + COALESCE(base.dsp_spend, 0) + COALESCE(base.bd_spend, 0) as spend,
              COALESCE(base.pd_spend, 0) as product_spend,
              COALESCE(base.dd_spend, 0) as display_spend,
              COALESCE(base.bd_spend, 0) as brand_spend,
              COALESCE(base.dsp_spend, 0) as dsp_spend,
              COALESCE(base.pd_revenue, 0) as product_revenue,
              COALESCE(base.dd_revenue, 0) as display_revenue,
              COALESCE(base.bd_revenue, 0) as brand_revenue,
              COALESCE(base.dsp_revenue, 0) as dsp_revenue
       FROM all_api_data base
),
api_aggregated_data AS (
       SELECT base.*,
              ROUND(base.spend / base.unit_ordered, 2) as CPO,
              ROUND(base.spend / base.clicks, 2) as CPC,
              ROUND(base.revenue / base.spend, 2) as ROAS,
              ROUND(base.spend / base.revenue, 2) as ACoS,
              ROUND(base.spend / base.revenue * 100, 2) as ACoS_percentage
       FROM api_partial_aggregated_data as base
),
manual_data AS (
       SELECT amr.report_date as report_date,
              SUM(amr.impression) as impression,
              SUM(amr.clicks) as clicks,
              SUM(amr.unit_ordered) as unit_ordered,
              SUM(amr.revenue) as revenue,
              SUM(amr.spend) as spend,
              SUM(product_spend) as product_spend,
              SUM(brand_spend) as brand_spend,
              SUM(display_spend) as display_spend,
              0 as dsp_spend,
              SUM(product_revenue) as product_revenue,
              SUM(brand_revenue) as brand_revenue,
              SUM(display_revenue) as display_revenue,
              0 as dsp_revenue
       FROM ads_manual_aggregated amr
       WHERE amr.report_date BETWEEN "${start_date}" AND "${end_date}"
       GROUP BY amr.report_date
),
manual_acos_data AS (
       SELECT manual_data.*,
              ROUND(manual_data.spend / manual_data.revenue, 2) as ACoS,
              ROUND(
                     (manual_data.spend / manual_data.revenue) * 100,
                     2
              ) as ACoS_percentage,
              ROUND(manual_data.spend / manual_data.unit_ordered, 2) as CPO,
              ROUND(manual_data.spend / manual_data.clicks, 2) as CPC,
              ROUND(manual_data.revenue / manual_data.spend, 2) as ROAS
       FROM manual_data
)
SELECT GREATEST(
              COALESCE(manual.report_date, 0),
              COALESCE(api.report_date, 0)
       ) as report_date,
       GREATEST(
              COALESCE(manual.impression, 0),
              COALESCE(api.impression, 0)
       ) impressions,
       GREATEST(
              COALESCE(manual.clicks, 0),
              COALESCE(api.clicks, 0)
       ) clicks,
       GREATEST(
              COALESCE(manual.unit_ordered, 0),
              COALESCE(api.unit_ordered, 0)
       ) unit_ordered,
       GREATEST(
              COALESCE(manual.revenue, 0),
              COALESCE(api.revenue, 0)
       ) revenue,
       GREATEST(
              COALESCE(manual.spend, 0),
              COALESCE(api.spend, 0)
       ) spend,
       GREATEST(COALESCE(manual.ACoS, 0), COALESCE(api.ACoS, 0)) ACoS,
       GREATEST(COALESCE(manual.ROAS, 0), COALESCE(api.ROAS, 0)) ROAS,
       GREATEST(COALESCE(manual.CPC, 0), COALESCE(api.CPC, 0)) CPC,
       GREATEST(
              COALESCE(manual.ACoS_percentage, 0),
              COALESCE(api.ACoS_percentage, 0)
       ) ACoS_percentage,
       GREATEST(COALESCE(manual.CPO, 0), COALESCE(api.CPO, 0)) CPO,
       GREATEST(COALESCE(api.conversions, 0), 0) conversions,
       GREATEST(
              COALESCE(manual.product_spend, 0),
              COALESCE(api.product_spend, 0)
       ) product_spend,
       GREATEST(
              COALESCE(manual.brand_spend, 0),
              COALESCE(api.brand_spend, 0)
       ) brand_spend,
       GREATEST(
              COALESCE(manual.display_spend, 0),
              COALESCE(api.display_spend, 0)
       ) display_spend,
       GREATEST(
              COALESCE(manual.dsp_spend, 0),
              COALESCE(api.dsp_spend, 0)
       ) dsp_spend,
       GREATEST(
              COALESCE(manual.product_revenue, 0),
              COALESCE(api.product_revenue, 0)
       ) product_revenue,
       GREATEST(
              COALESCE(manual.brand_revenue, 0),
              COALESCE(api.brand_revenue, 0)
       ) brand_revenue,
       GREATEST(
              COALESCE(manual.display_revenue, 0),
              COALESCE(api.display_revenue, 0)
       ) display_revenue,
       GREATEST(
              COALESCE(manual.dsp_revenue, 0),
              COALESCE(api.dsp_revenue, 0)
       ) dsp_revenue
FROM api_aggregated_data api
       LEFT OUTER JOIN manual_acos_data manual ON api.report_date = manual.report_date
UNION
SELECT GREATEST(
              COALESCE(manual.report_date, 0),
              COALESCE(api.report_date, 0)
       ) report_date,
       GREATEST(
              COALESCE(manual.impression, 0),
              COALESCE(api.impression, 0)
       ) impressions,
       GREATEST(
              COALESCE(manual.clicks, 0),
              COALESCE(api.clicks, 0)
       ) clicks,
       GREATEST(
              COALESCE(manual.unit_ordered, 0),
              COALESCE(api.unit_ordered, 0)
       ) unit_ordered,
       GREATEST(
              COALESCE(manual.revenue, 0),
              COALESCE(api.revenue, 0)
       ) revenue,
       GREATEST(
              COALESCE(manual.spend, 0),
              COALESCE(api.spend, 0)
       ) spend,
       GREATEST(COALESCE(manual.ACoS, 0), COALESCE(api.ACoS, 0)) ACoS,
       GREATEST(COALESCE(manual.ROAS, 0), COALESCE(api.ROAS, 0)) ROAS,
       GREATEST(COALESCE(manual.CPC, 0), COALESCE(api.CPC, 0)) CPC,
       GREATEST(
              COALESCE(manual.ACoS_percentage, 0),
              COALESCE(api.ACoS_percentage, 0)
       ) ACoS_percentage,
       GREATEST(COALESCE(manual.CPO, 0), COALESCE(api.CPO, 0)) CPO,
       GREATEST(COALESCE(api.conversions, 0), 0) conversions,
       GREATEST(
              COALESCE(manual.product_spend, 0),
              COALESCE(api.product_spend, 0)
       ) product_spend,
       GREATEST(
              COALESCE(manual.brand_spend, 0),
              COALESCE(api.brand_spend, 0)
       ) brand_spend,
       GREATEST(
              COALESCE(manual.display_spend, 0),
              COALESCE(api.display_spend, 0)
       ) display_spend,
       GREATEST(
              COALESCE(manual.dsp_spend, 0),
              COALESCE(api.dsp_spend, 0)
       ) display_spend,
       GREATEST(
              COALESCE(manual.product_revenue, 0),
              COALESCE(api.product_revenue, 0)
       ) product_revenue,
       GREATEST(
              COALESCE(manual.brand_revenue, 0),
              COALESCE(api.brand_revenue, 0)
       ) brand_revenue,
       GREATEST(
              COALESCE(manual.display_revenue, 0),
              COALESCE(api.display_revenue, 0)
       ) display_revenue,
       GREATEST(
              COALESCE(manual.dsp_revenue, 0),
              COALESCE(api.dsp_revenue, 0)
       ) display_revenue
FROM api_aggregated_data api
       RIGHT OUTER JOIN manual_acos_data manual ON api.report_date = manual.report_date
                `;
