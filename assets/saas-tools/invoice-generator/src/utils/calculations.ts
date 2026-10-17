import { Invoice } from '../types/invoice';

export interface InvoiceCalculations {
  subtotal: number;
  itemDiscountsTotal: number;
  globalDiscountAmount: number;
  taxableAmount: number;
  primaryTaxAmount: number;
  compoundTaxAmount: number;
  totalTaxAmount: number;
  shippingOrFees: number;
  grandTotal: number;
}

export function calculateInvoice(invoice: Invoice | null | undefined): InvoiceCalculations {
  let subtotal = 0;
  let itemDiscountsTotal = 0;

  if (!invoice) {
    return {
      subtotal: 0,
      itemDiscountsTotal: 0,
      globalDiscountAmount: 0,
      taxableAmount: 0,
      primaryTaxAmount: 0,
      compoundTaxAmount: 0,
      totalTaxAmount: 0,
      shippingOrFees: 0,
      grandTotal: 0,
    };
  }

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  for (const item of items) {
    if (!item) continue;
    const rawTotal = (item.quantity || 0) * (item.unitPrice || 0);
    const itemDiscountPct = item.itemDiscount || 0;
    const itemDiscountVal = (rawTotal * itemDiscountPct) / 100;
    
    subtotal += rawTotal;
    itemDiscountsTotal += itemDiscountVal;
  }

  const postItemDiscountSubtotal = Math.max(0, subtotal - itemDiscountsTotal);

  let globalDiscountAmount = 0;
  if (invoice.discountType === 'percentage') {
    globalDiscountAmount = (postItemDiscountSubtotal * (invoice.discountValue || 0)) / 100;
  } else {
    globalDiscountAmount = invoice.discountValue || 0;
  }
  globalDiscountAmount = Math.min(globalDiscountAmount, postItemDiscountSubtotal);

  const taxableAmount = Math.max(0, postItemDiscountSubtotal - globalDiscountAmount);

  let primaryTaxAmount = 0;
  if (invoice.taxType !== 'none' && invoice.taxRate > 0) {
    primaryTaxAmount = (taxableAmount * invoice.taxRate) / 100;
  }

  let compoundTaxAmount = 0;
  if (invoice.taxType !== 'none' && (invoice.compoundTaxRate || 0) > 0) {
    // Compound tax on top of (taxableAmount + primaryTaxAmount)
    compoundTaxAmount = ((taxableAmount + primaryTaxAmount) * (invoice.compoundTaxRate || 0)) / 100;
  }

  const totalTaxAmount = primaryTaxAmount + compoundTaxAmount;
  const shippingOrFees = invoice.shippingOrFees || 0;

  const grandTotal = Math.max(0, taxableAmount + totalTaxAmount + shippingOrFees);

  return {
    subtotal,
    itemDiscountsTotal,
    globalDiscountAmount,
    taxableAmount,
    primaryTaxAmount,
    compoundTaxAmount,
    totalTaxAmount,
    shippingOrFees,
    grandTotal,
  };
}

export function getDueDateStatus(dueDateStr: string, status: string): {
  label: string;
  isOverdue: boolean;
  daysDiff: number;
  colorClass: string;
} {
  if (status === 'paid') {
    return { label: 'Paid in Full', isOverdue: false, daysDiff: 0, colorClass: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (status === 'cancelled') {
    return { label: 'Cancelled', isOverdue: false, daysDiff: 0, colorClass: 'text-neutral-500 dark:text-neutral-400' };
  }

  if (!dueDateStr) {
    return { label: 'No Due Date', isOverdue: false, daysDiff: 0, colorClass: 'text-neutral-500' };
  }

  const due = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
      isOverdue: true,
      daysDiff: diffDays,
      colorClass: 'text-rose-600 dark:text-rose-400',
    };
  } else if (diffDays === 0) {
    return {
      label: 'Due Today',
      isOverdue: false,
      daysDiff: 0,
      colorClass: 'text-amber-600 dark:text-amber-400',
    };
  } else if (diffDays <= 3) {
    return {
      label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      isOverdue: false,
      daysDiff: diffDays,
      colorClass: 'text-amber-600 dark:text-amber-400',
    };
  } else {
    return {
      label: `Due in ${diffDays} days`,
      isOverdue: false,
      daysDiff: diffDays,
      colorClass: 'text-neutral-600 dark:text-neutral-400',
    };
  }
}
