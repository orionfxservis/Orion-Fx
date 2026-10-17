import React, { useState, useRef } from 'react';
import { Invoice, InvoiceItem, InvoiceTemplate, InvoiceStatus } from '../types/invoice';
import { SUPPORTED_CURRENCIES } from '../utils/currencies';
import { buildWhatsAppMessage, getWhatsAppUrl, buildEmailData } from '../utils/communication';
import { exportInvoiceToPdf, printInvoiceDirectly } from '../utils/pdfExport';
import { ReadyTemplate, READY_TEMPLATES } from '../utils/readyTemplates';
import { sanitizeInvoice } from '../utils/storage';
import { InvoicePreview } from './InvoicePreview';
import { 
  FileText, 
  Building2, 
  User, 
  Plus, 
  Trash2, 
  Percent, 
  CreditCard, 
  MessageSquare, 
  Repeat, 
  Download, 
  Printer, 
  Save, 
  Send, 
  Copy, 
  Check, 
  Upload, 
  Palette, 
  Layout, 
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  FolderOpen,
  Zap,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon
} from 'lucide-react';

interface InvoiceEditorProps {
  invoice: Invoice;
  onUpdateInvoice: (updated: Invoice) => void;
  onSave: () => void;
  onDuplicate: (invoice: Invoice) => void;
  isSaving?: boolean;
  onNavigateToHistory?: () => void;
  invoicesCount?: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const TEMPLATE_OPTIONS: { id: InvoiceTemplate; name: string; desc: string }[] = [
  { id: 'classic', name: 'Classic (Tax Invoice / FBR)', desc: 'Official serif with double border & NTN' },
  { id: 'modern', name: 'Modern Standard', desc: 'Airy, crisp, sans-serif' },
  { id: 'executive', name: 'Professional Executive', desc: 'Formal advisory, statement banner' },
  { id: 'corporate', name: 'Corporate Enterprise', desc: 'Structured header, B2B format' },
  { id: 'minimal', name: 'Simple Freelancer', desc: 'Clean, fast hourly format' },
  { id: 'creative', name: 'Creative Studio', desc: 'Bold banner & design vibes' },
  { id: 'tech', name: 'Tech Slate', desc: 'Monospace, developer feel' },
];

const ACCENT_COLORS = [
  { name: 'Slate Dark', hex: '#0f172a' },
  { name: 'Sky Blue', hex: '#0284c7' },
  { name: 'Royal Blue', hex: '#1e40af' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Purple Violet', hex: '#7c3aed' },
  { name: 'Rose Crimson', hex: '#e11d48' },
  { name: 'Amber Bronze', hex: '#b45309' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Charcoal', hex: '#334155' },
];

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice: rawInvoice,
  onUpdateInvoice,
  onSave,
  onDuplicate,
  isSaving = false,
  onNavigateToHistory,
  invoicesCount = 3,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const invoice = sanitizeInvoice(rawInvoice);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedState, setCopiedState] = useState<'whatsapp' | 'email' | null>(null);
  const [activeFollowUpTab, setActiveFollowUpTab] = useState<number>(0);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [templateFeedbackMsg, setTemplateFeedbackMsg] = useState<string | null>(null);

  // Accordion state: only Template Design & Color Palette is open on initial load
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    templateDesign: true,
    companyBranding: false,
    customerInfo: false,
    itemsCalculations: false,
    paymentDetails: false,
    termsSignature: false,
    deliveryWhatsApp: false,
    recurringBilling: false,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  // Field change helpers
  const handleFieldChange = <K extends keyof Invoice>(field: K, value: Invoice[K]) => {
    onUpdateInvoice({ ...invoice, [field]: value });
  };

  const handleSenderChange = (field: keyof Invoice['sender'], value: any) => {
    onUpdateInvoice({
      ...invoice,
      sender: { ...invoice.sender, [field]: value },
    });
  };

  const handleClientChange = (field: keyof Invoice['client'], value: string) => {
    onUpdateInvoice({
      ...invoice,
      client: { ...invoice.client, [field]: value },
    });
  };

  const handlePaymentChange = (field: keyof Invoice['paymentMethod'], value: string) => {
    onUpdateInvoice({
      ...invoice,
      paymentMethod: { ...invoice.paymentMethod, [field]: value },
    });
  };

  const handleRecurringChange = (field: keyof Invoice['recurring'], value: any) => {
    onUpdateInvoice({
      ...invoice,
      recurring: { ...invoice.recurring, [field]: value },
    });
  };

  // Item helpers
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      description: '',
      quantity: 1,
      unitPrice: 0,
      itemDiscount: 0,
    };
    onUpdateInvoice({
      ...invoice,
      items: [...invoice.items, newItem],
    });
  };

  const handleUpdateItem = (index: number, updates: Partial<InvoiceItem>) => {
    const newItems = [...invoice.items];
    newItems[index] = { ...newItems[index], ...updates };
    onUpdateInvoice({ ...invoice, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    if (invoice.items.length <= 1) return;
    const newItems = invoice.items.filter((_, idx) => idx !== index);
    onUpdateInvoice({ ...invoice, items: newItems });
  };

  // Logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleSenderChange('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Signature upload
  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleSenderChange('signatureUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Apply template
  const handleApplyReadyTemplate = (tpl: ReadyTemplate) => {
    const generated = tpl.generateInvoice(invoice.invoiceNumber);
    onUpdateInvoice({
      ...invoice,
      ...generated,
      // Maintain Pak Rs (PKR) as standard currency unless customer explicitly picked otherwise
      currency: invoice.currency || generated.currency || 'PKR',
      template: tpl.templateStyle,
      accentColor: tpl.recommendedColor,
      sender: invoice.sender.name || invoice.sender.businessName ? invoice.sender : (generated.sender || invoice.sender),
    });
    setTemplateFeedbackMsg(`Loaded "${tpl.name}"! Standard currency: Pak Rs (Rs.).`);
    setTimeout(() => {
      setTemplateFeedbackMsg(null);
    }, 4500);
  };

  // PDF Export
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    await exportInvoiceToPdf('editor-preview-target', `Invoice-${invoice.invoiceNumber || 'draft'}`);
    setIsExportingPdf(false);
  };

  // WhatsApp click
  const whatsAppMsg = buildWhatsAppMessage(invoice);
  const whatsAppUrl = getWhatsAppUrl(invoice.client.phone || '', whatsAppMsg);

  // Email helper
  const emailData = buildEmailData(invoice);

  const copyToClipboard = (text: string, type: 'whatsapp' | 'email') => {
    navigator.clipboard.writeText(text);
    setCopiedState(type);
    setTimeout(() => setCopiedState(null), 2500);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 140));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 60));
  const handleZoomReset = () => setZoomLevel(100);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      
      {/* ================= TOP BAR (MATCHES SCREENSHOT EXACTLY) ================= */}
      <header className="no-print bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-2.5 shadow-xs sticky top-0 z-40">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left Brand Lockup */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToHistory}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs shadow-sm transition-transform group-hover:scale-105">
                OFX
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight leading-tight whitespace-nowrap">
                  OrionFx Invoice SaaS
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 whitespace-nowrap hidden sm:block">
                  Standalone Client-Side POS &amp; Invoicing Platform
                </p>
              </div>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Draft Saved Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Draft saved Just now</span>
            </div>

            {/* History & Templates Button */}
            <button
              type="button"
              onClick={onNavigateToHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold shadow-xs transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-neutral-500" />
              <span>History &amp; Templates</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-700 font-mono text-[11px]">
                {invoicesCount}
              </span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-neutral-600" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={printInvoiceDirectly}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* PDF Button (Deep Green as in screenshot) */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Generating...' : 'PDF'}</span>
            </button>

            {/* Export Dropdown Button (Blue as in screenshot) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1.5 z-50 text-xs">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsExportMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Send via WhatsApp</span>
                  </a>
                  <a
                    href={emailData.mailtoUrl}
                    onClick={() => setIsExportMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    <span>Send via Email</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      handleDownloadPdf();
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Download PDF File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      printInvoiceDirectly();
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <Printer className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Print Thermal / A4</span>
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

          </div>
        </div>
      </header>

      {/* ================= SUB-HEADER STRIP & LIVE PREVIEW CONTROLS ================= */}
      <div className="no-print max-w-[1700px] mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Pakistan FBR POS & Standard Invoicing Enabled banner */}
          <div className="lg:col-span-5 flex items-center justify-between p-2.5 px-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Pakistan FBR POS &amp; Standard Invoicing Enabled</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 font-bold text-[11px] whitespace-nowrap">
              All Offline &amp; Client-Side
            </span>
          </div>

          {/* Right: Live Preview Title & Zoom Controls */}
          <div className="lg:col-span-7 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <span className="text-neutral-400 font-mono">Live Preview:</span>
              <span className="font-mono text-neutral-900 dark:text-neutral-100 bg-neutral-200/80 dark:bg-neutral-800 px-2 py-0.5 rounded">
                {invoice.template.toUpperCase()}
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="w-7 h-7 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 flex items-center justify-center font-bold font-mono"
              >
                -
              </button>
              <span className="w-12 text-center font-mono font-bold text-xs tabular-nums text-neutral-800 dark:text-neutral-200">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="w-7 h-7 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 flex items-center justify-center font-bold font-mono"
              >
                +
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="ml-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Reset
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Temporary feedback banner */}
      {templateFeedbackMsg && (
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 my-2">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{templateFeedbackMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setTemplateFeedbackMsg(null)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN 2-COLUMN VIEWPORT ================= */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT COLUMN: ACCORDION SECTIONS WITH COLORED DOTS ================= */}
          <div className="lg:col-span-5 space-y-3.5">
            
            {/* MAIN SECTION HEADER: CREATE INVOICE */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3.5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                      Create Invoice
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Standard: Pak Rs (Rs.)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Configure sections on left • Live preview updates on right
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                  #{invoice.invoiceNumber}
                </span>
              </div>
            </div>

            {/* 1. TEMPLATE DESIGN & COLOR PALETTE (Green Dot) */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs transition-all">
              <button
                type="button"
                onClick={() => toggleSection('templateDesign')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Template Design &amp; Color Palette
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                  {openSections.templateDesign ? '▲ Collapse' : '▼ Expand'}
                </span>
              </button>

              {openSections.templateDesign && (
                <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                  {/* Ready Templates Selector Pills */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                      Ready-to-Use Templates
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {READY_TEMPLATES.slice(0, 6).map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleApplyReadyTemplate(tpl)}
                          className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-indigo-400 text-left bg-neutral-50/50 dark:bg-neutral-800/50 transition-all flex flex-col justify-between"
                        >
                          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                            {tpl.name}
                          </span>
                          <span className="text-[10px] text-neutral-500 mt-1 uppercase font-mono">
                            {tpl.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Style Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Layout Format
                      </label>
                      <select
                        value={invoice.template}
                        onChange={(e) => handleFieldChange('template', e.target.value as InvoiceTemplate)}
                        className="w-full text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg py-2 px-2.5 text-neutral-800 dark:text-neutral-200 focus:ring-2 focus:ring-emerald-500"
                      >
                        {TEMPLATE_OPTIONS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color Swatches */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Accent Theme
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {ACCENT_COLORS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            title={c.name}
                            onClick={() => handleFieldChange('accentColor', c.hex)}
                            className={`w-5 h-5 rounded-full transition-transform ${
                              invoice.accentColor.toLowerCase() === c.hex.toLowerCase()
                                ? 'scale-125 ring-2 ring-offset-1 ring-neutral-600'
                                : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                        <label title="Custom Color" className="relative cursor-pointer flex items-center justify-center ml-1">
                          <input
                            type="color"
                            value={invoice.accentColor}
                            onChange={(e) => handleFieldChange('accentColor', e.target.value)}
                            className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0 bg-transparent"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. COMPANY BRANDING & ADJUSTABLE LOGO (Blue Dot) */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs transition-all">
              <button
                type="button"
                onClick={() => toggleSection('companyBranding')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Company Branding &amp; Adjustable Logo
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                  {openSections.companyBranding ? '▲ Collapse' : '▼ Expand'}
                </span>
              </button>

              {openSections.companyBranding && (
                <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                  {/* Logo Upload & Scale Slider */}
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {invoice.sender.logoUrl ? (
                        <img
                          src={invoice.sender.logoUrl}
                          alt={`${invoice.sender.businessName || 'Company'} Logo - InvoiceCraft online invoice generator showing a customizable professional invoice template`}
                          style={{
                            width: invoice.sender.logoScale ? `${(invoice.sender.logoScale * 48) / 100}px` : '48px',
                          }}
                          className="h-12 object-contain rounded border border-neutral-200 bg-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-500">
                          NO LOGO
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                          Company Logo
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50"
                          >
                            Upload
                          </button>
                          {invoice.sender.logoUrl && (
                            <button
                              type="button"
                              onClick={() => handleSenderChange('logoUrl', '')}
                              className="text-[11px] text-rose-500 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Adjustable Logo Size Slider */}
                    <div className="w-full sm:w-44">
                      <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                        <span>Logo Size:</span>
                        <span className="font-mono font-bold">{invoice.sender.logoScale || 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="160"
                        value={invoice.sender.logoScale || 100}
                        onChange={(e) => handleSenderChange('logoScale', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Business Name (e.g. WAR COMPUTERS) *
                      </label>
                      <input
                        type="text"
                        value={invoice.sender.businessName}
                        onChange={(e) => handleSenderChange('businessName', e.target.value)}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2"
                        placeholder="WAR COMPUTERS"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Business Subtitle / Category
                      </label>
                      <input
                        type="text"
                        value={invoice.sender.subtitle || ''}
                        onChange={(e) => handleSenderChange('subtitle', e.target.value)}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2"
                        placeholder="Laptops & Chromebooks Wholesaler"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        NTN / Tax / VAT ID #
                      </label>
                      <input
                        type="text"
                        value={invoice.sender.taxId}
                        onChange={(e) => handleSenderChange('taxId', e.target.value)}
                        className="w-full font-mono rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2"
                        placeholder="7412985-3"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={invoice.sender.phone}
                        onChange={(e) => handleSenderChange('phone', e.target.value)}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2"
                        placeholder="+92 (021) 3456-7890"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Street Address / Plaza
                      </label>
                      <input
                        type="text"
                        value={invoice.sender.address}
                        onChange={(e) => handleSenderChange('address', e.target.value)}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2"
                        placeholder="Offie # 222. 2nd Floor, Regal Trade Center, Saddar"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        City, State, Zip, Country
                      </label>
                      <input
                        type="text"
                        value={invoice.sender.cityStateZip}
                        onChange={(e) => handleSenderChange('cityStateZip', e.target.value)}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2"
                        placeholder="Karachi, Sindh 75400 • Pakistan"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Billing Email
                      </label>
                      <input
                        type="email"
                        value={invoice.sender.email}
                        onChange={(e) => handleSenderChange('email', e.target.value)}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2"
                        placeholder="billing@orionfx.net"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. CUSTOMER / CLIENT INFORMATION (Purple Dot) */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs transition-all">
              <button
                type="button"
                onClick={() => toggleSection('customerInfo')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Customer / Client Information
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                  {openSections.customerInfo ? '▲ Collapse' : '▼ Expand'}
                </span>
              </button>

              {openSections.customerInfo && (
                <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Received With Thanks From (Client Name) *
                      </label>
                      <input
                        type="text"
                        value={invoice.client.name}
                        onChange={(e) => handleClientChange('name', e.target.value)}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 font-bold"
                        placeholder="Haroon Enterprise"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Company / Group
                      </label>
                      <input
                        type="text"
                        value={invoice.client.company}
                        onChange={(e) => handleClientChange('company', e.target.value)}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 italic"
                        placeholder="Apex Technologies Group"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Plot / Commercial Area / Address
                      </label>
                      <input
                        type="text"
                        value={invoice.client.address}
                        onChange={(e) => handleClientChange('address', e.target.value)}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2"
                        placeholder="Plot 12-C, Commercial Area, DHA Phase 6, Karachi"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Client Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={invoice.client.phone}
                        onChange={(e) => handleClientChange('phone', e.target.value)}
                        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 font-mono"
                        placeholder="+92 300 8291144"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Client NTN / Tax ID
                      </label>
                      <input
                        type="text"
                        value={invoice.client.taxId}
                        onChange={(e) => handleClientChange('taxId', e.target.value)}
                        className="w-full font-mono rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2"
                        placeholder="NTN: 8932014-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. ITEMS & CALCULATIONS (Orange Dot) */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs transition-all">
              <button
                type="button"
                onClick={() => toggleSection('itemsCalculations')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Items &amp; Calculations ({invoice.items.length})
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                  {openSections.itemsCalculations ? '▲ Collapse' : '▼ Expand'}
                </span>
              </button>

              {openSections.itemsCalculations && (
                <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                  {/* Currency & Dates Header */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Invoice #</label>
                      <input
                        type="text"
                        value={invoice.invoiceNumber}
                        onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
                        className="w-full font-mono font-bold rounded border border-neutral-300 dark:border-neutral-700 p-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Date of Record</label>
                      <input
                        type="date"
                        value={invoice.issueDate}
                        onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                        className="w-full font-mono rounded border border-neutral-300 dark:border-neutral-700 p-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Due By</label>
                      <input
                        type="date"
                        value={invoice.dueDate}
                        onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                        className="w-full font-mono rounded border border-neutral-300 dark:border-neutral-700 p-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Currency</label>
                      <select
                        value={invoice.currency || 'PKR'}
                        onChange={(e) => handleFieldChange('currency', e.target.value)}
                        className="w-full font-bold rounded border border-neutral-300 dark:border-neutral-700 p-1.5 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                      >
                        {SUPPORTED_CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Line Items List */}
                  <div className="space-y-2">
                    {invoice.items.map((item, idx) => {
                      const total = item.quantity * item.unitPrice * (1 - (item.itemDiscount || 0) / 100);
                      return (
                        <div key={item.id || `item-row-${idx}`} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-neutral-400 font-bold w-4">#{idx + 1}</span>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleUpdateItem(idx, { description: e.target.value })}
                              placeholder="Item description (e.g. Dell Latitude 7420 Lot)"
                              className="flex-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1.5 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              disabled={invoice.items.length <= 1}
                              className="text-neutral-400 hover:text-rose-500 disabled:opacity-30 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <span className="text-[10px] text-neutral-500 block">Qty</span>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(idx, { quantity: parseFloat(e.target.value) || 0 })}
                                className="w-full font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-neutral-500 block">Rate</span>
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                                className="w-full font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-neutral-500 block">Disc %</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.itemDiscount || 0}
                                onChange={(e) => handleUpdateItem(idx, { itemDiscount: parseFloat(e.target.value) || 0 })}
                                className="w-full font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1"
                              />
                            </div>
                            <div className="text-right flex flex-col justify-end">
                              <span className="text-[10px] text-neutral-400">Total</span>
                              <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                                {total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full py-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-500 rounded-lg text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-amber-500" />
                      <span>Add Invoice Line Item</span>
                    </button>
                  </div>

                  {/* Tax & Global Discount Rates */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Tax Calculation</label>
                      <select
                        value={invoice.taxType}
                        onChange={(e) => handleFieldChange('taxType', e.target.value as any)}
                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 p-1 text-xs"
                      >
                        <option value="sales">Sales Tax (FBR POS)</option>
                        <option value="vat">VAT</option>
                        <option value="gst">GST</option>
                        <option value="none">None (0%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Tax Rate %</label>
                      <input
                        type="number"
                        step="0.5"
                        value={invoice.taxRate}
                        onChange={(e) => handleFieldChange('taxRate', parseFloat(e.target.value) || 0)}
                        className="w-full font-mono rounded border border-neutral-300 dark:border-neutral-700 p-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Shipping / Fee</label>
                      <input
                        type="number"
                        value={invoice.shippingOrFees || 0}
                        onChange={(e) => handleFieldChange('shippingOrFees', parseFloat(e.target.value) || 0)}
                        className="w-full font-mono rounded border border-neutral-300 dark:border-neutral-700 p-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. PAYMENT METHOD & BANK DETAILS (Teal Dot) */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs transition-all">
              <button
                type="button"
                onClick={() => toggleSection('paymentDetails')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Payment Method &amp; Bank Details
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                  {openSections.paymentDetails ? '▲ Collapse' : '▼ Expand'}
                </span>
              </button>

              {openSections.paymentDetails && (
                <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Bank Name (e.g. Meezan Bank Limited)
                      </label>
                      <input
                        type="text"
                        value={invoice.paymentMethod.bankName}
                        onChange={(e) => handlePaymentChange('bankName', e.target.value)}
                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 p-2"
                        placeholder="Meezan Bank Limited"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Account Title
                      </label>
                      <input
                        type="text"
                        value={invoice.paymentMethod.accountName}
                        onChange={(e) => handlePaymentChange('accountName', e.target.value)}
                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 p-2"
                        placeholder="WAR COMPUTERS WHOLESALE"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={invoice.paymentMethod.accountNumber}
                        onChange={(e) => handlePaymentChange('accountNumber', e.target.value)}
                        className="w-full font-mono rounded border border-neutral-300 dark:border-neutral-700 p-2"
                        placeholder="0104 0100 8920 44"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        IBAN / SWIFT
                      </label>
                      <input
                        type="text"
                        value={invoice.paymentMethod.iban}
                        onChange={(e) => handlePaymentChange('iban', e.target.value)}
                        className="w-full font-mono rounded border border-neutral-300 dark:border-neutral-700 p-2"
                        placeholder="PK44MEZN0001040100892044"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Branch &amp; Payment Memo
                      </label>
                      <input
                        type="text"
                        value={invoice.paymentMethod.customNotes}
                        onChange={(e) => handlePaymentChange('customNotes', e.target.value)}
                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 p-2"
                        placeholder="Branch: Saddar Trade Center Branch Karachi. Instrument: Bank Transfer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. TERMS, NOTES & SIGNATURE (Red Dot) */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs transition-all">
              <button
                type="button"
                onClick={() => toggleSection('termsSignature')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Terms, Notes &amp; Signature
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                  {openSections.termsSignature ? '▲ Collapse' : '▼ Expand'}
                </span>
              </button>

              {openSections.termsSignature && (
                <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Warranty &amp; Notes
                    </label>
                    <textarea
                      rows={2}
                      value={invoice.notes}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                      className="w-full rounded border border-neutral-300 dark:border-neutral-700 p-2"
                      placeholder="Goods received in satisfactory condition. Warranty void if warranty seal broken."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Official Terms &amp; FBR Standard Clause
                    </label>
                    <textarea
                      rows={2}
                      value={invoice.terms}
                      onChange={(e) => handleFieldChange('terms', e.target.value)}
                      className="w-full rounded border border-neutral-300 dark:border-neutral-700 p-2"
                      placeholder="Official Tax Invoice under Sales Tax Act. Remittance confirmed through direct bank transfer instrument."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Signatory Name
                      </label>
                      <input
                        type="text"
                        value={invoice.sender.signerName || ''}
                        onChange={(e) => handleSenderChange('signerName', e.target.value)}
                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 p-2"
                        placeholder="Waqas Ahmed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Signatory Title
                      </label>
                      <input
                        type="text"
                        value={invoice.sender.signerTitle || ''}
                        onChange={(e) => handleSenderChange('signerTitle', e.target.value)}
                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 p-2"
                        placeholder="Managing Partner"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 7. CLIENT DELIVERY & WHATSAPP / FOLLOW-UP (Purple Dot) */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs transition-all">
              <button
                type="button"
                onClick={() => toggleSection('deliveryWhatsApp')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Client Delivery, WhatsApp &amp; Follow-Up
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                  {openSections.deliveryWhatsApp ? '▲ Collapse' : '▼ Expand'}
                </span>
              </button>

              {openSections.deliveryWhatsApp && (
                <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                        Send on WhatsApp
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {invoice.client.phone || 'Enter client phone in section 3'}
                      </span>
                    </div>
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Now</span>
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-neutral-700 dark:text-neutral-300 block text-[11px]">
                      Message Preview:
                    </span>
                    <div className="p-2.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px] text-neutral-600 dark:text-neutral-300 max-h-24 overflow-y-auto whitespace-pre-wrap">
                      {whatsAppMsg}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 8. RECURRING BILLING & PUSH NOTIFICATIONS (Indigo Dot) */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs transition-all">
              <button
                type="button"
                onClick={() => toggleSection('recurringBilling')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Recurring Billing &amp; Push Notifications
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                  {openSections.recurringBilling ? '▲ Collapse' : '▼ Expand'}
                </span>
              </button>

              {openSections.recurringBilling && (
                <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={invoice.recurring.isRecurring}
                      onChange={(e) => handleRecurringChange('isRecurring', e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      Enable Periodic Recurring Billing
                    </span>
                  </label>
                  {invoice.recurring.isRecurring && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">Cadence</label>
                        <select
                          value={invoice.recurring.frequency}
                          onChange={(e) => handleRecurringChange('frequency', e.target.value)}
                          className="w-full rounded border border-neutral-300 dark:border-neutral-700 p-1.5"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="bi-weekly">Bi-Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">Next Billing Date</label>
                        <input
                          type="date"
                          value={invoice.recurring.nextBillingDate}
                          onChange={(e) => handleRecurringChange('nextBillingDate', e.target.value)}
                          className="w-full rounded border border-neutral-300 dark:border-neutral-700 p-1.5 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* ================= RIGHT COLUMN: STICKY LIVE INVOICE PREVIEW ================= */}
          <div className="lg:col-span-7 sticky top-20 self-start space-y-2">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-2.5 px-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                  Live Invoice Preview
                </span>
                <span className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-400 font-semibold">
                  {invoice.template.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-neutral-400">Currency:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {invoice.currency === 'PKR' ? 'Pak Rs (Rs.)' : invoice.currency}
                </span>
              </div>
            </div>

            <div className="bg-neutral-200/50 dark:bg-neutral-900/60 p-2 sm:p-5 rounded-2xl border border-neutral-300/80 dark:border-neutral-800 shadow-inner overflow-hidden flex justify-center">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full flex justify-center"
              >
                <InvoicePreview
                  invoice={invoice}
                  containerId="editor-preview-target"
                  isCompact={false}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
