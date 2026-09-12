import React from 'react';
import { CurrencyConfig, ReceiptType, StatusBadge, StylingConfig, TemplateId } from '../../types';
import { CURRENCIES, COLOR_PALETTES } from '../../data/initialData';
import { 
  Palette, 
  Calendar, 
  Hash, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Coins,
  FileCheck,
  LayoutTemplate
} from 'lucide-react';

interface Props {
  receiptNumber: string;
  fbrInvoiceNumber?: string;
  cashierName?: string;
  receiptTime?: string;
  type: ReceiptType;
  status: StatusBadge;
  issueDate: string;
  dueDate?: string;
  currency: CurrencyConfig;
  styling: StylingConfig;
  onUpdateField: (field: string, value: any) => void;
  onUpdateStyling: (styling: StylingConfig) => void;
}

export const ReceiptMetaSection: React.FC<Props> = ({
  receiptNumber,
  fbrInvoiceNumber,
  cashierName,
  receiptTime,
  type,
  status,
  issueDate,
  dueDate,
  currency,
  styling,
  onUpdateField,
  onUpdateStyling,
}) => {

  const generateAutoNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const prefix = type === 'RECEIPT' ? 'OFX-RCPT' : type.includes('INVOICE') ? 'OFX-INV' : 'OFX-DOC';
    onUpdateField('receiptNumber', `${prefix}-${year}-${random}`);
  };

  const generateAutoFbrNumber = () => {
    // Pakistan FBR POS format: 6-digit POS ID + 6-digit date (YYMMDD) + 4-digit sequence
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const fbrId = `100234${yy}${mm}${dd}${randomSeq}`;
    onUpdateField('fbrInvoiceNumber', fbrId);
  };

  const setNowTime = () => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    onUpdateField('receiptTime', timeStr);
  };

  const setRelativeDueDate = (days: number) => {
    const d = new Date(issueDate || Date.now());
    d.setDate(d.getDate() + days);
    onUpdateField('dueDate', d.toISOString().split('T')[0]);
  };

  const templates: { id: TemplateId; label: string; desc: string }[] = [
    { id: 'modern', label: 'Modern Clean', desc: 'Sleek header accent & contemporary grid' },
    { id: 'corporate', label: 'Corporate Executive', desc: 'Formal banner with high-contrast framing' },
    { id: 'thermal', label: 'Thermal POS (80mm)', desc: 'Compact receipt format for mobile & retail' },
    { id: 'minimal', label: 'Minimalist Studio', desc: 'Left branding rail with crisp typography' },
    { id: 'classic', label: 'Classic Serif', desc: 'Editorial serif with formal financial rules' },
  ];

  return (
    <div className="space-y-4">
      {/* Template & Accent Color Selection */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-600" />
            Template & Visual Theme
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Instant Live Switch</span>
        </div>

        {/* Template Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {templates.map((tpl) => {
            const isSelected = styling.template === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onUpdateStyling({ ...styling, template: tpl.id })}
                className={`p-2.5 rounded-lg border text-left transition relative cursor-pointer ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 shadow-xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold truncate">{tpl.label}</div>
                <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">{tpl.desc}</div>
                {isSelected && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Accent Color Palette */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-slate-500" />
            Brand Accent Color:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {COLOR_PALETTES.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onUpdateStyling({ ...styling, primaryColor: color.value })}
                title={color.label}
                className={`w-6 h-6 rounded-full transition transform hover:scale-110 border ${
                  styling.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-slate-900 border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
            <label className="cursor-pointer ml-1 flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900">
              <input
                type="color"
                value={styling.primaryColor}
                onChange={(e) => onUpdateStyling({ ...styling, primaryColor: e.target.value })}
                className="w-6 h-6 p-0 border border-slate-300 rounded cursor-pointer"
              />
              <span className="hidden sm:inline">Custom</span>
            </label>
          </div>
        </div>
      </div>

      {/* Document Type, Number & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Document Title / Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Document Type
          </label>
          <div className="relative">
            <FileCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              id="select-doc-type"
              value={type}
              onChange={(e) => onUpdateField('type', e.target.value as ReceiptType)}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
            >
              <option value="RECEIPT">RECEIPT</option>
              <option value="TAX INVOICE">TAX INVOICE</option>
              <option value="SALES RECEIPT">SALES RECEIPT</option>
              <option value="PAYMENT VOUCHER">PAYMENT VOUCHER</option>
              <option value="PROFORMA INVOICE">PROFORMA INVOICE</option>
              <option value="BILL OF SALE">BILL OF SALE</option>
            </select>
          </div>
        </div>

        {/* Receipt / Invoice Number */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Document / Receipt #
            </label>
            <button
              type="button"
              onClick={generateAutoNumber}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
            >
              <Sparkles className="w-3 h-3" /> Auto
            </button>
          </div>
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-receipt-number"
              type="text"
              value={receiptNumber}
              onChange={(e) => onUpdateField('receiptNumber', e.target.value)}
              placeholder="OFX-2026-001"
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Status Stamp */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Payment Status
          </label>
          <select
            id="select-doc-status"
            value={status}
            onChange={(e) => onUpdateField('status', e.target.value as StatusBadge)}
            className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="PAID">PAID (Settled)</option>
            <option value="DUE">DUE (Unpaid)</option>
            <option value="PENDING">PENDING</option>
            <option value="REFUNDED">REFUNDED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="NONE">NO STATUS BADGE</option>
          </select>
        </div>
      </div>

      {/* Dates & Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Issue Date */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Issue Date
            </label>
            <button
              type="button"
              onClick={() => onUpdateField('issueDate', new Date().toISOString().split('T')[0])}
              className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold"
            >
              Today
            </button>
          </div>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="date"
              value={issueDate}
              onChange={(e) => onUpdateField('issueDate', e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
        </div>

        {/* Due Date */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Due Date (Optional)
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRelativeDueDate(7)}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1 py-0.5 rounded"
              >
                +7d
              </button>
              <button
                type="button"
                onClick={() => setRelativeDueDate(14)}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1 py-0.5 rounded"
              >
                +14d
              </button>
              <button
                type="button"
                onClick={() => setRelativeDueDate(30)}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1 py-0.5 rounded"
              >
                +30d
              </button>
            </div>
          </div>
          <div className="relative">
            <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="date"
              value={dueDate || ''}
              onChange={(e) => onUpdateField('dueDate', e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
        </div>

        {/* Currency Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Currency
          </label>
          <div className="relative">
            <Coins className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <select
              id="select-currency"
              value={currency.code}
              onChange={(e) => {
                const found = CURRENCIES.find(c => c.code === e.target.value);
                if (found) onUpdateField('currency', found);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pakistan POS / Thermal POS Specific Fields */}
      <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Pakistan POS / FBR Tier-1 Invoicing Fields
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            Pakistan Standard
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* FBR Invoice Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                FBR POS Invoice #
              </label>
              <button
                type="button"
                onClick={generateAutoFbrNumber}
                className="text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5"
              >
                <Sparkles className="w-3 h-3" /> Auto FBR ID
              </button>
            </div>
            <input
              type="text"
              value={fbrInvoiceNumber || ''}
              onChange={(e) => onUpdateField('fbrInvoiceNumber', e.target.value)}
              placeholder="e.g. 1002342609120842"
              className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold text-slate-900"
            />
          </div>

          {/* Cashier / Counter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Cashier / Counter
            </label>
            <input
              type="text"
              value={cashierName || ''}
              onChange={(e) => onUpdateField('cashierName', e.target.value)}
              placeholder="e.g. Counter 01 / Ali"
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
            />
          </div>

          {/* Receipt Time */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Receipt Time
              </label>
              <button
                type="button"
                onClick={setNowTime}
                className="text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Set Current
              </button>
            </div>
            <input
              type="text"
              value={receiptTime || ''}
              onChange={(e) => onUpdateField('receiptTime', e.target.value)}
              placeholder="e.g. 14:35:10"
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
