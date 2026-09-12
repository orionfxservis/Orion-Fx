import React from 'react';
import { ReceiptData } from '../../types';
import { calculateTotals, formatMoney, numberToWords } from '../../utils/calculations';
import { StatusStamp } from './StatusStamp';
import { QrCodeRenderer } from './QrCodeRenderer';
import { Building2, Mail, Phone, Globe, MapPin, Hash, CreditCard } from 'lucide-react';

interface Props {
  data: ReceiptData;
}

export const ReceiptDocument: React.FC<Props> = ({ data }) => {
  const {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    shipping,
    grandTotal,
    paidAmount,
    balanceDue,
  } = calculateTotals(data);

  const {
    receiptNumber,
    type,
    status,
    issueDate,
    dueDate,
    currency,
    company,
    client,
    items,
    notes,
    terms,
    payment,
    signature,
    styling,
  } = data;

  const fontClass = 
    styling.fontFamily === 'serif' ? 'font-serif-display' : 
    styling.fontFamily === 'mono' ? 'font-mono-code' : '';

  // Thermal 80mm POS Receipt Template (Pakistan Standard POS & FBR Retail Invoicing Format)
  if (styling.template === 'thermal') {
    const fbrInvoiceNumber = data.fbrInvoiceNumber || (company.ntn ? `100234${issueDate.replace(/-/g, '').slice(2)}${receiptNumber.replace(/\D/g, '').slice(-4).padStart(4, '0')}` : '1002342609120842');
    const cashierName = data.cashierName || 'Counter 01 / Cashier';
    const receiptTime = data.receiptTime || '14:35:10';
    const ntnNumber = company.ntn || company.taxId || '7412985-3';
    const strnNumber = company.strn || '17-00-7412-985-19';
    const posTerminal = company.posTerminalId || 'POS-01';
    const totalQty = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
    const totalInWords = numberToWords(grandTotal, currency.name || 'Pak Rupees');

    // Pakistan FBR POS Verification URL or user defined payload
    const fbrQrPayload = payment.qrPayload && payment.qrPayload.trim().length > 0
      ? payment.qrPayload
      : `https://e.fbr.gov.pk/pos/verify?fbrInvoiceNo=${fbrInvoiceNumber}&posId=${posTerminal}&ntn=${ntnNumber}&amount=${grandTotal.toFixed(2)}&tax=${taxAmount.toFixed(2)}&date=${issueDate}`;

    return (
      <div 
        id="receipt-printable-area" 
        className={`bg-white text-slate-900 mx-auto p-4 sm:p-6 text-xs font-mono max-w-[380px] shadow-2xl border border-slate-300 ${fontClass}`}
        style={{ width: '100%' }}
      >
        {/* Pakistan POS Header */}
        <div className="text-center pb-2.5 space-y-1">
          {company.logoUrl && (
            <div className="flex justify-center mb-2">
              <img 
                src={company.logoUrl} 
                alt="Logo" 
                style={{ 
                  width: `${Math.min(company.logoWidth, 120)}px`,
                  borderRadius: `${company.logoBorderRadius}px`
                }} 
              />
            </div>
          )}
          <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-950">{company.name}</h2>
          {company.tagline && <p className="text-[11px] font-semibold text-slate-700">{company.tagline}</p>}
          <p className="text-[10px] text-slate-600 leading-tight">{company.address}</p>
          <p className="text-[10px] text-slate-600">{company.cityStateZip} {company.country ? `• ${company.country}` : ''}</p>
          {company.phone && <p className="text-[10px] font-bold text-slate-800">UAN / Tel: {company.phone}</p>}
          
          {/* Pakistan Tax Identification Registration Block */}
          <div className="pt-1 text-[10px] font-bold text-slate-800 space-y-0.5 border-t border-dotted border-slate-400 mt-1.5">
            <div className="flex justify-between px-1">
              <span>NTN :</span>
              <span className="font-mono tracking-wider">{ntnNumber}</span>
            </div>
            <div className="flex justify-between px-1">
              <span>STRN :</span>
              <span className="font-mono tracking-wider">{strnNumber}</span>
            </div>
            <div className="flex justify-between px-1">
              <span>POS REG # :</span>
              <span className="font-mono tracking-wider">{posTerminal}</span>
            </div>
          </div>
        </div>

        {/* Dashed Separator */}
        <div className="border-t-2 border-dashed border-slate-700 my-2"></div>

        {/* Invoice Header Details */}
        <div className="text-center space-y-0.5 pb-1">
          <p className="text-xs font-black uppercase tracking-wider text-slate-900">
            {type === 'TAX INVOICE' ? 'SALES TAX INVOICE (CASH)' : type}
          </p>
          <p className="text-[10px] font-semibold text-slate-600 tracking-widest">
            *** CUSTOMER COPY ***
          </p>
        </div>

        <div className="text-[10px] space-y-1 py-1 border-t border-dotted border-slate-300 font-medium">
          <div className="flex justify-between">
            <span className="text-slate-600">INVOICE NO:</span>
            <span className="font-bold text-slate-900">{receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">FBR INV NO:</span>
            <span className="font-bold font-mono text-slate-900 tracking-wider">{fbrInvoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">DATE & TIME:</span>
            <span className="font-mono text-slate-900">{issueDate} {receiptTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">CASHIER / COUNTER:</span>
            <span className="text-slate-900 font-semibold">{cashierName}</span>
          </div>
          {client.name && (
            <div className="pt-0.5 border-t border-dashed border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-600">CUSTOMER:</span>
                <span className="font-bold text-slate-900 truncate max-w-[190px]">{client.name}</span>
              </div>
              {client.phone && (
                <div className="flex justify-between">
                  <span className="text-slate-600">CONTACT:</span>
                  <span className="text-slate-800">{client.phone}</span>
                </div>
              )}
              {client.taxId && (
                <div className="flex justify-between">
                  <span className="text-slate-600">BUYER NTN/CNIC:</span>
                  <span className="text-slate-800 font-mono">{client.taxId}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Double-Line Separator */}
        <div className="border-t-2 border-slate-900 my-1.5"></div>

        {/* Line Items Table (Pakistan POS Format) */}
        <div className="py-1">
          <div className="flex justify-between font-black text-[10px] uppercase text-slate-900 pb-1 border-b border-slate-400 mb-1.5">
            <span className="w-[18px]">#</span>
            <span className="flex-1 px-1">DESCRIPTION</span>
            <span className="w-10 text-center">QTY</span>
            <span className="w-14 text-right">RATE</span>
            <span className="w-16 text-right">AMOUNT</span>
          </div>

          <div className="space-y-2 text-[11px]">
            {items.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice;
              return (
                <div key={item.id} className="leading-tight">
                  <div className="flex items-start">
                    <span className="w-[18px] text-[10px] text-slate-500 font-bold">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="flex-1 px-1 font-bold text-slate-900">
                      {item.description || 'General Item'}
                      {item.details && (
                        <span className="block text-[9px] font-normal text-slate-500 italic mt-0.5">{item.details}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] pl-[18px] text-slate-600 pt-0.5">
                    <span className="w-10 text-center font-semibold text-slate-800">{item.quantity}</span>
                    <span className="w-14 text-right font-mono">{formatMoney(item.unitPrice, '')}</span>
                    <span className="w-16 text-right font-bold font-mono text-slate-950">{formatMoney(lineTotal, currency.symbol)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 mt-2 border-t border-dashed border-slate-300 flex justify-between text-[10px] font-bold text-slate-700">
            <span>TOTAL ITEMS: {items.length}</span>
            <span>TOTAL UNITS: {totalQty}</span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t-2 border-dashed border-slate-700 my-2"></div>

        {/* Totals & Pakistan Sales Tax Breakdown */}
        <div className="space-y-1 text-[11px] py-1">
          <div className="flex justify-between text-slate-700">
            <span>GROSS AMOUNT:</span>
            <span className="font-mono">{formatMoney(subtotal, currency.symbol)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>DISCOUNT ({data.discountValue}{data.discountType === 'percent' ? '%' : ''}):</span>
              <span className="font-mono font-bold text-rose-700">-{formatMoney(discountAmount, currency.symbol)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-700">
            <span>TAXABLE VALUE:</span>
            <span className="font-mono font-semibold">{formatMoney(taxableAmount, currency.symbol)}</span>
          </div>

          {taxAmount > 0 && (
            <div className="flex justify-between text-slate-800">
              <span>{data.taxLabel || 'SALES TAX / GST'} ({data.taxRate}%):</span>
              <span className="font-mono font-bold">+{formatMoney(taxAmount, currency.symbol)}</span>
            </div>
          )}

          {shipping > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>SERVICE / CHARGES:</span>
              <span className="font-mono">+{formatMoney(shipping, currency.symbol)}</span>
            </div>
          )}

          {/* NET BILL TOTAL */}
          <div className="border-y-2 border-slate-950 py-1.5 my-1.5 flex justify-between items-baseline text-sm sm:text-base font-black text-slate-950">
            <span>NET PAYABLE:</span>
            <span className="font-mono">{formatMoney(grandTotal, currency.symbol)}</span>
          </div>

          {/* Payment & Tender Details */}
          <div className="text-[10px] space-y-0.5 pt-0.5">
            <div className="flex justify-between text-slate-800">
              <span>TENDERED / PAID:</span>
              <span className="font-mono font-bold">{formatMoney(paidAmount, currency.symbol)}</span>
            </div>
            {balanceDue > 0 ? (
              <div className="flex justify-between font-bold text-rose-600">
                <span>BALANCE DUE:</span>
                <span className="font-mono">{formatMoney(balanceDue, currency.symbol)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-slate-700">
                <span>CHANGE RETURNED:</span>
                <span className="font-mono">{formatMoney(Math.max(0, paidAmount - grandTotal), currency.symbol)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-700 pt-0.5 font-medium">
              <span>PAYMENT MODE:</span>
              <span className="font-bold uppercase text-slate-900">{payment.method || 'CASH'}</span>
            </div>
          </div>

          {/* Total in Words */}
          <div className="pt-1.5 border-t border-dotted border-slate-300 text-[10px] text-slate-700 italic">
            <span className="font-bold not-italic">In Words: </span>
            <span>{totalInWords}</span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t-2 border-dashed border-slate-700 my-2.5"></div>

        {/* FBR POS Verification Section (Pakistan Standard) */}
        <div className="my-2 p-2.5 border-2 border-slate-800 rounded bg-slate-50 text-center space-y-1.5">
          <div className="border-b border-slate-400 pb-1">
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-950 block">
              FBR POS INTEGRATED INVOICE
            </span>
            <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide block">
              TIER-1 RETAILER SYSTEM
            </span>
          </div>

          {/* Scannable Verification QR Code */}
          <div className="flex flex-col items-center justify-center py-1">
            <QrCodeRenderer text={fbrQrPayload} size={80} />
            <p className="text-[8px] font-mono text-slate-600 mt-1 font-bold">FBR INV ID: {fbrInvoiceNumber}</p>
          </div>

          {/* FBR Tax Asaan instructions */}
          <div className="text-[8px] text-slate-700 leading-tight font-medium">
            <p className="font-bold text-slate-900">Verify this invoice via FBR "Tax Asaan" App</p>
            <p>or SMS FBR Invoice Number to <span className="font-bold text-slate-950">9966</span></p>
          </div>

          {/* Barcode representation */}
          <div className="pt-1 flex flex-col items-center">
            <div className="h-6 w-48 flex justify-center items-center gap-[2px] overflow-hidden">
              {[2,1,3,1,2,1,4,1,2,3,1,2,1,3,2,1,2,4,1,2,1,3,1,2,1,3,2,1,4,1,2,1,3].map((w, i) => (
                <div key={i} className="h-full bg-slate-900" style={{ width: `${w}px` }} />
              ))}
            </div>
            <span className="text-[8px] font-mono tracking-widest text-slate-600">*{fbrInvoiceNumber}*</span>
          </div>
        </div>

        {/* Optional Paid Stamp */}
        {signature.showStamp && status !== 'NONE' && (
          <div className="py-2 flex justify-center">
            <StatusStamp status={status} companyName={company.name} date={issueDate} />
          </div>
        )}

        {/* Terms & Conditions / Pakistan Exchange Policy */}
        <div className="pt-2 text-center text-[9px] text-slate-600 space-y-1">
          {/* Customary Urdu Greeting */}
          <p className="text-sm font-bold text-slate-950 py-0.5 tracking-wide">
            شکریہ! دوبارہ تشریف لائیں
          </p>
          <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
            THANK YOU FOR SHOPPING WITH US
          </p>

          <div className="border-t border-dotted border-slate-300 pt-1 text-left px-1 space-y-0.5 text-[8.5px] leading-tight text-slate-500">
            {terms ? (
              <p>{terms}</p>
            ) : (
              <>
                <p>• Goods once sold can be exchanged within 7 days with original receipt.</p>
                <p>• Price tags and barcodes must remain intact. No cash refunds.</p>
                <p>• Altered, used, or sale/discounted items are not exchangeable.</p>
              </>
            )}
            {notes && <p className="font-semibold text-slate-700 italic pt-0.5">Note: {notes}</p>}
          </div>

          <div className="pt-2 text-[8px] text-slate-400 font-mono">
            <span>Powered by OrionFx SaaS POS • orionfx.net</span>
          </div>
        </div>
      </div>
    );
  }

  // Modern Clean & Corporate & Minimal & Classic Templates
  const isCorporate = styling.template === 'corporate';
  const isMinimal = styling.template === 'minimal';
  const isClassic = styling.template === 'classic';

  return (
    <div 
      id="receipt-printable-area" 
      className={`bg-white text-slate-900 mx-auto p-6 sm:p-10 md:p-12 max-w-[820px] min-h-[950px] shadow-xl border border-slate-200 transition relative flex flex-col justify-between ${fontClass}`}
      style={{ width: '100%' }}
    >
      {/* Top Accent Strip if configured */}
      {styling.accentBarPosition === 'top' && (
        <div 
          className="absolute top-0 left-0 right-0 h-2.5 rounded-t-xl"
          style={{ backgroundColor: styling.primaryColor }}
        />
      )}

      {/* Main Document Content Area */}
      <div className="space-y-8">
        
        {/* Header Section */}
        {isCorporate ? (
          /* Corporate Template Header Banner */
          <div 
            className="p-6 rounded-xl text-white -mx-6 -mt-6 sm:-mx-10 sm:-mt-10 md:-mx-12 md:-mt-12 mb-6"
            style={{ backgroundColor: styling.primaryColor }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                {company.logoUrl && (
                  <div className="bg-white p-2 rounded-lg shadow-sm flex-shrink-0">
                    <img 
                      src={company.logoUrl} 
                      alt="Logo" 
                      style={{ 
                        width: `${company.logoWidth}px`, 
                        borderRadius: `${company.logoBorderRadius}px` 
                      }} 
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{company.name}</h1>
                  {company.tagline && <p className="text-xs opacity-90">{company.tagline}</p>}
                  <p className="text-[11px] opacity-80 mt-1">{company.address}, {company.cityStateZip}</p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-white/10 p-3 rounded-lg backdrop-blur-xs border border-white/20">
                <span className="text-xs uppercase tracking-widest font-bold opacity-90 block">{type}</span>
                <span className="text-xl font-mono font-bold tracking-tight">{receiptNumber}</span>
                <div className="text-[11px] opacity-80 mt-1">Date: {issueDate}</div>
              </div>
            </div>
          </div>
        ) : (
          /* Standard / Modern / Minimalist Header */
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
            
            {/* Company Info & Adjustable Logo */}
            <div className={`space-y-2 max-w-sm ${company.logoAlignment === 'center' ? 'text-center' : company.logoAlignment === 'right' ? 'text-right' : 'text-left'}`}>
              {company.logoUrl && (
                <div className={`flex ${company.logoAlignment === 'center' ? 'justify-center' : company.logoAlignment === 'right' ? 'justify-end' : 'justify-start'} mb-2`}>
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    style={{
                      width: `${company.logoWidth}px`,
                      borderRadius: `${company.logoBorderRadius}px`,
                    }}
                    className="object-contain shadow-2xs"
                  />
                </div>
              )}

              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {company.name || 'Company Name'}
                </h1>
                {company.tagline && (
                  <p className="text-xs text-slate-500 font-medium">{company.tagline}</p>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-0.5 leading-relaxed">
                {company.address && <p>{company.address}</p>}
                {company.cityStateZip && <p>{company.cityStateZip} {company.country}</p>}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 pt-1">
                  {company.email && <span>{company.email}</span>}
                  {company.phone && <span>• {company.phone}</span>}
                  {company.website && <span>• {company.website.replace('https://', '')}</span>}
                </div>
                {company.taxId && (
                  <p className="font-mono text-[11px] font-semibold text-slate-700 pt-0.5">
                    Tax Reg ID: {company.taxId}
                  </p>
                )}
              </div>
            </div>

            {/* Document Details & Stamp */}
            <div className="sm:text-right flex flex-col items-start sm:items-end justify-between self-stretch">
              <div>
                <div className="flex items-center gap-2 sm:justify-end mb-1">
                  {status !== 'NONE' && (
                    <span 
                      className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        status === 'PAID' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : status === 'DUE' 
                          ? 'bg-rose-50 text-rose-800 border-rose-300' 
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {status}
                    </span>
                  )}
                </div>

                <h2 
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ color: styling.primaryColor }}
                >
                  {type}
                </h2>
                <p className="text-sm font-mono font-bold text-slate-700 mt-1">
                  #{receiptNumber}
                </p>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p><span className="font-semibold text-slate-500">Date Issued:</span> {issueDate}</p>
                  {dueDate && (
                    <p><span className="font-semibold text-slate-500">Due Date:</span> {dueDate}</p>
                  )}
                </div>
              </div>

              {/* Status Stamp if toggled */}
              {signature.showStamp && status !== 'NONE' && (
                <div className="mt-2 hidden sm:block">
                  <StatusStamp status={status} companyName={company.name} date={issueDate} />
                </div>
              )}
            </div>

          </div>
        )}

        {/* Customer / Billed To Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
              Billed To / Customer
            </span>
            <h3 className="text-sm font-bold text-slate-900">{client.name || 'Valued Customer'}</h3>
            {client.company && (
              <p className="text-xs font-semibold text-slate-700">{client.company}</p>
            )}
            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
              {client.address && <p>{client.address}</p>}
              {client.cityStateZip && <p>{client.cityStateZip}</p>}
              {client.email && <p>{client.email}</p>}
              {client.phone && <p>{client.phone}</p>}
              {client.taxId && <p className="font-mono text-[11px] pt-1 text-slate-600">VAT/Tax ID: {client.taxId}</p>}
            </div>
          </div>

          {/* Payment & Settlement Summary Card */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                Payment & Billing Terms
              </span>
              <div className="text-xs text-slate-700 space-y-1">
                <p><span className="font-semibold text-slate-500">Method:</span> {payment.method}</p>
                {payment.bankName && (
                  <p><span className="font-semibold text-slate-500">Bank:</span> {payment.bankName}</p>
                )}
                {payment.accountNumber && (
                  <p className="font-mono text-[11px] text-slate-600">
                    <span className="font-sans font-semibold text-slate-500">Account:</span> {payment.accountNumber}
                  </p>
                )}
                {payment.iban && (
                  <p className="font-mono text-[11px] text-slate-600">
                    <span className="font-sans font-semibold text-slate-500">IBAN:</span> {payment.iban}
                  </p>
                )}
              </div>
            </div>

            {payment.paymentLink && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-blue-600 truncate">
                <span className="text-slate-400">Pay link: </span>
                <span className="font-medium underline">{payment.paymentLink}</span>
              </div>
            )}
          </div>
        </div>

        {/* Product / Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr 
                className="border-b-2 text-xs font-bold uppercase tracking-wider text-slate-700"
                style={{ borderColor: styling.primaryColor }}
              >
                <th className="py-2.5 px-2">#</th>
                <th className="py-2.5 px-2">Description & Details</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-2 text-right">Unit Price</th>
                <th className="py-2.5 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-2 text-slate-400 font-mono align-top text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-2 align-top">
                      <p className="font-bold text-slate-900">{item.description || 'Service or Item'}</p>
                      {item.details && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed max-w-md">
                          {item.details}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-medium text-slate-700 align-top">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700 align-top">
                      {formatMoney(item.unitPrice, currency.symbol)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-900 align-top">
                      {formatMoney(lineTotal, currency.symbol)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Calculation Section */}
        <div className="border-t-2 border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start gap-6">
          
          {/* Amount in words & Dynamic QR */}
          <div className="flex-1 space-y-3 max-w-sm">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-0.5">
                Total in Words
              </span>
              <p className="text-xs font-semibold text-slate-700 italic leading-snug">
                {numberToWords(grandTotal, currency.name.split('(')[0].trim())}
              </p>
            </div>

            {/* Scannable Payment QR code */}
            {payment.showQrCode && payment.qrPayload && (
              <div className="pt-2 flex items-center gap-3">
                <QrCodeRenderer text={payment.qrPayload} size={64} />
                <div className="text-[10px] text-slate-500">
                  <p className="font-bold text-slate-700">Official Document QR</p>
                  <p>Scan with any camera app for instant verification or direct settlement.</p>
                </div>
              </div>
            )}
          </div>

          {/* Breakdown Table */}
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">{formatMoney(subtotal, currency.symbol)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount ({data.discountValue}{data.discountType === 'percent' ? '%' : ''}):</span>
                <span className="font-mono">-{formatMoney(discountAmount, currency.symbol)}</span>
              </div>
            )}

            {taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>{data.taxLabel || 'Tax / VAT'} ({data.taxRate}%):</span>
                <span className="font-mono">+{formatMoney(taxAmount, currency.symbol)}</span>
              </div>
            )}

            {shipping > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping / Logistics:</span>
                <span className="font-mono">+{formatMoney(shipping, currency.symbol)}</span>
              </div>
            )}

            {/* Grand Total */}
            <div 
              className="flex justify-between text-sm sm:text-base font-black border-t-2 border-b-2 py-2 text-slate-900"
              style={{ borderColor: styling.primaryColor }}
            >
              <span>Total Amount:</span>
              <span className="font-mono">{formatMoney(grandTotal, currency.symbol)}</span>
            </div>

            {/* Paid / Balance Due */}
            {paidAmount > 0 && (
              <div className="flex justify-between text-slate-600 pt-0.5 text-xs">
                <span>Amount Paid:</span>
                <span className="font-mono font-medium">{formatMoney(paidAmount, currency.symbol)}</span>
              </div>
            )}

            {balanceDue > 0 && (
              <div className="flex justify-between text-rose-600 font-bold text-xs">
                <span>Balance Due:</span>
                <span className="font-mono">{formatMoney(balanceDue, currency.symbol)}</span>
              </div>
            )}
          </div>

        </div>

        {/* Terms and Conditions & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div className="space-y-1">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Terms & Conditions
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {terms || 'Payment is due according to agreed service terms.'}
            </p>
          </div>

          <div className="space-y-1">
            {notes && (
              <>
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Notes & Remarks
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{notes}</p>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Signatures & Footer Section */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6">
        
        {/* Footer Brand Credit */}
        <div className="text-[10px] text-slate-400">
          <p className="font-semibold text-slate-500">OrionFx SaaS Suite • Automated Billing & Receipts</p>
          <p>Generated securely on client-side • orionfx.net</p>
        </div>

        {/* Authorized Signature */}
        {signature.type !== 'none' && (
          <div className="text-center sm:text-right min-w-[200px]">
            {signature.type === 'drawn' && signature.dataUrl ? (
              <div className="h-14 flex items-center justify-center sm:justify-end mb-1">
                <img src={signature.dataUrl} alt="Signature" className="max-h-full max-w-[180px] object-contain" />
              </div>
            ) : signature.type === 'typed' ? (
              <div className="h-12 flex items-center justify-center sm:justify-end text-2xl text-blue-900 font-signature select-none">
                {signature.signerName || 'Alexander Vance'}
              </div>
            ) : (
              <div className="h-10" />
            )}

            <div className="border-t border-slate-300 pt-1.5 inline-block min-w-[180px]">
              <p className="text-xs font-bold text-slate-900">{signature.signerName || 'Authorized Signatory'}</p>
              <p className="text-[10px] text-slate-500">{signature.signerTitle || 'Executive Officer'}</p>
              {signature.signDate && (
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">Signed: {signature.signDate}</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
