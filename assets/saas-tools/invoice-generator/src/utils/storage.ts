import { Invoice, SyncAuditLog, ScheduledReminder } from '../types/invoice';
import { getDefaultFollowUpSequences } from './communication';

const STORAGE_KEY = 'invoicecraft_invoices_v1';
const AUDIT_KEY = 'invoicecraft_sync_audit_v1';
const SENDER_PROFILE_KEY = 'invoicecraft_saved_profile_v1';

export const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 'inv-sample-ofx-042',
    invoiceNumber: 'OFX-2026-0042',
    poNumber: 'PO-HAROON-778',
    issueDate: '2026-09-12',
    dueDate: '2026-09-26',
    status: 'paid',
    currency: 'PKR',
    template: 'classic',
    accentColor: '#0f172a',
    sender: {
      name: 'WAR COMPUTERS',
      businessName: 'WAR COMPUTERS',
      subtitle: 'Laptops & Chromebooks Wholesaler',
      address: 'Offie # 222. 2nd Floor, Regal Trade Center, Saddar',
      cityStateZip: 'Karachi, Sindh 75400',
      country: 'Pakistan',
      phone: '+92 (021) 3456-7890',
      email: 'billing@orionfx.net',
      taxId: '7412985-3',
      website: 'https://orionfx.net',
      signerName: 'Waqas Ahmed',
      signerTitle: 'Managing Partner',
      logoScale: 100,
    },
    client: {
      name: 'Haroon Enterprise',
      company: 'Apex Technologies Group',
      email: 'accounts@haroon-tech.pk',
      phone: '+92 (300) 829-1144',
      address: 'Plot 12-C, Commercial Area, DHA Phase 6',
      cityStateZip: 'Karachi',
      country: 'Pakistan',
      taxId: 'NTN: 8932014-2',
      projectCode: 'BATCH-LOT-CHROMEBOOKS',
    },
    items: [
      {
        id: 'item-fbr-1',
        description: 'Dell Latitude 7420 Core i7 16GB/512GB SSD Lot (Grade A Wholesale)',
        quantity: 15,
        unitPrice: 78000,
        itemDiscount: 0,
      },
      {
        id: 'item-fbr-2',
        description: 'HP Chromebook x360 Touchscreen Education Edition (Bulk Pack)',
        quantity: 30,
        unitPrice: 32000,
        itemDiscount: 5,
      },
      {
        id: 'item-fbr-3',
        description: 'Type-C Fast Charging Adapters 65W & Power Cables Lot',
        quantity: 45,
        unitPrice: 2800,
        itemDiscount: 0,
      },
    ],
    taxType: 'sales',
    taxRate: 5.0,
    compoundTaxRate: 0,
    discountType: 'percentage',
    discountValue: 0,
    shippingOrFees: 5000,
    notes: 'Goods received in satisfactory condition. Warranty void if warranty seal broken or physical damage detected.',
    terms: 'Official Tax Invoice under Sales Tax Act. Remittance confirmed through direct bank transfer instrument in Pak Rs.',
    paymentMethod: {
      bankName: 'Meezan Bank Limited',
      accountName: 'WAR COMPUTERS WHOLESALE',
      accountNumber: '0104 0100 8920 44',
      routingOrSwift: 'MEZNPKKA',
      iban: 'PK44MEZN0001040100892044',
      paypalEmail: '',
      stripeLink: '',
      upiId: '',
      customNotes: 'Branch: Saddar Trade Center Branch Karachi. Instrument: Bank Transfer',
    },
    recurring: {
      isRecurring: false,
      frequency: 'monthly',
      nextBillingDate: '2026-10-12',
      autoRemindPush: false,
      notifyDaysBefore: 3,
    },
    followUps: getDefaultFollowUpSequences('OFX-2026-0042', 'WAR COMPUTERS', 'Haroon Enterprise', 'Rs. 2,382,900.00', '2026-09-26'),
    createdAt: '2026-09-12T10:00:00.000Z',
    updatedAt: '2026-09-12T10:00:00.000Z',
    syncedToCloud: true,
  },
  {
    id: 'inv-sample-1',
    invoiceNumber: 'INV-2026-104',
    poNumber: 'PO-NEXUS-88',
    issueDate: '2026-10-05',
    dueDate: '2026-10-25',
    status: 'sent',
    currency: 'PKR',
    template: 'modern',
    accentColor: '#0284c7', // Sky Blue
    sender: {
      name: 'Elena Rostova',
      businessName: 'Studio Aurelia Design',
      email: 'hello@aureliastudio.io',
      phone: '+92 (321) 890-4421',
      address: '742 Montgomery St, Suite 400',
      cityStateZip: 'Karachi, Sindh 75500',
      country: 'Pakistan',
      taxId: 'NTN: 9488321-0',
      website: 'https://aureliastudio.io',
      signerName: 'Elena Rostova',
      signerTitle: 'Lead Design Principal',
    },
    client: {
      name: 'Marcus Vance',
      company: 'Veloce Robotics Inc.',
      email: 'm.vance@veloce-robotics.com',
      phone: '+92 (300) 555-0199',
      address: '1040 Innovation Way, Building 4',
      cityStateZip: 'Islamabad 44000',
      country: 'Pakistan',
      taxId: 'STRN: 7782103-5',
      projectCode: 'VELOCE-BRAND-2026',
    },
    items: [
      {
        id: 'item-101',
        description: 'Brand Identity System & Design Token Architecture',
        quantity: 1,
        unitPrice: 125000,
        itemDiscount: 0,
      },
      {
        id: 'item-102',
        description: 'Responsive Web Application UI (14 Core Workspaces + Mobile)',
        quantity: 1,
        unitPrice: 185000,
        itemDiscount: 5,
      },
      {
        id: 'item-103',
        description: 'Interactive Prototype & Micro-interactions Sprint',
        quantity: 10,
        unitPrice: 12000,
        itemDiscount: 0,
      },
    ],
    taxType: 'sales',
    taxRate: 5.0,
    compoundTaxRate: 0,
    discountType: 'percentage',
    discountValue: 0,
    shippingOrFees: 0,
    notes: 'Thank you for partnering with Studio Aurelia! Source Figma assets and SVG kits will be unlocked upon final payment.',
    terms: 'Payment is due within 20 days of invoice date. Official remittance in Pak Rs.',
    paymentMethod: {
      bankName: 'Standard Chartered Bank Pakistan',
      accountName: 'Studio Aurelia Design',
      accountNumber: '01-1829014-01',
      routingOrSwift: 'SCBLPKKA',
      iban: 'PK36SCBL0000001182901401',
      paypalEmail: '',
      stripeLink: '',
      upiId: '',
      customNotes: 'Direct Bank Transfer. Please reference INV-2026-104 in deposit slip.',
    },
    recurring: {
      isRecurring: false,
      frequency: 'monthly',
      nextBillingDate: '2026-11-05',
      autoRemindPush: true,
      notifyDaysBefore: 3,
    },
    followUps: getDefaultFollowUpSequences('INV-2026-104', 'Studio Aurelia', 'Marcus Vance', 'Rs. 430,750.00', '2026-10-25'),
    createdAt: '2026-10-05T10:00:00.000Z',
    updatedAt: '2026-10-05T10:00:00.000Z',
    syncedToCloud: true,
  },
  {
    id: 'inv-sample-2',
    invoiceNumber: 'INV-2026-098',
    poNumber: 'PO-HYPER-2026',
    issueDate: '2026-09-28',
    dueDate: '2026-10-12',
    status: 'overdue',
    currency: 'PKR',
    template: 'corporate',
    accentColor: '#059669', // Emerald
    sender: {
      name: 'Elena Rostova',
      businessName: 'Studio Aurelia Design',
      email: 'hello@aureliastudio.io',
      phone: '+92 (321) 890-4421',
      address: '742 Montgomery St, Suite 400',
      cityStateZip: 'Karachi, Sindh 75500',
      country: 'Pakistan',
      taxId: 'NTN: 9488321-0',
      website: 'https://aureliastudio.io',
      signerName: 'Elena Rostova',
      signerTitle: 'Managing Partner',
    },
    client: {
      name: 'Sophie Lindemann',
      company: 'Klarheit Ventures Ltd',
      email: 's.lindemann@klarheit.pk',
      phone: '+92 (333) 220-4811',
      address: 'Main Boulevard, Gulberg III',
      cityStateZip: 'Lahore, Punjab 54000',
      country: 'Pakistan',
      taxId: 'NTN: 8829103-3',
      projectCode: 'KLARHEIT-SPRINT-02',
    },
    items: [
      {
        id: 'item-201',
        description: 'Fintech Dashboard Redesign & React Component Architecture',
        quantity: 1,
        unitPrice: 245000,
        itemDiscount: 0,
      },
      {
        id: 'item-202',
        description: 'Accessibility & WCAG AA Contrast Compliance Overhaul',
        quantity: 1,
        unitPrice: 85000,
        itemDiscount: 0,
      },
    ],
    taxType: 'sales',
    taxRate: 5.0,
    compoundTaxRate: 0,
    discountType: 'percentage',
    discountValue: 5,
    shippingOrFees: 0,
    notes: 'Official invoice in Pak Rs. Overdue balance pending immediate settlement.',
    terms: 'Net 14 payment terms. Please execute online bank transfer directly to the provided IBAN.',
    paymentMethod: {
      bankName: 'Habib Bank Limited (HBL)',
      accountName: 'Studio Aurelia Design',
      accountNumber: '0042 7901 8821 03',
      routingOrSwift: 'HABBPKKA',
      iban: 'PK12HABB0000427901882103',
      paypalEmail: '',
      stripeLink: '',
      upiId: '',
      customNotes: 'Transfer Reference: INV-2026-098',
    },
    recurring: {
      isRecurring: true,
      frequency: 'monthly',
      nextBillingDate: '2026-10-28',
      autoRemindPush: true,
      notifyDaysBefore: 2,
    },
    followUps: getDefaultFollowUpSequences('INV-2026-098', 'Studio Aurelia', 'Sophie Lindemann', 'Rs. 329,175.00', '2026-10-12'),
    createdAt: '2026-09-28T09:00:00.000Z',
    updatedAt: '2026-09-28T09:00:00.000Z',
    syncedToCloud: true,
  },
  {
    id: 'inv-sample-3',
    invoiceNumber: 'INV-2026-092',
    poNumber: 'PO-APEX-LON',
    issueDate: '2026-09-15',
    dueDate: '2026-09-30',
    status: 'paid',
    currency: 'PKR',
    template: 'creative',
    accentColor: '#7c3aed', // Purple
    sender: {
      name: 'Elena Rostova',
      businessName: 'Studio Aurelia Design',
      email: 'hello@aureliastudio.io',
      phone: '+92 (321) 890-4421',
      address: '742 Montgomery St, Suite 400',
      cityStateZip: 'Karachi, Sindh 75500',
      country: 'Pakistan',
      taxId: 'NTN: 9488321-0',
      website: 'https://aureliastudio.io',
      signerName: 'Elena Rostova',
      signerTitle: 'Lead Design Principal',
    },
    client: {
      name: 'Arthur Pendelton',
      company: 'Meridian Capital Partners',
      email: 'a.pendelton@meridiancap.pk',
      phone: '+92 (345) 794-0882',
      address: '25 Bank Road, Blue Area',
      cityStateZip: 'Islamabad 44010',
      country: 'Pakistan',
      taxId: 'NTN: 4490192-1',
      projectCode: 'MERIDIAN-Q3-PORTAL',
    },
    items: [
      {
        id: 'item-301',
        description: 'Investor Relations Portal High-Fidelity Prototyping',
        quantity: 1,
        unitPrice: 195000,
        itemDiscount: 0,
      },
      {
        id: 'item-302',
        description: 'Interactive Financial Visualization Charts & Graph Suite',
        quantity: 1,
        unitPrice: 110000,
        itemDiscount: 0,
      },
    ],
    taxType: 'sales',
    taxRate: 5.0,
    compoundTaxRate: 0,
    discountType: 'fixed',
    discountValue: 5000,
    shippingOrFees: 0,
    notes: 'Payment confirmed in full via 1Link Online Bank Transfer on September 29, 2026. Receipt dispatched.',
    terms: 'Receipt acknowledgment. Thank you for your continued partnership.',
    paymentMethod: {
      bankName: 'Meezan Bank Limited',
      accountName: 'Studio Aurelia Design',
      accountNumber: '0208 0100 7712 99',
      routingOrSwift: 'MEZNPKKA',
      iban: 'PK77MEZN0002080100771299',
      paypalEmail: '',
      stripeLink: '',
      upiId: '',
      customNotes: 'Branch: Clifton Branch Karachi',
    },
    recurring: {
      isRecurring: false,
      frequency: 'quarterly',
      nextBillingDate: '2026-12-15',
      autoRemindPush: false,
      notifyDaysBefore: 3,
    },
    followUps: getDefaultFollowUpSequences('INV-2026-092', 'Studio Aurelia', 'Arthur Pendelton', 'Rs. 315,000.00', '2026-09-30'),
    createdAt: '2026-09-15T11:00:00.000Z',
    updatedAt: '2026-09-29T14:30:00.000Z',
    syncedToCloud: true,
  },
];

export function sanitizeInvoice(raw: any): Invoice {
  const inv = raw || {};
  
  // Safe line items with unique IDs
  const rawItems = Array.isArray(inv.items) && inv.items.length > 0 ? inv.items : [
    {
      id: 'item-fbr-1',
      description: 'Dell Latitude 7420 Core i7 Lot (Grade A Wholesale)',
      quantity: 1,
      unitPrice: 42000,
      itemDiscount: 0,
    }
  ];

  const seenItemIds = new Set<string>();
  const safeItems = rawItems.map((it: any, idx: number) => {
    let itemId = String(it?.id || `item-row-${idx + 1}`);
    if (seenItemIds.has(itemId)) {
      itemId = `item-row-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
    }
    seenItemIds.add(itemId);
    return {
      id: itemId,
      description: String(it?.description || ''),
      quantity: typeof it?.quantity === 'number' && !isNaN(it.quantity) ? it.quantity : 1,
      unitPrice: typeof it?.unitPrice === 'number' && !isNaN(it.unitPrice) ? it.unitPrice : 0,
      itemDiscount: typeof it?.itemDiscount === 'number' && !isNaN(it.itemDiscount) ? it.itemDiscount : 0,
    };
  });

  return {
    id: String(inv.id || 'inv-' + Date.now()),
    invoiceNumber: String(inv.invoiceNumber || 'INV-2026-001'),
    poNumber: String(inv.poNumber || ''),
    issueDate: String(inv.issueDate || new Date().toISOString().split('T')[0]),
    dueDate: String(inv.dueDate || new Date().toISOString().split('T')[0]),
    status: inv.status || 'draft',
    currency: inv.currency || 'PKR',
    template: inv.template || 'classic',
    accentColor: inv.accentColor || '#0f172a',
    sender: {
      name: inv.sender?.name || 'WAR COMPUTERS',
      businessName: inv.sender?.businessName || 'WAR COMPUTERS',
      subtitle: inv.sender?.subtitle || 'Laptops & Chromebooks Wholesaler',
      address: inv.sender?.address || 'Offie # 222. 2nd Floor, Regal Trade Center, Saddar',
      cityStateZip: inv.sender?.cityStateZip || 'Karachi, Sindh 75400',
      country: inv.sender?.country || 'Pakistan',
      phone: inv.sender?.phone || '+92 (021) 3456-7890',
      email: inv.sender?.email || 'billing@orionfx.net',
      taxId: inv.sender?.taxId || '7412985-3',
      website: inv.sender?.website || 'https://orionfx.net',
      signerName: inv.sender?.signerName || 'Waqas Ahmed',
      signerTitle: inv.sender?.signerTitle || 'Managing Partner',
      logoUrl: inv.sender?.logoUrl || '',
      logoScale: typeof inv.sender?.logoScale === 'number' ? inv.sender.logoScale : 100,
      signatureUrl: inv.sender?.signatureUrl || '',
    },
    client: {
      name: inv.client?.name || 'Client Name',
      company: inv.client?.company || '',
      email: inv.client?.email || '',
      phone: inv.client?.phone || '',
      address: inv.client?.address || '',
      cityStateZip: inv.client?.cityStateZip || '',
      country: inv.client?.country || 'Pakistan',
      taxId: inv.client?.taxId || '',
      projectCode: inv.client?.projectCode || '',
    },
    items: safeItems,
    taxType: inv.taxType || 'none',
    taxRate: typeof inv.taxRate === 'number' && !isNaN(inv.taxRate) ? inv.taxRate : 0,
    compoundTaxRate: typeof inv.compoundTaxRate === 'number' && !isNaN(inv.compoundTaxRate) ? inv.compoundTaxRate : 0,
    discountType: inv.discountType || 'percentage',
    discountValue: typeof inv.discountValue === 'number' && !isNaN(inv.discountValue) ? inv.discountValue : 0,
    shippingOrFees: typeof inv.shippingOrFees === 'number' && !isNaN(inv.shippingOrFees) ? inv.shippingOrFees : 0,
    notes: inv.notes || '',
    terms: inv.terms || '',
    paymentMethod: {
      bankName: inv.paymentMethod?.bankName || '',
      accountName: inv.paymentMethod?.accountName || '',
      accountNumber: inv.paymentMethod?.accountNumber || '',
      routingOrSwift: inv.paymentMethod?.routingOrSwift || '',
      iban: inv.paymentMethod?.iban || '',
      paypalEmail: inv.paymentMethod?.paypalEmail || '',
      stripeLink: inv.paymentMethod?.stripeLink || '',
      upiId: inv.paymentMethod?.upiId || '',
      customNotes: inv.paymentMethod?.customNotes || '',
    },
    recurring: {
      isRecurring: Boolean(inv.recurring?.isRecurring),
      frequency: inv.recurring?.frequency || 'monthly',
      nextBillingDate: inv.recurring?.nextBillingDate || '',
      autoRemindPush: Boolean(inv.recurring?.autoRemindPush),
      notifyDaysBefore: typeof inv.recurring?.notifyDaysBefore === 'number' ? inv.recurring.notifyDaysBefore : 3,
    },
    followUps: Array.isArray(inv.followUps) ? inv.followUps : [],
    createdAt: inv.createdAt || new Date().toISOString(),
    updatedAt: inv.updatedAt || new Date().toISOString(),
    syncedToCloud: Boolean(inv.syncedToCloud),
  };
}

export function deduplicateInvoices(invoices: Invoice[]): Invoice[] {
  if (!Array.isArray(invoices)) return [];
  const seenIds = new Set<string>();
  const seenNumbers = new Set<string>();
  const result: Invoice[] = [];

  for (const raw of invoices) {
    if (!raw || typeof raw !== 'object') continue;
    const inv = sanitizeInvoice(raw);
    const cleanId = String(inv.id).trim();
    const cleanNum = String(inv.invoiceNumber || '').trim().toUpperCase();

    // Skip duplicate by unique ID
    if (cleanId && seenIds.has(cleanId)) continue;
    // Skip duplicate by invoice number
    if (cleanNum && seenNumbers.has(cleanNum)) continue;

    if (cleanId) seenIds.add(cleanId);
    if (cleanNum) seenNumbers.add(cleanNum);

    result.push(inv);
  }

  return result;
}

export function getStoredInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: Invoice[] = SAMPLE_INVOICES;

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch (err) {
        console.error('Failed to parse localStorage invoices, resetting to samples:', err);
      }
    }

    // Always deduplicate and sanitize all entries
    const cleanList = deduplicateInvoices(list);
    const finalList = cleanList.length > 0 ? cleanList : deduplicateInvoices(SAMPLE_INVOICES);

    // Save cleaned deduplicated list back to localStorage to heal corrupt storage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalList));
    } catch (e) {
      console.error(e);
    }

    return finalList;
  } catch (err) {
    console.error('Failed to load stored invoices:', err);
    return deduplicateInvoices(SAMPLE_INVOICES);
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  try {
    const clean = deduplicateInvoices(invoices);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch (err) {
    console.error('Failed to save invoices to storage:', err);
  }
}

export function resetStorageToSamples(): Invoice[] {
  try {
    const samples = deduplicateInvoices(SAMPLE_INVOICES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
    return samples;
  } catch (e) {
    console.error('Failed to reset storage:', e);
    return deduplicateInvoices(SAMPLE_INVOICES);
  }
}

export function createDefaultInvoice(existingCount: number = 0): Invoice {
  const today = new Date().toISOString().split('T')[0];
  const due = new Date();
  due.setDate(due.getDate() + 14);
  const dueDateStr = due.toISOString().split('T')[0];
  const invNum = `INV-2026-${String(existingCount + 101).padStart(3, '0')}`;

  const savedProfile = getSavedSenderProfile();

  return sanitizeInvoice({
    id: 'inv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    invoiceNumber: invNum,
    poNumber: '',
    issueDate: today,
    dueDate: dueDateStr,
    status: 'draft',
    currency: 'PKR',
    template: 'classic',
    accentColor: '#0f172a',
    sender: savedProfile || {
      name: 'WAR COMPUTERS',
      businessName: 'WAR COMPUTERS',
      subtitle: 'Laptops & Chromebooks Wholesaler',
      address: 'Offie # 222. 2nd Floor, Regal Trade Center, Saddar',
      cityStateZip: 'Karachi, Sindh 75400',
      country: 'Pakistan',
      phone: '+92 (021) 3456-7890',
      email: 'billing@orionfx.net',
      taxId: '7412985-3',
      website: 'https://orionfx.net',
      signerName: 'Waqas Ahmed',
      signerTitle: 'Managing Partner',
      logoUrl: '',
      logoScale: 100,
      signatureUrl: '',
    },
    client: {
      name: 'Client Name',
      company: 'Apex Technologies Group',
      email: 'accounts@client.pk',
      phone: '+92 (300) 123-4567',
      address: 'Commercial Area',
      cityStateZip: 'Karachi',
      country: 'Pakistan',
      taxId: 'NTN: 8932014-2',
      projectCode: '',
    },
    items: [
      {
        id: 'item-' + Date.now() + '-1',
        description: 'Dell Latitude 7420 Core i7 Lot (Grade A Wholesale)',
        quantity: 1,
        unitPrice: 42000,
        itemDiscount: 0,
      },
    ],
    taxType: 'sales',
    taxRate: 5.0,
    compoundTaxRate: 0,
    discountType: 'percentage',
    discountValue: 0,
    shippingOrFees: 0,
    notes: 'Standard official tax invoice in Pak Rs.',
    terms: 'Payment due within 14 days in Pak Rs. Direct bank transfer instrument.',
    paymentMethod: {
      bankName: 'Meezan Bank Limited',
      accountName: 'WAR COMPUTERS WHOLESALE',
      accountNumber: '0104 0100 8920 44',
      routingOrSwift: 'MEZNPKKA',
      iban: 'PK44MEZN0001040100892044',
      paypalEmail: '',
      stripeLink: '',
      upiId: '',
      customNotes: 'Branch: Saddar Trade Center Branch Karachi',
    },
    recurring: {
      isRecurring: false,
      frequency: 'monthly',
      nextBillingDate: '',
      autoRemindPush: false,
      notifyDaysBefore: 3,
    },
    followUps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncedToCloud: true,
  });
}

export function getStoredAuditLogs(): SyncAuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addAuditLog(entry: Omit<SyncAuditLog, 'id' | 'timestamp'>): void {
  try {
    const logs = getStoredAuditLogs();
    const newLog: SyncAuditLog = {
      ...entry,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // keep latest 30 logs
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs.slice(0, 30)));
  } catch (e) {
    console.error(e);
  }
}

export function getSavedSenderProfile(): Invoice['sender'] | null {
  try {
    const raw = localStorage.getItem(SENDER_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
    return null;
  } catch {
    return null;
  }
}

export function saveSenderProfile(profile: Invoice['sender']): void {
  try {
    localStorage.setItem(SENDER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
}

export function computeScheduledReminders(invoices: Invoice[]): ScheduledReminder[] {
  if (!Array.isArray(invoices)) return [];
  const reminders: ScheduledReminder[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  invoices.forEach((inv) => {
    if (!inv || typeof inv !== 'object') return;
    if (inv.status === 'paid' || inv.status === 'cancelled') return;

    const invNum = inv.invoiceNumber || 'INV';
    const clientName = inv.client?.name || inv.client?.company || 'Client';

    if (inv.dueDate) {
      try {
        const due = new Date(inv.dueDate);
        if (!isNaN(due.getTime())) {
          due.setHours(0, 0, 0, 0);
          const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            reminders.push({
              id: `rem-overdue-${inv.id}`,
              invoiceId: inv.id,
              invoiceNumber: invNum,
              clientName,
              amount: 0,
              currency: inv.currency || 'PKR',
              dueDate: inv.dueDate,
              type: 'overdue',
              message: `Invoice #${invNum} is overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}. Send a WhatsApp or email follow-up sequence.`,
              scheduledFor: inv.dueDate,
              isRead: false,
            });
          } else if (diffDays <= 3) {
            reminders.push({
              id: `rem-soon-${inv.id}`,
              invoiceId: inv.id,
              invoiceNumber: invNum,
              clientName,
              amount: 0,
              currency: inv.currency || 'PKR',
              dueDate: inv.dueDate,
              type: 'due_soon',
              message: `Invoice #${invNum} is due ${diffDays === 0 ? 'today!' : `in ${diffDays} day${diffDays === 1 ? '' : 's'}`}.`,
              scheduledFor: inv.dueDate,
              isRead: false,
            });
          }
        }
      } catch (e) {
        console.error('Error computing reminder for invoice', inv.id, e);
      }
    }

    if (inv.recurring && inv.recurring.isRecurring && inv.recurring.nextBillingDate) {
      reminders.push({
        id: `rem-rec-${inv.id}`,
        invoiceId: inv.id,
        invoiceNumber: invNum,
        clientName,
        amount: 0,
        currency: inv.currency || 'PKR',
        dueDate: inv.recurring.nextBillingDate,
        type: 'recurring_cycle',
        message: `Recurring invoice #${invNum} is scheduled to generate next cycle on ${inv.recurring.nextBillingDate}.`,
        scheduledFor: inv.recurring.nextBillingDate,
        isRead: false,
      });
    }
  });

  return reminders;
}
