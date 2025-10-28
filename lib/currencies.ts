// Currency definitions
export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', code: 'KES' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY' },
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
  ZAR: { symbol: 'R', name: 'South African Rand', code: 'ZAR' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', code: 'NGN' },
  GHS: { symbol: '₵', name: 'Ghanaian Cedi', code: 'GHS' },
  TZS: { symbol: 'TSh', name: 'Tanzanian Shilling', code: 'TZS' },
  UGX: { symbol: 'USh', name: 'Ugandan Shilling', code: 'UGX' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatCurrency(amount: number, currencyCode: string = 'KES'): string {
  const currency = CURRENCIES[currencyCode as CurrencyCode] || CURRENCIES.KES;
  
  // Format the number with commas
  const formattedAmount = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency.symbol} ${formattedAmount}`;
}

export function getCurrencySymbol(currencyCode: string = 'KES'): string {
  const currency = CURRENCIES[currencyCode as CurrencyCode] || CURRENCIES.KES;
  return currency.symbol;
}

