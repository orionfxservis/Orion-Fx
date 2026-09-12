import React from 'react';
import { CurrencyConfig, LineItem } from '../../types';
import { SAMPLE_PRODUCTS } from '../../data/initialData';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Percent, 
  DollarSign, 
  Truck, 
  Calculator,
  Layers
} from 'lucide-react';
import { calculateSubtotal, calculateDiscount, calculateTax, formatMoney } from '../../utils/calculations';

interface Props {
  items: LineItem[];
  currency: CurrencyConfig;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  taxRate: number;
  taxLabel: string;
  shippingFee: number;
  paidAmount: number;
  onUpdateItems: (items: LineItem[]) => void;
  onUpdateField: (field: string, value: any) => void;
}

export const LineItemsSection: React.FC<Props> = ({
  items,
  currency,
  discountType,
  discountValue,
  taxRate,
  taxLabel,
  shippingFee,
  paidAmount,
  onUpdateItems,
  onUpdateField,
}) => {

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    onUpdateItems(
      items.map(item => {
        if (item.id === id) {
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      })
    );
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      description: '',
      details: '',
      quantity: 1,
      unitPrice: 0,
    };
    onUpdateItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert('A receipt must have at least one product line item.');
      return;
    }
    onUpdateItems(items.filter(i => i.id !== id));
  };

  const handleAddPresetItem = (preset: typeof SAMPLE_PRODUCTS[0]) => {
    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      description: preset.description,
      details: preset.details,
      quantity: preset.quantity,
      unitPrice: preset.unitPrice,
    };
    onUpdateItems([...items, newItem]);
  };

  const subtotal = calculateSubtotal(items);
  const discountAmt = calculateDiscount(subtotal, discountType, discountValue);
  const taxableAmt = Math.max(0, subtotal - discountAmt);
  const taxAmt = calculateTax(taxableAmt, taxRate);
  const grandTotal = Math.max(0, taxableAmt + taxAmt + (Number(shippingFee) || 0));

  return (
    <div className="space-y-4">
      
      {/* Table Header / Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          Product / Service Items ({items.length})
        </span>

        {/* Quick Add Presets Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <select
              onChange={(e) => {
                const idx = Number(e.target.value);
                if (!isNaN(idx) && SAMPLE_PRODUCTS[idx]) {
                  handleAddPresetItem(SAMPLE_PRODUCTS[idx]);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md border border-slate-300 outline-none cursor-pointer"
            >
              <option value="" disabled>+ Add Quick Preset...</option>
              {SAMPLE_PRODUCTS.map((p, i) => (
                <option key={i} value={i}>{p.description.substring(0, 32)}...</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Item Rows */}
      <div className="space-y-2.5">
        {items.map((item, index) => {
          const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
          return (
            <div
              key={item.id}
              className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  title="Remove item"
                  className="text-slate-400 hover:text-rose-600 transition p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Description & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-7">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    placeholder="Item or Service Description *"
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                  />
                  <input
                    type="text"
                    value={item.details || ''}
                    onChange={(e) => handleItemChange(item.id, 'details', e.target.value)}
                    placeholder="Additional details / SKU / Scope notes (optional)"
                    className="w-full px-2.5 py-1 text-[11px] text-slate-500 bg-transparent border-b border-transparent focus:border-slate-300 focus:bg-white outline-none mt-1"
                  />
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs text-center font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Unit Price */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    Unit Price ({currency.symbol})
                  </label>
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Line Total display */}
              <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-slate-400">Total for this item:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatMoney(lineTotal, currency.symbol)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Adjustments (Discount, Tax, Shipping, Paid) */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-blue-600" />
          Taxes, Discounts & Total Breakdown
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Discount Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Discount
              </label>
              <div className="inline-flex rounded border border-slate-300 p-0.5 bg-white text-[10px]">
                <button
                  type="button"
                  onClick={() => onUpdateField('discountType', 'percent')}
                  className={`px-1.5 py-0.5 rounded ${discountType === 'percent' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateField('discountType', 'fixed')}
                  className={`px-1.5 py-0.5 rounded ${discountType === 'fixed' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}`}
                >
                  {currency.symbol}
                </button>
              </div>
            </div>
            <input
              type="number"
              min="0"
              step="any"
              value={discountValue || ''}
              onChange={(e) => onUpdateField('discountValue', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>

          {/* Tax / VAT rate */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tax / VAT Rate (%)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate || ''}
                onChange={(e) => onUpdateField('taxRate', parseFloat(e.target.value) || 0)}
                placeholder="e.g. 8 or 18"
                className="w-24 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
              <input
                type="text"
                value={taxLabel}
                onChange={(e) => onUpdateField('taxLabel', e.target.value)}
                placeholder="Label (e.g. VAT, GST)"
                className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Shipping / Extra Fee */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Shipping / Handling Fee ({currency.symbol})
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={shippingFee || ''}
              onChange={(e) => onUpdateField('shippingFee', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>

          {/* Paid Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Amount Paid ({currency.symbol})
              </label>
              <button
                type="button"
                onClick={() => onUpdateField('paidAmount', grandTotal)}
                className="text-[10px] text-blue-600 hover:underline font-semibold"
              >
                Mark Full Paid
              </button>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={paidAmount !== undefined ? paidAmount : ''}
              onChange={(e) => onUpdateField('paidAmount', parseFloat(e.target.value) || 0)}
              placeholder={grandTotal.toFixed(2)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-emerald-700"
            />
          </div>
        </div>

        {/* Live Subtotal / Grand Total Quick Preview */}
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
          <span>Grand Total:</span>
          <span className="text-sm font-mono text-blue-700">
            {formatMoney(grandTotal, currency.symbol)}
          </span>
        </div>
      </div>
    </div>
  );
};
