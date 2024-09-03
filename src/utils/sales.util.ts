export function calculateAmazonTacos(spend = 0, totalSales = 0): string {
  if (totalSales === 0) {
    return '0';
  }

  const tacos = (spend / totalSales) * 100;
  return Number.isNaN(tacos) ? '0' : tacos.toFixed(2);
}

export function isSKU(sku: string) {
  if (!sku || sku === '' || sku === '-' || sku === '--' || sku === '---') {
    return false;
  }
  return true;
}
