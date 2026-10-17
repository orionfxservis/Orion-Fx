import { CurrencyConfig } from '../types/invoice';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'PKR', symbol: 'Rs. ', name: 'Pak Rs (Rs.)', rateAgainstUSD: 278.5, position: 'prefix' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)', rateAgainstUSD: 1.0, position: 'prefix' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)', rateAgainstUSD: 0.92, position: 'prefix' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)', rateAgainstUSD: 0.78, position: 'prefix' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham (AED)', rateAgainstUSD: 3.67, position: 'prefix' },
  { code: 'SAR', symbol: 'SAR ', name: 'Saudi Riyal (SAR)', rateAgainstUSD: 3.75, position: 'prefix' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)', rateAgainstUSD: 1.36, position: 'prefix' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)', rateAgainstUSD: 1.51, position: 'prefix' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)', rateAgainstUSD: 154.2, position: 'prefix' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', rateAgainstUSD: 83.5, position: 'prefix' },
  { code: 'CHF', symbol: 'CHF ', name: 'Swiss Franc (CHF)', rateAgainstUSD: 0.91, position: 'prefix' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)', rateAgainstUSD: 1.35, position: 'prefix' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (R$)', rateAgainstUSD: 5.15, position: 'prefix' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan (¥)', rateAgainstUSD: 7.23, position: 'prefix' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso (Mex$)', rateAgainstUSD: 16.8, position: 'prefix' },
  { code: 'ZAR', symbol: 'R ', name: 'South African Rand (R)', rateAgainstUSD: 18.6, position: 'prefix' },
  { code: 'SEK', symbol: ' kr', name: 'Swedish Krona (kr)', rateAgainstUSD: 10.7, position: 'suffix' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar (NZ$)', rateAgainstUSD: 1.64, position: 'prefix' },
];

export function getCurrency(code: string): CurrencyConfig {
  if (!code) return SUPPORTED_CURRENCIES[0];
  const clean = code.toUpperCase().trim();
  if (clean === 'RS' || clean === 'RS.' || clean === 'PAK RS' || clean === 'PAK RS (RS.)' || clean === 'PKR') {
    return SUPPORTED_CURRENCIES.find((c) => c.code === 'PKR') || SUPPORTED_CURRENCIES[0];
  }
  const found = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === clean);
  return found || SUPPORTED_CURRENCIES[0];
}

export function convertToPKR(amount: number, fromCurrencyCode: string = 'PKR'): number {
  const from = getCurrency(fromCurrencyCode);
  if (from.code === 'PKR') {
    return amount;
  }
  const pkrConfig = SUPPORTED_CURRENCIES.find((c) => c.code === 'PKR') || SUPPORTED_CURRENCIES[0];
  const rateToUSD = from.rateAgainstUSD || 1.0;
  const amountInUSD = amount / rateToUSD;
  const pkrRate = pkrConfig.rateAgainstUSD || 278.5;
  return amountInUSD * pkrRate;
}

export function formatCurrency(amount: number, currencyCode: string = 'PKR'): string {
  const curr = getCurrency(currencyCode);
  const formattedNumber = amount.toLocaleString(undefined, {
    minimumFractionDigits: curr.code === 'JPY' ? 0 : 2,
    maximumFractionDigits: curr.code === 'JPY' ? 0 : 2,
  });

  // Convert whitespace to non-breaking space to guarantee currency symbol and figures stay strictly on one line
  const symbol = (curr.symbol || '').replace(/\s+/g, '\u00A0');

  if (curr.position === 'suffix') {
    return `${formattedNumber}${symbol}`;
  }
  return `${symbol}${formattedNumber}`;
}

