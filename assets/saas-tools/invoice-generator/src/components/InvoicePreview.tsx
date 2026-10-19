import React from 'react';
import { Invoice } from '../types/invoice';
import { calculateInvoice, getDueDateStatus } from '../utils/calculations';
import { formatCurrency } from '../utils/currencies';
import { sanitizeInvoice } from '../utils/storage';
import { CheckCircle2, Clock, AlertCircle, Building2, Globe, Mail, Phone, QrCode } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
  containerId?: string;
  isCompact?: boolean;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice: rawInvoice,
  containerId = 'invoice-render-target',
  isCompact = false,
}) => {
  const invoice = sanitizeInvoice(rawInvoice);
  const calc = calculateInvoice(invoice);
  const dueStatus = getDueDateStatus(invoice.dueDate, invoice.status);
  const accent = invoice.accentColor || '#0284c7';

  // Render specific template styles
  const isCorporate = invoice.template === 'corporate';
  const isCreative = invoice.template === 'creative';
  const isTech = invoice.template === 'tech';
  const isClassic = invoice.template === 'classic';
  const isMinimal = invoice.template === 'minimal';
  const isExecutive = invoice.template === 'executive';

  return (
    <div
      id={containerId}
      className={`invoice-printable-container bg-white text-neutral-900 transition-all ${
        isCompact ? 'p-6 text-xs' : 'p-8 sm:p-12 text-sm shadow-xl rounded-xl'
      } ${
        isClassic
          ? 'font-serif border-4 border-double border-neutral-900'
          : 'border border-neutral-200'
      }`}
      style={{
        maxWidth: isCompact ? '100%' : '840px',
        margin: '0 auto',
        minHeight: isCompact ? 'auto' : '1080px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#171717',
      }}
    >
      {/* ================= HEADER ZONE ================= */}
      {isCorporate ? (
        // CORPORATE TEMPLATE HEADER
        <div className="mb-8 border-b-2 pb-6" style={{ borderColor: accent }}>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              {invoice.sender.logoUrl ? (
                <img
                  src={invoice.sender.logoUrl}
                  alt={`${invoice.sender.businessName || 'Company'} Logo - InvoiceCraft online invoice generator showing a customizable professional invoice template`}
                  className="w-16 h-16 object-contain rounded border border-neutral-200"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded flex items-center justify-center text-white font-bold text-xl shadow-sm"
                  style={{ backgroundColor: accent }}
                >
                  {(invoice.sender.businessName || invoice.sender.name || 'IC').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                  {invoice.sender.businessName || invoice.sender.name || 'Your Business Name'}
                </h1>
                <p className="text-xs text-neutral-500 font-mono tracking-wider mt-0.5">
                  TAX / VAT ID: {invoice.sender.taxId || 'N/A'}
                </p>
              </div>
            </div>

            <div className="text-right sm:self-center">
              <span
                className="inline-block text-xs uppercase tracking-widest font-bold px-3 py-1 rounded text-white"
                style={{ backgroundColor: accent }}
              >
                INVOICE
              </span>
              <p className="font-mono text-base font-bold mt-1 text-neutral-900">
                #{invoice.invoiceNumber}
              </p>
            </div>
          </div>
        </div>
      ) : isCreative ? (
        // CREATIVE STUDIO TEMPLATE HEADER
        <div className="mb-8 p-6 rounded-2xl relative overflow-hidden text-white" style={{ backgroundColor: accent }}>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              {invoice.sender.logoUrl ? (
                <img
                  src={invoice.sender.logoUrl}
                  alt={`${invoice.sender.businessName || 'Studio'} Logo - InvoiceCraft online invoice generator showing a customizable professional invoice template`}
                  className="w-16 h-16 object-contain rounded-xl bg-white p-1"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg">
                  {(invoice.sender.businessName || invoice.sender.name || 'IC').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  {invoice.sender.businessName || invoice.sender.name || 'Studio / Freelancer'}
                </h1>
                <p className="text-xs text-white/80">
                  {invoice.sender.website || invoice.sender.email}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-wider font-semibold text-white/80">Invoice Number</p>
              <p className="text-2xl font-black tracking-tight">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>
      ) : isTech ? (
        // TECH SLATE TEMPLATE HEADER
        <div className="mb-8 border-b border-neutral-300 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 text-neutral-100 font-mono text-xs mb-3">
                <span>INVOICE_ID:</span>
                <span className="font-bold">{invoice.invoiceNumber}</span>
              </div>
              <h1 className="text-2xl font-bold font-mono tracking-tight text-neutral-900">
                {invoice.sender.businessName || invoice.sender.name || 'Engineering Services'}
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-1">
                REF_PO: {invoice.poNumber || 'NONE'} · TAX_ID: {invoice.sender.taxId || 'N/A'}
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              {invoice.sender.logoUrl && (
                <img
                  src={invoice.sender.logoUrl}
                  alt={`${invoice.sender.businessName || 'Business'} Logo - InvoiceCraft online invoice generator showing a customizable professional invoice template`}
                  className="w-14 h-14 object-contain rounded border border-neutral-200 mb-2 sm:ml-auto"
                />
              )}
              <p className="text-neutral-500">SYSTEM STATUS: <span className="text-emerald-700 font-semibold uppercase">{invoice.status}</span></p>
              <p className="text-neutral-500">TIMESTAMP: {invoice.issueDate}</p>
            </div>
          </div>
        </div>
      ) : isClassic ? (
        // CLASSIC ELEGANT TAX INVOICE HEADER (matches screenshot)
        <div className="mb-6 text-center border-b border-neutral-300 pb-5">
          {invoice.sender.logoUrl && (
            <img
              src={invoice.sender.logoUrl}
              alt={`${invoice.sender.businessName || 'Company'} Logo - InvoiceCraft online invoice generator showing a customizable professional invoice template`}
              style={{
                width: invoice.sender.logoScale ? `${(invoice.sender.logoScale * 64) / 100}px` : '64px',
              }}
              className="object-contain mx-auto mb-2"
            />
          )}
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-normal text-neutral-900 uppercase">
            {invoice.sender.businessName || invoice.sender.name || 'WAR COMPUTERS'}
          </h1>
          {invoice.sender.subtitle && (
            <p className="text-xs sm:text-sm font-serif italic text-neutral-600 mt-0.5">
              {invoice.sender.subtitle}
            </p>
          )}
          <p className="text-[11px] sm:text-xs text-neutral-600 font-sans mt-1">
            {[invoice.sender.address, invoice.sender.cityStateZip, invoice.sender.country].filter(Boolean).join(' • ')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-neutral-600 font-sans mt-1">
            {invoice.sender.phone && <span>Tel: <strong>{invoice.sender.phone}</strong></span>}
            {invoice.sender.email && <span>Email: <strong>{invoice.sender.email}</strong></span>}
            {invoice.sender.taxId && <span>NTN: <strong>{invoice.sender.taxId}</strong></span>}
          </div>

          <div className="text-neutral-400 text-xs tracking-widest my-2 select-none">
            &#9670; &#9670; &#9670;
          </div>

          <div className="inline-block">
            <h2 className="text-sm sm:text-base font-serif font-bold uppercase tracking-wider text-neutral-900 border-y border-neutral-300 py-0.5 px-4">
              &mdash; TAX INVOICE OF PAYMENT &mdash;
            </h2>
            <p className="text-[11px] font-mono font-medium text-neutral-600 mt-1">
              Doc Ref: {invoice.invoiceNumber}
            </p>
          </div>
        </div>
      ) : isExecutive ? (
        // EXECUTIVE ADVISORY TEMPLATE HEADER
        <div className="mb-8 p-6 rounded-lg border-t-4 bg-neutral-50/70 border-b border-neutral-200" style={{ borderTopColor: accent }}>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              {invoice.sender.logoUrl ? (
                <img
                  src={invoice.sender.logoUrl}
                  alt={`${invoice.sender.businessName || 'Executive'} Logo - InvoiceCraft online invoice generator showing a customizable professional invoice template`}
                  className="w-16 h-16 object-contain rounded border border-neutral-200"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs"
                  style={{ backgroundColor: accent }}
                >
                  {(invoice.sender.businessName || invoice.sender.name || 'EX').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <span className="text-[10px] tracking-widest font-mono uppercase text-neutral-400 block mb-0.5">
                  STATEMENT OF ACCOUNT &middot; ADVISORY INVOICE
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                  {invoice.sender.businessName || invoice.sender.name || 'Executive Advisory'}
                </h1>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  TAX / VAT ID: {invoice.sender.taxId || 'N/A'}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-neutral-900 text-white">
                INVOICE #{invoice.invoiceNumber}
              </span>
              <p className="text-xs text-neutral-500 font-mono mt-1.5">
                ISSUE DATE: {invoice.issueDate}
              </p>
              {invoice.poNumber && (
                <p className="text-xs text-neutral-500 font-mono">PO: {invoice.poNumber}</p>
              )}
            </div>
          </div>
        </div>
      ) : isMinimal ? (
        // SIMPLE / MINIMAL FREELANCER TEMPLATE HEADER
        <div className="mb-8 pb-5 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-1">
              Invoice
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {invoice.sender.name || invoice.sender.businessName || 'Freelancer'}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {invoice.sender.email}
              {invoice.sender.phone && ` &middot; ${invoice.sender.phone}`}
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <p className="text-base font-bold text-neutral-900">#{invoice.invoiceNumber}</p>
            <p className="text-neutral-500 mt-0.5">Due: {invoice.dueDate}</p>
          </div>
        </div>
      ) : (
        // MODERN (DEFAULT)
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-start gap-4">
            {invoice.sender.logoUrl ? (
              <img
                src={invoice.sender.logoUrl}
                alt={`${invoice.sender.businessName || 'Company'} Logo - InvoiceCraft online invoice generator showing a customizable professional invoice template`}
                className="w-14 h-14 object-contain rounded-lg border border-neutral-200"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{ backgroundColor: accent }}
              >
                {(invoice.sender.businessName || invoice.sender.name || 'IC').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {invoice.sender.businessName || invoice.sender.name || 'Freelancer / Business'}
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                {invoice.sender.address && `${invoice.sender.address}, `}
                {invoice.sender.cityStateZip}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-xl font-bold uppercase tracking-wider" style={{ color: accent }}>
              INVOICE
            </h2>
            <p className="font-mono text-sm font-semibold text-neutral-900 mt-0.5">
              #{invoice.invoiceNumber}
            </p>
            {invoice.poNumber && (
              <p className="text-xs text-neutral-500 font-mono">PO: {invoice.poNumber}</p>
            )}
          </div>
        </div>
      )}

      {/* ================= BILLED TO / SENDER META GRID ================= */}
      {isClassic ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-neutral-300 text-xs sm:text-sm font-sans">
          {/* Left Column: Received with thanks from */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 font-mono mb-1">
              RECEIVED WITH THANKS FROM:
            </p>
            <p className="font-bold text-neutral-900 text-base">{invoice.client.name || 'Client Name'}</p>
            {invoice.client.company && (
              <p className="font-semibold text-neutral-800 italic">{invoice.client.company}</p>
            )}
            {invoice.client.address && <p className="text-neutral-600">{invoice.client.address}</p>}
            {(invoice.client.cityStateZip || invoice.client.country) && (
              <p className="text-neutral-600">
                {[invoice.client.cityStateZip, invoice.client.country].filter(Boolean).join(', ')}
              </p>
            )}
            {invoice.client.taxId && (
              <p className="text-xs font-mono text-neutral-600 mt-1">{invoice.client.taxId}</p>
            )}
            {invoice.client.phone && (
              <p className="text-xs text-neutral-500 mt-0.5">Contact: {invoice.client.phone}</p>
            )}
          </div>

          {/* Right Column: Date of record, due by, instrument, status */}
          <div className="space-y-1.5 text-left sm:text-right font-sans">
            <p className="text-neutral-600">
              Date of Record: <strong className="text-neutral-900 font-mono">{invoice.issueDate || '—'}</strong>
            </p>
            <p className="text-neutral-600">
              Due by: <strong className="text-neutral-900 font-mono">{invoice.dueDate || '—'}</strong>
            </p>
            <p className="text-neutral-600">
              Payment Instrument: <strong className="text-neutral-900">{invoice.paymentMethod.bankName ? 'Bank Transfer' : 'Direct Remittance'}</strong>
            </p>
            <div className="pt-1.5">
              <span className={`inline-block px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                invoice.status === 'paid'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : invoice.status === 'overdue'
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-neutral-100 text-neutral-900 border border-neutral-300'
              }`}>
                STATUS: {invoice.status}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-neutral-200 text-xs sm:text-sm">
          {/* Billed From (Sender) */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 font-mono">
              FROM:
            </p>
            <div className="space-y-1 text-neutral-700">
              <p className="font-semibold text-neutral-900 text-base">
                {invoice.sender.name || invoice.sender.businessName}
              </p>
              {invoice.sender.businessName && invoice.sender.name !== invoice.sender.businessName && (
                <p className="text-xs text-neutral-600">{invoice.sender.businessName}</p>
              )}
              {invoice.sender.address && <p>{invoice.sender.address}</p>}
              {(invoice.sender.cityStateZip || invoice.sender.country) && (
                <p>{[invoice.sender.cityStateZip, invoice.sender.country].filter(Boolean).join(', ')}</p>
              )}
              {invoice.sender.email && (
                <p className="flex items-center gap-1.5 text-xs text-neutral-600 mt-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  {invoice.sender.email}
                </p>
              )}
              {invoice.sender.phone && (
                <p className="flex items-center gap-1.5 text-xs text-neutral-600">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  {invoice.sender.phone}
                </p>
              )}
              {invoice.sender.taxId && (
                <p className="text-xs text-neutral-500 font-mono mt-1">
                  VAT / Tax ID: {invoice.sender.taxId}
                </p>
              )}
            </div>
          </div>

          {/* Billed To (Client) */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 font-mono">
              BILLED TO:
            </p>
            <div className="space-y-1 text-neutral-700">
              <p className="font-semibold text-neutral-900 text-base">
                {invoice.client.name || 'Client Name'}
              </p>
              {invoice.client.company && (
                <p className="font-medium text-neutral-800">{invoice.client.company}</p>
              )}
              {invoice.client.address && <p>{invoice.client.address}</p>}
              {(invoice.client.cityStateZip || invoice.client.country) && (
                <p>{[invoice.client.cityStateZip, invoice.client.country].filter(Boolean).join(', ')}</p>
              )}
              {invoice.client.email && (
                <p className="flex items-center gap-1.5 text-xs text-neutral-600 mt-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  {invoice.client.email}
                </p>
              )}
              {invoice.client.phone && (
                <p className="flex items-center gap-1.5 text-xs text-neutral-600">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  {invoice.client.phone}
                </p>
              )}
              {invoice.client.taxId && (
                <p className="text-xs text-neutral-500 font-mono mt-1">
                  Client VAT / Tax: {invoice.client.taxId}
                </p>
              )}
              {invoice.client.projectCode && (
                <div className="inline-block mt-2 px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 text-xs font-mono">
                  Project Ref: {invoice.client.projectCode}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= DATES & STATUS STRIP ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-3 rounded-lg bg-neutral-50 border border-neutral-100 text-xs">
        <div>
          <span className="text-neutral-500 block font-mono text-[11px]">INVOICE DATE</span>
          <span className="font-medium text-neutral-900">{invoice.issueDate || '—'}</span>
        </div>
        <div>
          <span className="text-neutral-500 block font-mono text-[11px]">PAYMENT DUE</span>
          <span className="font-medium text-neutral-900">{invoice.dueDate || '—'}</span>
        </div>
        <div>
          <span className="text-neutral-500 block font-mono text-[11px]">DUE STATUS</span>
          <span className={`font-semibold ${dueStatus.colorClass}`}>
            {dueStatus.label}
          </span>
        </div>
        <div>
          <span className="text-neutral-500 block font-mono text-[11px]">STATUS</span>
          <span className="font-semibold uppercase text-neutral-900">
            {invoice.status}
          </span>
        </div>
      </div>

      {/* ================= LINE ITEMS TABLE ================= */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className="border-b-2 text-xs font-bold uppercase tracking-wider text-neutral-600"
              style={{ borderColor: accent }}
            >
              <th className="py-3 px-2">Description</th>
              <th className="py-3 px-2 text-center w-20">Qty</th>
              <th className="py-3 px-2 text-right w-28">Rate</th>
              {invoice.items.some((i) => (i.itemDiscount || 0) > 0) && (
                <th className="py-3 px-2 text-right w-20">Disc.</th>
              )}
              <th className="py-3 px-2 text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-xs sm:text-sm">
            {invoice.items.map((item, idx) => {
              const lineRaw = (item.quantity || 0) * (item.unitPrice || 0);
              const lineDisc = (lineRaw * (item.itemDiscount || 0)) / 100;
              const lineFinal = lineRaw - lineDisc;

              return (
                <tr key={item.id || idx} className="hover:bg-neutral-50/50">
                  <td className="py-3.5 px-2">
                    <p className="font-medium text-neutral-900">{item.description || 'Service / Item'}</p>
                  </td>
                  <td className="py-3.5 px-2 text-center font-mono tabular-nums text-neutral-700">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono tabular-nums text-neutral-700">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </td>
                  {invoice.items.some((i) => (i.itemDiscount || 0) > 0) && (
                    <td className="py-3.5 px-2 text-right font-mono tabular-nums text-neutral-500">
                      {item.itemDiscount ? `${item.itemDiscount}%` : '—'}
                    </td>
                  )}
                  <td className="py-3.5 px-2 text-right font-mono tabular-nums font-semibold text-neutral-900">
                    {formatCurrency(lineFinal, invoice.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= TOTALS & BREAKDOWN ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-8 mb-8 pb-8 border-b border-neutral-200">
        
        {/* Payment Methods & Bank Instructions */}
        <div className="w-full sm:flex-1 text-xs space-y-2 text-neutral-700 min-w-0">
          <p className="font-semibold text-neutral-900 uppercase tracking-wider text-xs font-mono">
            PAYMENT INSTRUCTIONS
          </p>
          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80 space-y-1.5 font-sans">
            {invoice.paymentMethod.bankName && (
              <p><span className="text-neutral-500">Bank:</span> <strong className="text-neutral-900">{invoice.paymentMethod.bankName}</strong></p>
            )}
            {invoice.paymentMethod.accountName && (
              <p><span className="text-neutral-500">Account Name:</span> {invoice.paymentMethod.accountName}</p>
            )}
            {invoice.paymentMethod.accountNumber && (
              <p className="font-mono"><span className="text-neutral-500 font-sans">Account No:</span> {invoice.paymentMethod.accountNumber}</p>
            )}
            {invoice.paymentMethod.iban && (
              <p className="font-mono"><span className="text-neutral-500 font-sans">IBAN:</span> {invoice.paymentMethod.iban}</p>
            )}
            {invoice.paymentMethod.routingOrSwift && (
              <p className="font-mono"><span className="text-neutral-500 font-sans">SWIFT/Routing:</span> {invoice.paymentMethod.routingOrSwift}</p>
            )}
            {invoice.paymentMethod.paypalEmail && (
              <p><span className="text-neutral-500">PayPal:</span> {invoice.paymentMethod.paypalEmail}</p>
            )}
            {invoice.paymentMethod.stripeLink && (
              <p><span className="text-neutral-500">Online Link:</span> <span className="text-sky-600 underline break-all">{invoice.paymentMethod.stripeLink}</span></p>
            )}
            {invoice.paymentMethod.upiId && (
              <p className="font-mono"><span className="text-neutral-500 font-sans">UPI ID:</span> {invoice.paymentMethod.upiId}</p>
            )}
            {invoice.paymentMethod.customNotes && (
              <p className="text-neutral-600 pt-1 border-t border-neutral-200 mt-1 italic">
                {invoice.paymentMethod.customNotes}
              </p>
            )}
          </div>
        </div>

        {/* Financial Calculation Column */}
        <div className="w-full sm:w-auto sm:min-w-[300px] md:min-w-[340px] space-y-1.5 text-xs sm:text-sm shrink-0">
          <div className="flex justify-between items-center py-1 text-neutral-600 gap-4">
            <span className="whitespace-nowrap shrink-0">Subtotal:</span>
            <span className="font-mono tabular-nums whitespace-nowrap text-right pl-3 shrink-0">{formatCurrency(calc.subtotal, invoice.currency)}</span>
          </div>

          {calc.itemDiscountsTotal > 0 && (
            <div className="flex justify-between items-center py-1 text-emerald-600 gap-4">
              <span className="whitespace-nowrap shrink-0">Item Discounts:</span>
              <span className="font-mono tabular-nums whitespace-nowrap text-right pl-3 shrink-0">-{formatCurrency(calc.itemDiscountsTotal, invoice.currency)}</span>
            </div>
          )}

          {calc.globalDiscountAmount > 0 && (
            <div className="flex justify-between items-center py-1 text-emerald-600 gap-4">
              <span className="whitespace-nowrap shrink-0">
                Discount ({invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : 'Fixed'}):
              </span>
              <span className="font-mono tabular-nums whitespace-nowrap text-right pl-3 shrink-0">-{formatCurrency(calc.globalDiscountAmount, invoice.currency)}</span>
            </div>
          )}

          {calc.primaryTaxAmount > 0 && (
            <div className="flex justify-between items-center py-1 text-neutral-600 gap-4">
              <span className="whitespace-nowrap shrink-0">
                {invoice.taxType.toUpperCase()} ({invoice.taxRate}%):
              </span>
              <span className="font-mono tabular-nums whitespace-nowrap text-right pl-3 shrink-0">{formatCurrency(calc.primaryTaxAmount, invoice.currency)}</span>
            </div>
          )}

          {calc.compoundTaxAmount > 0 && (
            <div className="flex justify-between items-center py-1 text-neutral-600 gap-4">
              <span className="whitespace-nowrap shrink-0">Compound Tax ({invoice.compoundTaxRate}%):</span>
              <span className="font-mono tabular-nums whitespace-nowrap text-right pl-3 shrink-0">{formatCurrency(calc.compoundTaxAmount, invoice.currency)}</span>
            </div>
          )}

          {calc.shippingOrFees > 0 && (
            <div className="flex justify-between items-center py-1 text-neutral-600 gap-4">
              <span className="whitespace-nowrap shrink-0">Shipping / Admin Fee:</span>
              <span className="font-mono tabular-nums whitespace-nowrap text-right pl-3 shrink-0">{formatCurrency(calc.shippingOrFees, invoice.currency)}</span>
            </div>
          )}

          {/* Grand Total Row */}
          <div
            className="flex justify-between items-center py-2.5 sm:py-3 border-t-2 border-b-2 text-sm sm:text-base font-bold gap-4"
            style={{ borderColor: accent }}
          >
            <span className="text-neutral-900 whitespace-nowrap shrink-0">Total Due:</span>
            <span className="font-mono tabular-nums whitespace-nowrap text-right pl-3 shrink-0" style={{ color: accent }}>
              {formatCurrency(calc.grandTotal, invoice.currency)}
            </span>
          </div>

          <p className="text-right text-[11px] text-neutral-400 font-mono">
            Currency: {invoice.currency}
          </p>
        </div>

      </div>

      {/* ================= NOTES, TERMS & SIGNATURE ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-neutral-600">
        
        {/* Notes & Terms */}
        <div className="sm:col-span-2 space-y-3">
          {invoice.notes && (
            <div>
              <p className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px] font-mono">
                NOTES
              </p>
              <p className="text-neutral-600 leading-relaxed mt-1">{invoice.notes}</p>
            </div>
          )}

          {invoice.terms && (
            <div>
              <p className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px] font-mono">
                TERMS &amp; CONDITIONS
              </p>
              <p className="text-neutral-500 leading-relaxed mt-1">{invoice.terms}</p>
            </div>
          )}
        </div>

        {/* Digital Signature */}
        <div className="flex flex-col items-center sm:items-end justify-end text-center sm:text-right pt-4 sm:pt-0">
          {invoice.sender.signatureUrl ? (
            <img
              src={invoice.sender.signatureUrl}
              alt="Authorized Signature"
              className="h-14 object-contain mb-1"
            />
          ) : (
            <div className="font-serif italic text-lg text-neutral-800 tracking-wide mb-1 border-b border-neutral-300 pb-1 px-4">
              {invoice.sender.signerName || invoice.sender.name || 'Authorized Signature'}
            </div>
          )}
          <div className="border-t border-neutral-300 w-44 pt-1">
            <p className="font-semibold text-neutral-900 text-xs">
              {invoice.sender.signerName || invoice.sender.name || 'Elena Rostova'}
            </p>
            <p className="text-[11px] text-neutral-500">
              {invoice.sender.signerTitle || 'Managing Director'}
            </p>
          </div>
        </div>

      </div>

      {/* Footer Branding line */}
      <div className="mt-12 pt-4 border-t border-neutral-200 text-center text-[11px] text-neutral-400">
        <p>Thank you for your business. Generated securely via InvoiceCraft by Orion Fx.</p>
      </div>

    </div>
  );
};
