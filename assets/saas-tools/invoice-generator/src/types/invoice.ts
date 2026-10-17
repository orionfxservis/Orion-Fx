export type InvoiceTemplate = 'modern' | 'corporate' | 'creative' | 'tech' | 'classic' | 'minimal' | 'executive';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateAgainstUSD: number;
  position: 'prefix' | 'suffix';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  itemDiscount?: number; // %
  taxRate?: number; // %
}

export interface SenderDetails {
  name: string;
  businessName: string;
  subtitle?: string;
  email: string;
  phone: string;
  address: string;
  cityStateZip: string;
  country: string;
  taxId: string;
  website: string;
  logoUrl?: string;
  logoScale?: number;
  signatureUrl?: string;
  signerName?: string;
  signerTitle?: string;
}

export interface ClientDetails {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  cityStateZip: string;
  country: string;
  taxId: string;
  projectCode?: string;
}

export interface PaymentMethod {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingOrSwift: string;
  iban: string;
  paypalEmail: string;
  stripeLink: string;
  upiId: string;
  customNotes: string;
}

export interface FollowUpSequence {
  id: string;
  stage: 'gentle_reminder' | 'due_today' | 'overdue_notice';
  title: string;
  daysOffset: number; // e.g. -3 (3 days before), 0 (due date), 7 (7 days after)
  subject: string;
  messageBody: string;
  isEnabled: boolean;
  lastSentAt?: string;
}

export interface RecurringConfig {
  isRecurring: boolean;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annual';
  nextBillingDate: string;
  autoRemindPush: boolean;
  notifyDaysBefore: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: string; // e.g. 'USD'
  template: InvoiceTemplate;
  accentColor: string; // e.g. '#2563eb'
  
  sender: SenderDetails;
  client: ClientDetails;
  items: InvoiceItem[];
  
  // Tax & Discount
  taxType: 'vat' | 'gst' | 'sales' | 'custom' | 'none';
  taxRate: number; // %
  compoundTaxRate: number; // % optional secondary tax
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  shippingOrFees: number;
  
  // Notes & terms
  notes: string;
  terms: string;
  paymentMethod: PaymentMethod;
  
  // Recurring & reminders
  recurring: RecurringConfig;
  followUps: FollowUpSequence[];
  
  // Sync & timeline
  createdAt: string;
  updatedAt: string;
  syncedToCloud: boolean;
}

export interface SyncAuditLog {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'sync';
  invoiceNumber: string;
  status: 'synced' | 'pending' | 'offline_saved';
}

export interface ScheduledReminder {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  dueDate: string;
  type: 'due_soon' | 'overdue' | 'recurring_cycle';
  message: string;
  scheduledFor: string;
  isRead: boolean;
}
