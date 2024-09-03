export function getMarketplaceIds(marketplaceId = null, flagIcon = false, isConsole = false) {
  const data = [
    {
      id: 'A2Q3Y263D00KWC',
      name: 'Brazil',
      url: 'https://mws.amazonservices.com/',
      region: 'North America Region',
      sales_channel: 'Amazon.com.br',
      flag: null,
    },
    {
      id: 'A2EUQ1WTGCTBG2',
      name: 'Canada',
      url: 'https://mws.amazonservices.ca/',
      region: 'North America Region',
      sales_channel: 'Amazon.ca',
      flag: !isConsole ? '/assets_ea_theme/flags/canada.png' : null,
    },
    {
      id: 'A1AM78C64UM0Y8',
      name: 'Mexico',
      url: 'https://mws.amazonservices.com.mx/',
      region: 'North America Region',
      sales_channel: 'Amazon.com.mx',
      flag: !isConsole ? '/assets_ea_theme/flags/mexico.png' : null,
    },
    {
      id: 'ATVPDKIKX0DER',
      name: 'USA',
      url: 'https://mws.amazonservices.com/',
      region: 'North America Region',
      sales_channel: 'Amazon.com',
      flag: !isConsole ? '/assets_ea_theme/flags/united-states-of-america.png' : null,
    },
    {
      id: 'A2VIGQ35RCS4UG',
      name: 'United Arab Emirates (U.A.E.)',
      url: 'https://mws.amazonservices.ae/',
      region: 'Europe Region',
      sales_channel: 'Amazon.ae',
      flag: !isConsole ? '/assets_ea_theme/flags/united-arab-emirates.png' : null,
    },
    {
      id: 'A1PA6795UKMFR9',
      name: 'Germany',
      url: 'https://mws-eu.amazonservices.com/',
      region: 'Europe Region',
      sales_channel: 'Amazon.de',
      flag: !isConsole ? '/assets_ea_theme/flags/germany.png' : null,
    },
    {
      id: 'A1RKKUPIHCS9HS',
      name: 'Spain',
      url: 'https://mws-eu.amazonservices.com/',
      region: 'Europe Region',
      sales_channel: 'Amazon.es',
      flag: !isConsole ? '/assets_ea_theme/flags/spain.png' : null,
    },
    {
      id: 'A13V1IB3VIYZZH',
      name: 'France',
      url: 'https://mws-eu.amazonservices.com/',
      region: 'Europe Region',
      sales_channel: 'Amazon.fr',
      flag: !isConsole ? '/assets_ea_theme/flags/france.png' : null,
    },
    {
      id: 'A1F83G8C2ARO7P',
      name: 'UK',
      url: 'https://mws-eu.amazonservices.com/',
      region: 'Europe Region',
      sales_channel: 'Amazon.uk',
      flag: !isConsole ? '/assets_ea_theme/flags/united-kingdom.png' : null,
    },
    {
      id: 'A21TJRUUN4KGV',
      name: 'India',
      url: 'https://mws.amazonservices.in/',
      region: 'Europe Region',
      sales_channel: 'Amazon.in',
      flag: !isConsole ? '/assets_ea_theme/flags/india.png' : null,
    },
    {
      id: 'APJ6JRA9NG5V4',
      name: 'Italy',
      url: 'https://mws-eu.amazonservices.com/',
      region: 'Europe Region',
      sales_channel: 'Amazon.it',
      flag: !isConsole ? '/assets_ea_theme/flags/italy.png' : null,
    },
    {
      id: 'A1805IZSGTT6HS',
      name: 'Netherlands',
      url: 'https://mws-eu.amazonservices.com/',
      region: 'Europe Region',
      sales_channel: 'Amazon.nl',
      flag: !isConsole ? '/assets_ea_theme/flags/italy.png' : null,
    },
    {
      id: 'A17E79C6D8DWNP',
      name: 'Saudi Arabia',
      url: 'https://mws-eu.amazonservices.com/',
      region: 'Europe Region',
      sales_channel: 'Amazon.sa',
      flag: null,
    },
    {
      id: 'A33AVAJ2PDY3EV',
      name: 'Turkey',
      url: 'https://mws-eu.amazonservices.com/',
      region: 'Europe Region',
      sales_channel: 'Amazon.tr',
      flag: !isConsole ? '/assets_ea_theme/flags/turkey.png' : null,
    },
    {
      id: 'A19VAU5U5O7RUS',
      name: 'Singapore',
      url: 'https://mws-fe.amazonservices.com/',
      region: 'Far East Region',
      sales_channel: 'Amazon.sg',
      flag: null,
    },
    {
      id: 'A39IBJ37TRP1C6',
      name: 'Australia',
      url: 'https://mws.amazonservices.com.au/',
      region: 'Far East Region',
      sales_channel: 'Amazon.au',
      flag: null,
    },
    {
      id: 'A1VC38T7YXB528',
      name: 'Japan',
      url: 'https://mws.amazonservices.jp/',
      region: 'Far East Region',
      sales_channel: 'Amazon.jp',
      flag: null,
    },
    {
      id: 'AAHKV2X7AFYLW',
      name: 'China',
      url: 'https://mws.amazonservices.com.cn/',
      region: 'China Region',
      sales_channel: 'Amazon.cn',
      flag: null,
    },
  ];

  if (flagIcon) {
    const key = data.findIndex((item) => item.id === marketplaceId);
    if (key !== -1) {
      return data[key].flag;
    } else {
      return null;
    }
  } else {
    if (marketplaceId) {
      const key = data.findIndex((item) => item.id === marketplaceId);
      if (key !== -1) {
        return {
          name: data[key].name,
          url: data[key].url,
          flag: data[key].flag,
          region: data[key].region,
          sales_channel: data[key].sales_channel,
        };
      } else {
        return null;
      }
    }
  }
}
