import React, { useState } from 'react';
import { ReceiptData } from '../types';
import { CompanyBrandingSection } from './FormControls/CompanyBrandingSection';
import { ReceiptMetaSection } from './FormControls/ReceiptMetaSection';
import { ClientDetailsSection } from './FormControls/ClientDetailsSection';
import { LineItemsSection } from './FormControls/LineItemsSection';
import { PaymentBankSection } from './FormControls/PaymentBankSection';
import { TermsAndSignatureSection } from './FormControls/TermsAndSignatureSection';
import { 
  Building2, 
  FileText, 
  UserCheck, 
  ShoppingBag, 
  CreditCard, 
  FileCheck2, 
  ChevronDown, 
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface Props {
  data: ReceiptData;
  onChange: (newData: ReceiptData) => void;
}

type SectionKey = 'branding' | 'meta' | 'client' | 'items' | 'payment' | 'terms';

export const ReceiptEditor: React.FC<Props> = ({ data, onChange }) => {
  // Sections open state
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    branding: true,
    meta: true,
    client: false,
    items: true,
    payment: false,
    terms: false,
  });

  const toggleSection = (section: SectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const expandAll = () => {
    setOpenSections({
      branding: true,
      meta: true,
      client: true,
      items: true,
      payment: true,
      terms: true,
    });
  };

  const collapseAll = () => {
    setOpenSections({
      branding: false,
      meta: false,
      client: false,
      items: false,
      payment: false,
      terms: false,
    });
  };

  const handleUpdateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-3 pb-12">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-black text-slate-800 tracking-tight">Receipt Configuration</h2>
          <p className="text-xs text-slate-500">Live automatic updates in preview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition"
          >
            <Maximize2 className="w-3 h-3" /> Expand All
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition"
          >
            <Minimize2 className="w-3 h-3" /> Collapse
          </button>
        </div>
      </div>

      {/* 1. Template & Document Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition">
        <button
          type="button"
          onClick={() => toggleSection('meta')}
          className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Template, Number & Status
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {data.styling.template.toUpperCase()} • {data.receiptNumber} • {data.status}
              </span>
            </div>
          </div>
          {openSections.meta ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.meta && (
          <div className="p-4 border-t border-slate-100">
            <ReceiptMetaSection
              receiptNumber={data.receiptNumber}
              fbrInvoiceNumber={data.fbrInvoiceNumber}
              cashierName={data.cashierName}
              receiptTime={data.receiptTime}
              type={data.type}
              status={data.status}
              issueDate={data.issueDate}
              dueDate={data.dueDate}
              currency={data.currency}
              styling={data.styling}
              onUpdateField={handleUpdateField}
              onUpdateStyling={(styling) => handleUpdateField('styling', styling)}
            />
          </div>
        )}
      </div>

      {/* 2. Company & Branding */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition">
        <button
          type="button"
          onClick={() => toggleSection('branding')}
          className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Company Name & Adjustable Logo
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[200px] block">
                {data.company.name || 'Set company details and logo'}
              </span>
            </div>
          </div>
          {openSections.branding ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.branding && (
          <div className="p-4 border-t border-slate-100">
            <CompanyBrandingSection
              company={data.company}
              onChange={(company) => handleUpdateField('company', company)}
            />
          </div>
        )}
      </div>

      {/* 3. Client Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition">
        <button
          type="button"
          onClick={() => toggleSection('client')}
          className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Customer / Billed To Details
              </span>
              <span className="text-[10px] text-slate-500">
                {data.client.name ? `${data.client.name} (${data.client.company || 'Individual'})` : 'Client details'}
              </span>
            </div>
          </div>
          {openSections.client ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.client && (
          <div className="p-4 border-t border-slate-100">
            <ClientDetailsSection
              client={data.client}
              onChange={(client) => handleUpdateField('client', client)}
            />
          </div>
        )}
      </div>

      {/* 4. Line Items & Amounts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition">
        <button
          type="button"
          onClick={() => toggleSection('items')}
          className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Products, Services & Financial Breakdown
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {data.items.length} item(s) • Total: {data.currency.symbol}{data.paidAmount.toFixed(2)}
              </span>
            </div>
          </div>
          {openSections.items ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.items && (
          <div className="p-4 border-t border-slate-100">
            <LineItemsSection
              items={data.items}
              currency={data.currency}
              discountType={data.discountType}
              discountValue={data.discountValue}
              taxRate={data.taxRate}
              taxLabel={data.taxLabel}
              shippingFee={data.shippingFee}
              paidAmount={data.paidAmount}
              onUpdateItems={(items) => handleUpdateField('items', items)}
              onUpdateField={handleUpdateField}
            />
          </div>
        )}
      </div>

      {/* 5. Payment & Settlement */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition">
        <button
          type="button"
          onClick={() => toggleSection('payment')}
          className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Payment Method & QR Code
              </span>
              <span className="text-[10px] text-slate-500">
                {data.payment.method} {data.payment.showQrCode ? '• QR Enabled' : ''}
              </span>
            </div>
          </div>
          {openSections.payment ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.payment && (
          <div className="p-4 border-t border-slate-100">
            <PaymentBankSection
              payment={data.payment}
              onChange={(payment) => handleUpdateField('payment', payment)}
            />
          </div>
        )}
      </div>

      {/* 6. Terms, Notes & Signature */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition">
        <button
          type="button"
          onClick={() => toggleSection('terms')}
          className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Terms & Conditions & Official Signature
              </span>
              <span className="text-[10px] text-slate-500">
                Policies, notes, authorized signer & stamps
              </span>
            </div>
          </div>
          {openSections.terms ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.terms && (
          <div className="p-4 border-t border-slate-100">
            <TermsAndSignatureSection
              terms={data.terms}
              notes={data.notes}
              signature={data.signature}
              onUpdateTerms={(terms) => handleUpdateField('terms', terms)}
              onUpdateNotes={(notes) => handleUpdateField('notes', notes)}
              onUpdateSignature={(sig) => handleUpdateField('signature', sig)}
            />
          </div>
        )}
      </div>

    </div>
  );
};
