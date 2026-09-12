import { CurrencyConfig, ReceiptData } from '../types';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'PKR', symbol: 'Rs. ', name: 'Pak Rs. (PKR)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham (AED)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AU$)' },
  { code: 'SAR', symbol: 'SAR ', name: 'Saudi Riyal (SAR)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
];

export const COLOR_PALETTES = [
  { label: 'Orion Sapphire', value: '#1e40af', hex: '#1e40af' }, // Deep Blue
  { label: 'Corporate Slate', value: '#0f172a', hex: '#0f172a' }, // Deep Slate
  { label: 'Emerald Mint', value: '#047857', hex: '#047857' }, // Emerald
  { label: 'Royal Purple', value: '#6d28d9', hex: '#6d28d9' }, // Purple
  { label: 'Amber Bronze', value: '#b45309', hex: '#b45309' }, // Amber
  { label: 'Crimson Rose', value: '#be123c', hex: '#be123c' }, // Crimson
  { label: 'Nordic Teal', value: '#0f766e', hex: '#0f766e' }, // Teal
];

export const TERMS_PRESETS = [
  {
    title: 'Pakistan Retail (FBR)',
    text: 'Exchange is possible within 7 days with original receipt and price tag. No exchange on sale/discounted items. No cash refund. Verify invoice through FBR Tax Asaan mobile app or SMS to 9966.'
  },
  {
    title: 'Standard SaaS / Services',
    text: 'Payment is due within 14 days of receipt. Invoices unpaid after 30 days are subject to a 1.5% monthly finance charge. All intellectual property remains the property of the issuer until full payment is settled.'
  },
  {
    title: 'Retail / Sales Receipt',
    text: 'Thank you for your purchase! Goods once sold can be exchanged within 7 days with the original receipt and tags intact. No cash refunds. For warranty claims, please retain this receipt.'
  },
  {
    title: 'Freelance & Consulting',
    text: 'Payment is requested via bank transfer or direct online link upon presentation. Milestone acceptance confirmed upon signature or receipt verification. Thank you for your continued partnership!'
  },
  {
    title: 'Strict No-Refund',
    text: 'All sales and digital software subscriptions are final and non-refundable once activated. Any billing inquiries must be submitted to support within 5 business days.'
  }
];

export const SAMPLE_PRODUCTS = [
  { description: 'Cloud Infrastructure & Managed SaaS Hosting', details: 'Monthly dedicated container cluster with 99.9% SLA', quantity: 1, unitPrice: 249.00 },
  { description: 'Enterprise Software License (Annual)', details: 'Includes multi-tenant access, priority support & automated backups', quantity: 1, unitPrice: 1200.00 },
  { description: 'Custom API Integration & Security Audit', details: 'OAuth2 & Webhook pipeline development (16 billable hrs)', quantity: 16, unitPrice: 75.00 },
  { description: 'UI/UX Design System Consultation', details: 'Figma component library audit & accessibility review', quantity: 1, unitPrice: 450.00 },
  { description: 'Technical Support Retainer', details: '24/7 dedicated escalation channel and SLA guarantees', quantity: 1, unitPrice: 350.00 },
];

export const INITIAL_RECEIPT_DATA: ReceiptData = {
  id: 'rcpt_001',
  receiptNumber: 'OFX-2026-0842',
  fbrInvoiceNumber: '1002341209260842',
  cashierName: 'Counter 01 / Cashier',
  receiptTime: '14:35:10',
  type: 'RECEIPT',
  status: 'PAID',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: CURRENCIES[0],
  company: {
    name: 'OrionFx Technologies Ltd.',
    tagline: 'Enterprise Cloud & Financial SaaS Solutions',
    logoUrl: '',
    logoWidth: 110,
    logoAlignment: 'left',
    logoBorderRadius: 8,
    address: 'Suite 402, Financial Tower, Innovation Boulevard',
    cityStateZip: 'Silicon District, CA 94016',
    country: 'United States',
    email: 'billing@orionfx.net',
    phone: '+1 (800) 555-0199',
    website: 'https://orionfx.net',
    taxId: 'US-EIN-94-3829104',
    ntn: '7412985-3',
    strn: '17-00-7412-985-19',
    posTerminalId: 'POS-01',
  },
  client: {
    name: 'Sarah Jenkins',
    company: 'Apex Digital Dynamics Corp.',
    email: 'sarah.j@apexdynamics.io',
    phone: '+1 (555) 234-5678',
    address: '742 Everglade Commercial Park, 8th Floor',
    cityStateZip: 'Austin, TX 78701',
    taxId: 'TX-TAX-449102',
  },
  items: [
    {
      id: 'item_1',
      description: 'OrionFx SaaS Enterprise Subscription',
      details: 'Quarterly access tier for up to 25 team workspaces with unlimited document generation',
      quantity: 1,
      unitPrice: 380.00,
      taxRate: 8,
    },
    {
      id: 'item_2',
      description: 'Automated Invoice & Document Generation Setup',
      details: 'Custom template configuration, webhooks, and brand styling deployment',
      quantity: 1,
      unitPrice: 220.00,
      taxRate: 8,
    },
    {
      id: 'item_3',
      description: 'High-Throughput API Gateway Credits',
      details: '50,000 automated document exports & CDN delivery package',
      quantity: 2,
      unitPrice: 45.00,
      taxRate: 8,
    }
  ],
  discountType: 'percent',
  discountValue: 5, // 5% discount
  taxRate: 8,
  taxLabel: 'Sales Tax / VAT (8%)',
  shippingFee: 0,
  paidAmount: 655.50,
  notes: 'We appreciate your business! If you have questions concerning this receipt or invoice, please contact support@orionfx.net.',
  terms: 'Payment is confirmed as settled. All digital subscriptions remain active according to service agreements. Retain this receipt for tax documentation and proof of purchase.',
  payment: {
    method: 'Bank Wire Transfer / ACH',
    bankName: 'JPMorgan Chase & Co.',
    accountName: 'OrionFx Technologies Ltd.',
    accountNumber: '•••• •••• 9842',
    routingNumber: '021000021',
    iban: 'US89 JPMC 0210 0002 1009 8420',
    swift: 'CHASUS33',
    paymentLink: 'https://orionfx.net/pay/OFX-2026-0842',
    showQrCode: true,
    qrPayload: 'https://orionfx.net/verify/receipt?ref=OFX-2026-0842',
  },
  signature: {
    type: 'typed',
    dataUrl: '',
    signerName: 'Alexander Vance',
    signerTitle: 'Chief Financial Officer, OrionFx',
    signDate: new Date().toISOString().split('T')[0],
    showStamp: true,
  },
  styling: {
    template: 'modern',
    primaryColor: '#1e40af',
    fontFamily: 'sans',
    showWatermark: false,
    showTerms: true,
    showPaymentDetails: true,
    showSignature: true,
    accentBarPosition: 'top',
    compactMode: false,
  }
};
