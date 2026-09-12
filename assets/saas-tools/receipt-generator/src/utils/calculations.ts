import { ReceiptData } from '../types';

export function calculateSubtotal(items: ReceiptData['items']): number {
  return items.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return acc + qty * price;
  }, 0);
}

export function calculateDiscount(subtotal: number, discountType: 'percent' | 'fixed', discountValue: number): number {
  const val = Number(discountValue) || 0;
  if (val <= 0) return 0;
  if (discountType === 'percent') {
    return (subtotal * Math.min(val, 100)) / 100;
  }
  return Math.min(val, subtotal);
}

export function calculateTax(taxableAmount: number, taxRate: number): number {
  const rate = Number(taxRate) || 0;
  if (rate <= 0) return 0;
  return (taxableAmount * rate) / 100;
}

export function calculateTotals(data: ReceiptData) {
  const subtotal = calculateSubtotal(data.items);
  const discountAmount = calculateDiscount(subtotal, data.discountType, data.discountValue);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = calculateTax(taxableAmount, data.taxRate);
  const shipping = Number(data.shippingFee) || 0;
  const grandTotal = Math.max(0, taxableAmount + taxAmount + shipping);
  const paidAmount = Number(data.paidAmount) || 0;
  const balanceDue = Math.max(0, grandTotal - paidAmount);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    shipping,
    grandTotal,
    paidAmount,
    balanceDue,
  };
}

export function formatMoney(amount: number, symbol: string = '$'): string {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

/**
 * Converts standard monetary number into English words
 * e.g. 655.50 -> "Six Hundred Fifty-Five Dollars and Fifty Cents"
 */
export function numberToWords(amount: number, currencyName: string = 'Dollars'): string {
  const num = Math.max(0, Number(amount) || 0);
  const whole = Math.floor(num);
  const cents = Math.round((num - whole) * 100);

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertHundreds(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + (n % 10 ? '-' + units[n % 10] : '') + ' ';
    } else if (n > 0) {
      str += units[n] + ' ';
    }
    return str.trim();
  }

  let resolvedCurrency = currencyName;
  let fractionName = 'Cents';

  if (currencyName.toLowerCase().includes('pak rs') || currencyName.toLowerCase().includes('pkr')) {
    resolvedCurrency = 'Pak Rupees';
    fractionName = 'Paisa';
  } else if (currencyName.toLowerCase().includes('rupee') || currencyName.toLowerCase().includes('inr')) {
    resolvedCurrency = 'Rupees';
    fractionName = 'Paisa';
  }

  if (whole === 0 && cents === 0) return `Zero ${resolvedCurrency}`;

  let words = '';
  const thousands = ['', 'Thousand', 'Million', 'Billion'];
  let tempWhole = whole;
  let chunkIndex = 0;

  while (tempWhole > 0) {
    const chunk = tempWhole % 1000;
    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk);
      words = chunkWords + (thousands[chunkIndex] ? ' ' + thousands[chunkIndex] + ' ' : ' ') + words;
    }
    tempWhole = Math.floor(tempWhole / 1000);
    chunkIndex++;
  }

  words = words.trim();
  if (!words) words = 'Zero';

  const centsText = cents > 0 ? ` and ${convertHundreds(cents)} ${fractionName}` : '';
  return `${words} ${resolvedCurrency}${centsText} Only`;
}
