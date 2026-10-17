import { Invoice, InvoiceTemplate } from '../types/invoice';
import { getDefaultFollowUpSequences } from './communication';

export interface ReadyTemplate {
  id: string;
  name: string;
  category: 'professional' | 'corporate' | 'simple' | 'creative';
  categoryLabel: string;
  description: string;
  badge: string;
  recommendedColor: string;
  templateStyle: InvoiceTemplate;
  generateInvoice: (baseNumber: string) => Partial<Invoice>;
}

export const READY_TEMPLATES: ReadyTemplate[] = [
  // 0. PAKISTAN FBR POS & WHOLESALE STYLE (from screenshot)
  {
    id: 'tpl-fbr-pos-wholesale',
    name: 'WAR COMPUTERS - FBR POS & Wholesale',
    category: 'corporate',
    categoryLabel: 'Corporate',
    description: 'Standardized Tax Invoice with NTN, FBR POS compliance, itemized hardware lots, and double hairline border.',
    badge: 'FBR POS Tax Invoice',
    recommendedColor: '#0f172a',
    templateStyle: 'classic',
    generateInvoice: (baseNumber: string) => {
      return {
        template: 'classic',
        accentColor: '#0f172a',
        currency: 'PKR',
        poNumber: 'PO-HAROON-778',
        issueDate: '2026-09-12',
        dueDate: '2026-09-26',
        status: 'paid',
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
            unitPrice: 420,
            itemDiscount: 0,
          },
          {
            id: 'item-fbr-2',
            description: 'HP Chromebook x360 Touchscreen Education Edition (Bulk Pack)',
            quantity: 30,
            unitPrice: 165,
            itemDiscount: 5,
          },
          {
            id: 'item-fbr-3',
            description: 'Type-C Fast Charging Adapters 65W & Power Cables Lot',
            quantity: 45,
            unitPrice: 18,
            itemDiscount: 0,
          },
        ],
        taxType: 'sales',
        taxRate: 5.0,
        compoundTaxRate: 0,
        discountType: 'percentage',
        discountValue: 0,
        shippingOrFees: 120,
        notes: 'Goods received in satisfactory condition. Warranty void if warranty seal broken or physical damage detected.',
        terms: 'Official Tax Invoice under Sales Tax Act. Remittance confirmed through direct bank transfer instrument.',
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
        followUps: getDefaultFollowUpSequences('OFX-2026-0042', 'WAR COMPUTERS', 'Haroon Enterprise', '$12,652.50', '2026-09-26'),
      };
    },
  },

  // 1. PROFESSIONAL STYLE
  {
    id: 'tpl-professional-consulting',
    name: 'Professional Consulting & Advisory',
    category: 'professional',
    categoryLabel: 'Professional',
    description: 'Refined management advisory, strategy roadmaps, and executive reviews.',
    badge: 'Executive Advisory',
    recommendedColor: '#1e40af', // Deep Royal Blue
    templateStyle: 'executive',
    generateInvoice: (baseNumber: string) => {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date();
      due.setDate(due.getDate() + 30);
      const dueDate = due.toISOString().split('T')[0];

      return {
        template: 'executive',
        accentColor: '#1e40af',
        currency: 'USD',
        poNumber: 'PO-ADV-2026',
        items: [
          {
            id: 'item-pc-1',
            description: 'Strategic Market Expansion Advisory & Competitor Analysis',
            quantity: 1,
            unitPrice: 4800,
            itemDiscount: 0,
          },
          {
            id: 'item-pc-2',
            description: 'Executive Steering Committee Workshops (4 Sessions)',
            quantity: 4,
            unitPrice: 950,
            itemDiscount: 0,
          },
          {
            id: 'item-pc-3',
            description: 'Organizational Capability Assessment & Transformation Roadmap',
            quantity: 1,
            unitPrice: 3400,
            itemDiscount: 5,
          },
        ],
        taxType: 'sales',
        taxRate: 7.5,
        compoundTaxRate: 0,
        discountType: 'percentage',
        discountValue: 0,
        shippingOrFees: 0,
        notes: 'Deliverables include Phase 1 Strategic Dossier and Quarterly Execution Plan. Confidential and proprietary.',
        terms: 'Payment due within 30 calendar days (Net 30). Late disbursements accrue interest at 1.5% per month.',
        client: {
          name: 'David Sterling',
          company: 'Sterling Capital Holdings',
          email: 'd.sterling@sterlingholdings.com',
          phone: '+1 (212) 555-8910',
          address: '350 Park Avenue, 28th Floor',
          cityStateZip: 'New York, NY 10022',
          country: 'United States',
          taxId: 'US-EIN-13-9821440',
          projectCode: 'STRATEGY-EXPANSION-Q4',
        },
        paymentMethod: {
          bankName: 'JPMorgan Chase Commercial Banking',
          accountName: 'Aurelia Advisory Group LLC',
          accountNumber: '8839 2011 4099',
          routingOrSwift: 'CHASUS33',
          iban: 'US88CHAS0000883920114099',
          paypalEmail: 'finance@aureliagroup.com',
          stripeLink: '',
          upiId: '',
          customNotes: 'Wire Transfer Reference: ' + baseNumber,
        },
        recurring: {
          isRecurring: false,
          frequency: 'monthly',
          nextBillingDate: dueDate,
          autoRemindPush: true,
          notifyDaysBefore: 5,
        },
        followUps: getDefaultFollowUpSequences(baseNumber, 'Aurelia Advisory', 'David Sterling', '$11,642.25', dueDate),
      };
    },
  },

  // 2. CORPORATE STYLE
  {
    id: 'tpl-corporate-enterprise',
    name: 'Corporate Enterprise IT & SLA',
    category: 'corporate',
    categoryLabel: 'Corporate',
    description: 'Formal corporate B2B layout with department codes, VAT, and Net-30 compliance.',
    badge: 'Enterprise SLA',
    recommendedColor: '#0f172a', // Corporate Slate
    templateStyle: 'corporate',
    generateInvoice: (baseNumber: string) => {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date();
      due.setDate(due.getDate() + 30);
      const dueDate = due.toISOString().split('T')[0];

      return {
        template: 'corporate',
        accentColor: '#0f172a',
        currency: 'EUR',
        poNumber: 'PO-GLOBAL-9941',
        items: [
          {
            id: 'item-corp-1',
            description: 'Cloud Infrastructure Engineering & Kubernetes Cluster Migration',
            quantity: 1,
            unitPrice: 8500,
            itemDiscount: 0,
          },
          {
            id: 'item-corp-2',
            description: 'Enterprise 24/7 Tier-3 SLA Support Retainer (October Cycle)',
            quantity: 1,
            unitPrice: 3200,
            itemDiscount: 0,
          },
          {
            id: 'item-corp-3',
            description: 'SOC 2 Type II Security Compliance & Penetration Audit',
            quantity: 1,
            unitPrice: 4600,
            itemDiscount: 0,
          },
        ],
        taxType: 'vat',
        taxRate: 19.0,
        compoundTaxRate: 0,
        discountType: 'percentage',
        discountValue: 0,
        shippingOrFees: 0,
        notes: 'Services rendered pursuant to Master Services Agreement #MSA-2025-CORP. Direct inquiries to corporate billing.',
        terms: 'Net 30 days. Remittance must quote PO-GLOBAL-9941 and Vendor ID: VEN-8820.',
        client: {
          name: 'Dr. Klaus Weimann',
          company: 'Bayerische Automobil System GmbH',
          email: 'k.weimann@bayer-system.de',
          phone: '+49 89 5402 1100',
          address: 'Taunusstraße 45',
          cityStateZip: '80807 Munich',
          country: 'Germany',
          taxId: 'DE814992015',
          projectCode: 'DE-INFRA-MIGRATION-2026',
        },
        paymentMethod: {
          bankName: 'Deutsche Bank Corporate Division',
          accountName: 'CloudMatrix Technologies GmbH',
          accountNumber: 'DE44 5007 0010 0982 1100 22',
          routingOrSwift: 'DEUTDEDDMUC',
          iban: 'DE44500700100982110022',
          paypalEmail: '',
          stripeLink: '',
          upiId: '',
          customNotes: 'SEPA B2B Mandate ID: B2B-DB-9941',
        },
        recurring: {
          isRecurring: true,
          frequency: 'monthly',
          nextBillingDate: dueDate,
          autoRemindPush: true,
          notifyDaysBefore: 3,
        },
        followUps: getDefaultFollowUpSequences(baseNumber, 'CloudMatrix Corp', 'Dr. Klaus Weimann', '€19,397.00', dueDate),
      };
    },
  },

  // 3. SIMPLE / CLEAN FREELANCER STYLE
  {
    id: 'tpl-simple-freelance-hourly',
    name: 'Simple Hourly Freelancer',
    category: 'simple',
    categoryLabel: 'Simple Style',
    description: 'Clean, distraction-free invoice for solo contractors, developers, or copywriters.',
    badge: 'Solo Contractor',
    recommendedColor: '#059669', // Emerald Green
    templateStyle: 'minimal',
    generateInvoice: (baseNumber: string) => {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date();
      due.setDate(due.getDate() + 7);
      const dueDate = due.toISOString().split('T')[0];

      return {
        template: 'minimal',
        accentColor: '#059669',
        currency: 'USD',
        poNumber: 'WEEKLY-SPRINT-03',
        items: [
          {
            id: 'item-sm-1',
            description: 'Full-Stack Software Development & Bug Fixes (Week of Oct 5)',
            quantity: 32,
            unitPrice: 85,
            itemDiscount: 0,
          },
          {
            id: 'item-sm-2',
            description: 'API Integration Testing & Deployment Support',
            quantity: 8,
            unitPrice: 85,
            itemDiscount: 0,
          },
        ],
        taxType: 'none',
        taxRate: 0,
        compoundTaxRate: 0,
        discountType: 'percentage',
        discountValue: 0,
        shippingOrFees: 0,
        notes: 'Thanks for working with me! All Git commits pushed to the main branch.',
        terms: 'Payment due within 7 days of invoice issue. Quick settlement appreciated via Stripe or PayPal.',
        client: {
          name: 'Sarah Jenkins',
          company: 'Launchpad Startups',
          email: 'sarah@launchpad.io',
          phone: '+1 (415) 555-0182',
          address: '22 4th Street',
          cityStateZip: 'San Francisco, CA 94103',
          country: 'United States',
          taxId: '',
          projectCode: 'MVP-SPRINT-DEV',
        },
        paymentMethod: {
          bankName: 'Mercury Bank',
          accountName: 'Elena Rostova (Freelance)',
          accountNumber: '3991 0029 8812',
          routingOrSwift: '021000021',
          iban: '',
          paypalEmail: 'elena@freelancedev.com',
          stripeLink: 'https://buy.stripe.com/launchpad_hourly_demo',
          upiId: '',
          customNotes: 'Pay instantly via Stripe card or direct ACH transfer.',
        },
        recurring: {
          isRecurring: true,
          frequency: 'weekly',
          nextBillingDate: dueDate,
          autoRemindPush: true,
          notifyDaysBefore: 1,
        },
        followUps: getDefaultFollowUpSequences(baseNumber, 'Elena Rostova', 'Sarah Jenkins', '$3,400.00', dueDate),
      };
    },
  },

  // 4. CREATIVE STUDIO & DESIGN
  {
    id: 'tpl-creative-studio',
    name: 'Creative Studio & UI/UX Sprint',
    category: 'creative',
    categoryLabel: 'Creative & Modern',
    description: 'Vibrant modern aesthetic with bold typography, design deliverables, and Figma handoffs.',
    badge: 'Design & Branding',
    recommendedColor: '#7c3aed', // Purple Violet
    templateStyle: 'creative',
    generateInvoice: (baseNumber: string) => {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date();
      due.setDate(due.getDate() + 14);
      const dueDate = due.toISOString().split('T')[0];

      return {
        template: 'creative',
        accentColor: '#7c3aed',
        currency: 'USD',
        poNumber: 'DS-SPRINT-09',
        items: [
          {
            id: 'item-cr-1',
            description: 'Brand Identity System, Vector Logos & Color Typography Palette',
            quantity: 1,
            unitPrice: 4200,
            itemDiscount: 0,
          },
          {
            id: 'item-cr-2',
            description: 'Complete UI Kit & Tokenized Design System in Figma (60+ Components)',
            quantity: 1,
            unitPrice: 3800,
            itemDiscount: 0,
          },
          {
            id: 'item-cr-3',
            description: 'Interactive High-Fidelity Desktop & Mobile Prototype',
            quantity: 1,
            unitPrice: 1900,
            itemDiscount: 10,
          },
        ],
        taxType: 'sales',
        taxRate: 8.5,
        compoundTaxRate: 0,
        discountType: 'percentage',
        discountValue: 0,
        shippingOrFees: 0,
        notes: 'Figma editor invitations and high-res vector exports unlocked upon receipt of payment.',
        terms: 'Net 14 payment terms. All intellectual property transfers to client upon final balance settlement.',
        client: {
          name: 'Julian Vance',
          company: 'NeoVibe Technologies',
          email: 'julian@neovibe.design',
          phone: '+1 (310) 555-4491',
          address: '1600 Abbot Kinney Blvd',
          cityStateZip: 'Venice, CA 90291',
          country: 'United States',
          taxId: 'US-CA-993821',
          projectCode: 'NEOVIBE-REBRAND-2026',
        },
        paymentMethod: {
          bankName: 'Silicon Valley Commercial Bank',
          accountName: 'Studio Aurelia LLC',
          accountNumber: '4098 7721 0042',
          routingOrSwift: 'SVCBUS33',
          iban: 'US33SVCB0000409877210042',
          paypalEmail: 'billing@aureliastudio.io',
          stripeLink: 'https://buy.stripe.com/demo_inv_neovibe',
          upiId: '',
          customNotes: 'Wire transfers preferred. Card payments accepted via Stripe link.',
        },
        recurring: {
          isRecurring: false,
          frequency: 'monthly',
          nextBillingDate: dueDate,
          autoRemindPush: true,
          notifyDaysBefore: 3,
        },
        followUps: getDefaultFollowUpSequences(baseNumber, 'Studio Aurelia', 'Julian Vance', '$10,535.25', dueDate),
      };
    },
  },

  // 5. MODERN TECH SLATE
  {
    id: 'tpl-tech-slate',
    name: 'Tech Contractor & Engineering',
    category: 'creative',
    categoryLabel: 'Creative & Modern',
    description: 'High-tech monospace styling tailored for cloud architects, devops, and software engineers.',
    badge: 'Code & DevOps',
    recommendedColor: '#0284c7', // Sky Blue
    templateStyle: 'tech',
    generateInvoice: (baseNumber: string) => {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date();
      due.setDate(due.getDate() + 15);
      const dueDate = due.toISOString().split('T')[0];

      return {
        template: 'tech',
        accentColor: '#0284c7',
        currency: 'USD',
        poNumber: 'SPRINT-ENG-72',
        items: [
          {
            id: 'item-tc-1',
            description: 'Microservices Architecture & GraphQL Federation Gateway',
            quantity: 1,
            unitPrice: 5600,
            itemDiscount: 0,
          },
          {
            id: 'item-tc-2',
            description: 'Automated CI/CD GitHub Actions Workflow & Terraform Scripts',
            quantity: 1,
            unitPrice: 2400,
            itemDiscount: 0,
          },
          {
            id: 'item-tc-3',
            description: 'Database Query Optimization & Redis Caching Layer',
            quantity: 12,
            unitPrice: 125,
            itemDiscount: 0,
          },
        ],
        taxType: 'none',
        taxRate: 0,
        compoundTaxRate: 0,
        discountType: 'fixed',
        discountValue: 200,
        shippingOrFees: 0,
        notes: 'System verification tests passed with 99.98% coverage. Repository pull request merged.',
        terms: 'Net 15 days. Wire payment directly or use the automated Stripe merchant checkout.',
        client: {
          name: 'Marcus Brody',
          company: 'HyperScale Cloud Labs',
          email: 'm.brody@hyperscalelabs.io',
          phone: '+1 (206) 555-0912',
          address: '400 Pine Street, Suite 900',
          cityStateZip: 'Seattle, WA 98101',
          country: 'United States',
          taxId: 'US-WA-884019',
          projectCode: 'HYPER-CORE-API-V2',
        },
        paymentMethod: {
          bankName: 'First Republic / Chase',
          accountName: 'Elena Rostova Engineering',
          accountNumber: '9920 1144 0019',
          routingOrSwift: 'FRTCUS6S',
          iban: '',
          paypalEmail: 'brody-billing@hyperscalelabs.io',
          stripeLink: 'https://buy.stripe.com/tech_invoice_demo',
          upiId: '',
          customNotes: 'Direct wire or ACH payment accepted.',
        },
        recurring: {
          isRecurring: true,
          frequency: 'bi-weekly',
          nextBillingDate: dueDate,
          autoRemindPush: true,
          notifyDaysBefore: 2,
        },
        followUps: getDefaultFollowUpSequences(baseNumber, 'Elena Rostova', 'Marcus Brody', '$9,300.00', dueDate),
      };
    },
  },

  // 6. CLASSIC ELEGANT LEGAL & ADVISORY
  {
    id: 'tpl-classic-legal',
    name: 'Classic Legal & Financial Counsel',
    category: 'professional',
    categoryLabel: 'Professional',
    description: 'Timeless luxury serif typography with formal billing breakdown for attorneys, accountants, and finance.',
    badge: 'Legal & Finance',
    recommendedColor: '#b45309', // Classic Amber Bronze
    templateStyle: 'classic',
    generateInvoice: (baseNumber: string) => {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date();
      due.setDate(due.getDate() + 21);
      const dueDate = due.toISOString().split('T')[0];

      return {
        template: 'classic',
        accentColor: '#b45309',
        currency: 'GBP',
        poNumber: 'LEGAL-REF-440',
        items: [
          {
            id: 'item-cl-1',
            description: 'Commercial Contract Drafting & IP Licensing Agreement',
            quantity: 1,
            unitPrice: 2800,
            itemDiscount: 0,
          },
          {
            id: 'item-cl-2',
            description: 'Partner Shareholder Agreement Review & Regulatory Compliance',
            quantity: 6,
            unitPrice: 350,
            itemDiscount: 0,
          },
          {
            id: 'item-cl-3',
            description: 'Trademark Filing & Intellectual Property Registry Representation',
            quantity: 1,
            unitPrice: 1200,
            itemDiscount: 0,
          },
        ],
        taxType: 'vat',
        taxRate: 20.0,
        compoundTaxRate: 0,
        discountType: 'percentage',
        discountValue: 0,
        shippingOrFees: 50,
        notes: 'Statutory fees and registry disbursements included as specified in the retainer agreement.',
        terms: 'Settlement required within 21 days from statement dispatch. Client reference must accompany all remittances.',
        client: {
          name: 'Alistair Sterling, Esq.',
          company: 'Mayfair Capital Advisors LLP',
          email: 'a.sterling@mayfaircap.co.uk',
          phone: '+44 20 7946 0991',
          address: '14 Berkeley Square',
          cityStateZip: 'London W1J 6BQ',
          country: 'United Kingdom',
          taxId: 'GB992014881',
          projectCode: 'MAYFAIR-CORP-RESTRUCT',
        },
        paymentMethod: {
          bankName: 'Coutts & Co.',
          accountName: 'Aurelia Legal Consultancy Client Account',
          accountNumber: '1882 9940',
          routingOrSwift: 'COUTGB22',
          iban: 'GB44COUT000018829940',
          paypalEmail: '',
          stripeLink: '',
          upiId: '',
          customNotes: 'Sort Code: 18-00-02 · Client Account Ref: LEGAL-REF-440',
        },
        recurring: {
          isRecurring: false,
          frequency: 'quarterly',
          nextBillingDate: dueDate,
          autoRemindPush: true,
          notifyDaysBefore: 4,
        },
        followUps: getDefaultFollowUpSequences(baseNumber, 'Aurelia Consultancy', 'Alistair Sterling', '£7,370.00', dueDate),
      };
    },
  },

  // 7. SIMPLE MARKETING & SOCIAL MEDIA RETAINER
  {
    id: 'tpl-simple-marketing-retainer',
    name: 'Simple Monthly Marketing Retainer',
    category: 'simple',
    categoryLabel: 'Simple Style',
    description: 'Straightforward monthly retainer for content creators, social media managers, and growth freelancers.',
    badge: 'Monthly Retainer',
    recommendedColor: '#0d9488', // Teal
    templateStyle: 'modern',
    generateInvoice: (baseNumber: string) => {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date();
      due.setDate(due.getDate() + 10);
      const dueDate = due.toISOString().split('T')[0];

      return {
        template: 'modern',
        accentColor: '#0d9488',
        currency: 'USD',
        poNumber: 'OCTOBER-GROWTH',
        items: [
          {
            id: 'item-mr-1',
            description: 'Social Media Content Creation (16 Custom Reels/Shorts + Graphics)',
            quantity: 1,
            unitPrice: 1850,
            itemDiscount: 0,
          },
          {
            id: 'item-mr-2',
            description: 'Google Ads & Paid Meta Advertising Campaign Management',
            quantity: 1,
            unitPrice: 1200,
            itemDiscount: 0,
          },
          {
            id: 'item-mr-3',
            description: 'Bi-Weekly Analytics Performance & KPI Strategy Report',
            quantity: 1,
            unitPrice: 450,
            itemDiscount: 0,
          },
        ],
        taxType: 'none',
        taxRate: 0,
        compoundTaxRate: 0,
        discountType: 'fixed',
        discountValue: 100,
        shippingOrFees: 0,
        notes: 'Thank you for your ongoing partnership! Analytics reporting will be delivered on the 1st and 15th.',
        terms: 'Payment is due on the 10th of each monthly retainer period. Autopay available via Stripe.',
        client: {
          name: 'Chloe Zhang',
          company: 'Aura Skincare Lab',
          email: 'chloe@auraskincare.com',
          phone: '+1 (213) 555-7729',
          address: '840 S Spring St',
          cityStateZip: 'Los Angeles, CA 90014',
          country: 'United States',
          taxId: '',
          projectCode: 'AURA-GROWTH-2026',
        },
        paymentMethod: {
          bankName: 'Brex Bank',
          accountName: 'Elena Rostova Agency',
          accountNumber: '7721 8890 2210',
          routingOrSwift: '121000358',
          iban: '',
          paypalEmail: 'billing@auragrowth.io',
          stripeLink: 'https://buy.stripe.com/aura_monthly_demo',
          upiId: '',
          customNotes: 'Setup autopay or submit wire remittance.',
        },
        recurring: {
          isRecurring: true,
          frequency: 'monthly',
          nextBillingDate: dueDate,
          autoRemindPush: true,
          notifyDaysBefore: 3,
        },
        followUps: getDefaultFollowUpSequences(baseNumber, 'Elena Rostova', 'Chloe Zhang', '$3,400.00', dueDate),
      };
    },
  },

  // 8. MEDIA & PHOTOGRAPHY / VIDEO PRODUCTION
  {
    id: 'tpl-creative-media-production',
    name: 'Media, Video & Photography Production',
    category: 'creative',
    categoryLabel: 'Creative & Modern',
    description: 'Tailored for photographers, videographers, and creative producers with usage licensing.',
    badge: 'Media & Production',
    recommendedColor: '#e11d48', // Rose Crimson
    templateStyle: 'creative',
    generateInvoice: (baseNumber: string) => {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date();
      due.setDate(due.getDate() + 14);
      const dueDate = due.toISOString().split('T')[0];

      return {
        template: 'creative',
        accentColor: '#e11d48',
        currency: 'USD',
        poNumber: 'SHOOT-SUMMER-01',
        items: [
          {
            id: 'item-vp-1',
            description: 'On-Location Commercial 4K Video Production (2 Full Shoot Days)',
            quantity: 2,
            unitPrice: 2200,
            itemDiscount: 0,
          },
          {
            id: 'item-vp-2',
            description: 'Post-Production Video Editing, Color Grading & Sound Mix',
            quantity: 1,
            unitPrice: 2600,
            itemDiscount: 0,
          },
          {
            id: 'item-vp-3',
            description: 'Commercial Broadcast & Digital Media Usage Rights (1-Year Global)',
            quantity: 1,
            unitPrice: 1500,
            itemDiscount: 0,
          },
        ],
        taxType: 'sales',
        taxRate: 7.0,
        compoundTaxRate: 0,
        discountType: 'percentage',
        discountValue: 0,
        shippingOrFees: 150,
        notes: 'Raw camera media archives maintained for 6 months. High-res Master Prores files delivered via private cloud transfer.',
        terms: '50% deposit received. Final balance due within 14 days of final cut delivery.',
        client: {
          name: 'Sebastian Cruz',
          company: 'Lumina Eyewear Collective',
          email: 's.cruz@luminaeyewear.com',
          phone: '+1 (305) 555-8833',
          address: '444 Brickell Ave, Suite 800',
          cityStateZip: 'Miami, FL 33131',
          country: 'United States',
          taxId: 'US-FL-991204',
          projectCode: 'LUMINA-CAMPAIGN-4K',
        },
        paymentMethod: {
          bankName: 'City National Bank',
          accountName: 'Aurelia Visual Media LLC',
          accountNumber: '6639 1109 4410',
          routingOrSwift: '122016066',
          iban: '',
          paypalEmail: 'media@aureliavisual.com',
          stripeLink: 'https://buy.stripe.com/lumina_video_demo',
          upiId: '',
          customNotes: 'Include SHOOT-SUMMER-01 in payment memo.',
        },
        recurring: {
          isRecurring: false,
          frequency: 'monthly',
          nextBillingDate: dueDate,
          autoRemindPush: true,
          notifyDaysBefore: 3,
        },
        followUps: getDefaultFollowUpSequences(baseNumber, 'Aurelia Visual Media', 'Sebastian Cruz', '$9,252.00', dueDate),
      };
    },
  },
];
