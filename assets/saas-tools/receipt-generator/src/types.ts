export type TemplateId = 'modern' | 'corporate' | 'thermal' | 'minimal' | 'classic';

export type ReceiptType = 
  | 'RECEIPT'
  | 'TAX INVOICE'
  | 'SALES RECEIPT'
  | 'PAYMENT VOUCHER'
  | 'PROFORMA INVOICE'
  | 'BILL OF SALE';

export type StatusBadge = 'PAID' | 'DUE' | 'PENDING' | 'REFUNDED' | 'DRAFT' | 'NONE';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'PKR' | 'AED' | 'CAD' | 'AUD' | 'JPY' | 'SAR' | 'CUSTOM';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export interface LineItem {
  id: string;
  description: string;
  details?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number; // per item tax percentage (e.g., 5, 10, 18)
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  logoUrl: string;
  logoWidth: number; // in pixels (e.g., 80 to 200)
  logoAlignment: 'left' | 'center' | 'right';
  logoBorderRadius: number; // in pixels (0 to 50)
  address: string;
  cityStateZip: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  taxId: string; // VAT / GSTIN / TIN / Reg #
  ntn?: string; // National Tax Number (Pakistan Standard)
  strn?: string; // Sales Tax Registration Number (Pakistan Standard)
  posTerminalId?: string; // POS Machine / Counter ID (e.g. POS-01)
}

export interface ClientInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  cityStateZip: string;
  taxId?: string;
}

export interface PaymentDetails {
  method: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  iban?: string;
  swift?: string;
  paymentLink?: string;
  showQrCode: boolean;
  qrPayload?: string;
}

export interface SignatureDetails {
  type: 'drawn' | 'typed' | 'image' | 'none';
  dataUrl?: string; // canvas drawing or image
  signerName: string;
  signerTitle: string;
  signDate?: string;
  showStamp: boolean; // "PAID & VERIFIED" circular stamp
}

export interface StylingConfig {
  template: TemplateId;
  primaryColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  showWatermark: boolean;
  showTerms: boolean;
  showPaymentDetails: boolean;
  showSignature: boolean;
  accentBarPosition: 'top' | 'left' | 'bottom' | 'none';
  compactMode: boolean;
}

export interface ReceiptData {
  id: string;
  receiptNumber: string;
  fbrInvoiceNumber?: string; // FBR POS Invoicing Tier-1 ID (Pakistan Standard)
  cashierName?: string; // Cashier / Operator / Counter
  receiptTime?: string; // e.g. 14:35:20
  type: ReceiptType;
  status: StatusBadge;
  issueDate: string;
  dueDate?: string;
  currency: CurrencyConfig;
  company: CompanyInfo;
  client: ClientInfo;
  items: LineItem[];
  discountType: 'percent' | 'fixed';
  discountValue: number;
  taxRate: number; // overall tax %
  taxLabel: string; // e.g. "VAT (10%)" or "GST (18%)" or "Sales Tax"
  shippingFee: number;
  paidAmount: number;
  notes: string;
  terms: string;
  payment: PaymentDetails;
  signature: SignatureDetails;
  styling: StylingConfig;
}
