import React from 'react';
import { PaymentDetails } from '../../types';
import { CreditCard, QrCode, Building, Link, ShieldCheck } from 'lucide-react';

interface Props {
  payment: PaymentDetails;
  onChange: (payment: PaymentDetails) => void;
}

export const PaymentBankSection: React.FC<Props> = ({ payment, onChange }) => {
  const handleChange = (field: keyof PaymentDetails, value: any) => {
    onChange({
      ...payment,
      [field]: value,
    });
  };

  const paymentMethods = [
    'Bank Wire / ACH',
    'Credit / Debit Card',
    'PayPal / Online Link',
    'Stripe Checkout',
    'UPI / Scan & Pay',
    'Cash on Delivery',
    'Cryptocurrency (USDT/BTC)',
  ];

  return (
    <div className="space-y-3">
      {/* Payment Method Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Payment Method
          </label>
          <div className="relative">
            <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={payment.method}
              onChange={(e) => handleChange('method', e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
            >
              {paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Direct Payment / Verification Link
          </label>
          <div className="relative">
            <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={payment.paymentLink || ''}
              onChange={(e) => {
                handleChange('paymentLink', e.target.value);
                if (payment.showQrCode && !payment.qrPayload) {
                  handleChange('qrPayload', e.target.value);
                }
              }}
              placeholder="https://orionfx.net/pay/..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          Bank & Settlement Account Info
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Bank / Institution Name
            </label>
            <input
              type="text"
              value={payment.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              placeholder="e.g. JPMorgan Chase & Co."
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Beneficiary / Account Name
            </label>
            <input
              type="text"
              value={payment.accountName}
              onChange={(e) => handleChange('accountName', e.target.value)}
              placeholder="e.g. OrionFx Technologies Ltd."
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Account # / IBAN
            </label>
            <input
              type="text"
              value={payment.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
              placeholder="e.g. US89 JPMC 0210 0002 1009 8420"
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              SWIFT / BIC / Routing
            </label>
            <input
              type="text"
              value={payment.swift || ''}
              onChange={(e) => handleChange('swift', e.target.value)}
              placeholder="e.g. CHASUS33"
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Payment QR Code Toggle */}
      <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Generate Payment / Verification QR Code</span>
          </label>
          <input
            id="toggle-qr-code"
            type="checkbox"
            checked={payment.showQrCode}
            onChange={(e) => handleChange('showQrCode', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {payment.showQrCode && (
          <div className="pt-2 border-t border-blue-200/60 space-y-1">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              QR Code Content (URL, Payment Link or UPI String):
            </label>
            <input
              type="text"
              value={payment.qrPayload || ''}
              onChange={(e) => handleChange('qrPayload', e.target.value)}
              placeholder="https://orionfx.net/verify/rcpt_001 or upi://pay?pa=..."
              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
            />
            <p className="text-[10px] text-slate-500">
              Scannable with mobile camera for instant verification or payment transfer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
