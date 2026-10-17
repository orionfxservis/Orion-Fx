import React, { useState } from 'react';
import { Invoice, InvoiceStatus } from '../types/invoice';
import { calculateInvoice, getDueDateStatus } from '../utils/calculations';
import { formatCurrency, convertToPKR } from '../utils/currencies';
import { buildWhatsAppMessage, getWhatsAppUrl } from '../utils/communication';
import { exportInvoiceToPdf, printInvoiceDirectly } from '../utils/pdfExport';
import { 
  Search, 
  Filter, 
  Plus, 
  Copy, 
  Trash2, 
  Edit3, 
  Download, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Repeat, 
  ArrowUpRight,
  TrendingUp,
  Layers,
  FileCheck,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { deduplicateInvoices } from '../utils/storage';

interface InvoiceListProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onNewInvoice: () => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  onCleanDuplicates?: () => void;
  onResetToStandard?: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onSelectInvoice,
  onNewInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onUpdateStatus,
  onCleanDuplicates,
  onResetToStandard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] = useState<string>('all');
  const [cleanFeedback, setCleanFeedback] = useState<string | null>(null);

  // Strictly deduplicate list of invoices to prevent duplicate entries
  const uniqueInvoices = deduplicateInvoices(invoices);

  // Filter invoices
  const filteredInvoices = uniqueInvoices.filter((inv) => {
    // Search query match
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.client.name.toLowerCase().includes(q) ||
      inv.client.company.toLowerCase().includes(q) ||
      (inv.client.projectCode && inv.client.projectCode.toLowerCase().includes(q)) ||
      inv.sender.businessName.toLowerCase().includes(q);

    // Status filter match
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    // Currency filter match
    const matchesCurrency = selectedCurrencyFilter === 'all' || inv.currency === selectedCurrencyFilter;

    return matchesSearch && matchesStatus && matchesCurrency;
  });

  // Calculate financial metrics converted into Pak Rs (PKR)
  let totalInvoicedPKR = 0;
  let totalPaidPKR = 0;
  let totalPendingPKR = 0;
  let totalOverduePKR = 0;

  let overdueCount = 0;
  let paidCount = 0;
  let pendingCount = 0;

  uniqueInvoices.forEach((inv) => {
    const { grandTotal } = calculateInvoice(inv);
    const amountInPKR = convertToPKR(grandTotal, inv.currency || 'PKR');

    totalInvoicedPKR += amountInPKR;

    if (inv.status === 'paid') {
      totalPaidPKR += amountInPKR;
      paidCount++;
    } else if (inv.status === 'overdue') {
      totalOverduePKR += amountInPKR;
      overdueCount++;
    } else if (inv.status === 'sent' || inv.status === 'draft') {
      totalPendingPKR += amountInPKR;
      pendingCount++;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ================= REAL-TIME FINANCIAL OVERVIEW (DASHBOARD) ================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Financial Dashboard</span>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Currency: Pak Rs (Rs.)
              </span>
            </h2>
            <p className="text-xs text-neutral-500">
              Live financial summary across all invoices calculated in Pak Rs. (Rs.)
            </p>
          </div>
          <div className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
            Standard: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Pak Rs (Rs.)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Box 1: Total Invoiced */}
          <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-1 gap-1.5">
              <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Total Invoiced
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap shrink-0">
                  Currency Pak Rs.
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              </div>
            </div>
            <div className="financial-card-amount text-base sm:text-[18px] font-bold tracking-tight text-slate-900 dark:text-white tabular-nums leading-snug my-0.5">
              {formatCurrency(totalInvoicedPKR, 'PKR')}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-blue-200/60 dark:border-slate-800 text-[10px]">
              <span className="text-slate-500 dark:text-slate-400">Across {uniqueInvoices.length} invoices</span>
              <span className="text-blue-700 dark:text-blue-400 font-semibold whitespace-nowrap">Currency Pak Rs.</span>
            </div>
          </div>

          {/* Box 2: Paid / Collected */}
          <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-1 gap-1.5">
              <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                Settled &amp; Paid
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0">
                  Currency Pak Rs.
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </div>
            </div>
            <div className="financial-card-amount text-base sm:text-[18px] font-bold tracking-tight text-emerald-700 dark:text-emerald-400 tabular-nums leading-snug my-0.5">
              {formatCurrency(totalPaidPKR, 'PKR')}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-emerald-200/60 dark:border-emerald-900 text-[10px]">
              <span className="text-emerald-700/80 dark:text-emerald-400/80">{paidCount} paid in full</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold whitespace-nowrap">Currency Pak Rs.</span>
            </div>
          </div>

          {/* Box 3: Pending Receivables */}
          <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-1 gap-1.5">
              <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 whitespace-nowrap">
                Awaiting Payment
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap shrink-0">
                  Currency Pak Rs.
                </span>
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              </div>
            </div>
            <div className="financial-card-amount text-base sm:text-[18px] font-bold tracking-tight text-amber-700 dark:text-amber-400 tabular-nums leading-snug my-0.5">
              {formatCurrency(totalPendingPKR, 'PKR')}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-amber-200/60 dark:border-amber-900 text-[10px]">
              <span className="text-amber-700/80 dark:text-amber-400/80">{pendingCount} open invoices</span>
              <span className="text-amber-700 dark:text-amber-400 font-semibold whitespace-nowrap">Currency Pak Rs.</span>
            </div>
          </div>

          {/* Box 4: Overdue Alert */}
          <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-1 gap-1.5">
              <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 whitespace-nowrap">
                Overdue Balance
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap shrink-0">
                  Currency Pak Rs.
                </span>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              </div>
            </div>
            <div className="financial-card-amount text-base sm:text-[18px] font-bold tracking-tight text-rose-700 dark:text-rose-400 tabular-nums leading-snug my-0.5">
              {formatCurrency(totalOverduePKR, 'PKR')}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-rose-200/60 dark:border-rose-900 text-[10px]">
              <span className="text-rose-700/80 dark:text-rose-400/80">{overdueCount} require follow-up</span>
              <span className="text-rose-700 dark:text-rose-400 font-semibold whitespace-nowrap">Currency Pak Rs.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Duplicates Confirmation Alert */}
      {cleanFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{cleanFeedback}</span>
          </div>
          <button
            onClick={() => setCleanFeedback(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 font-semibold text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================= SEARCH & FILTER CONTROLS ================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 w-full">
        {/* Left: Search Input & Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative w-full sm:w-60 md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, client..."
              className="w-full h-8.5 pl-8 pr-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 shadow-xs transition-colors"
            />
          </div>

          {/* Status segmented tabs (no scrollbar) */}
          <div
            className="flex items-center gap-0.5 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg shrink-0 overflow-visible no-scrollbar select-none h-8.5 border border-neutral-200/80 dark:border-neutral-700/80"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200/70 dark:border-neutral-700'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Action Buttons filled with solid colors */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap justify-start sm:justify-end shrink-0">
          {onCleanDuplicates && (
            <button
              onClick={() => {
                onCleanDuplicates();
                setCleanFeedback('All duplicate invoice entries have been scanned and removed.');
                setTimeout(() => setCleanFeedback(null), 4000);
              }}
              title="Remove any duplicate invoice entries"
              className="flex-1 sm:flex-initial h-8.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-300/80 dark:border-neutral-700 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Remove Duplicates</span>
            </button>
          )}

          {onResetToStandard && (
            <button
              onClick={() => {
                onResetToStandard();
                setCleanFeedback('Invoices reset to pristine Pak Rs (Rs.) standard samples.');
                setTimeout(() => setCleanFeedback(null), 4000);
              }}
              title="Reset invoices to standard clean Pak Rs samples"
              className="flex-1 sm:flex-initial h-8.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-300/80 dark:border-neutral-700 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Reset Samples</span>
            </button>
          )}

          <button
            onClick={onNewInvoice}
            className="flex-1 sm:flex-initial h-8.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-900 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>

          <button
            onClick={onNewInvoice}
            className="flex-1 sm:flex-initial h-8.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* ================= INVOICE DATA TABLE ================= */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              No invoices found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery
                ? `No invoices match "${searchQuery}". Try clearing search filters.`
                : 'Get started by creating your first professional invoice with custom branding.'}
            </p>
            <button
              onClick={onNewInvoice}
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client &amp; Project</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Quick Delivery</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs sm:text-sm">
                {filteredInvoices.map((inv) => {
                  const { grandTotal } = calculateInvoice(inv);
                  const dueStatus = getDueDateStatus(inv.dueDate, inv.status);
                  const waMsg = buildWhatsAppMessage(inv);
                  const waUrl = getWhatsAppUrl(inv.client.phone || '', waMsg);

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors group"
                    >
                      {/* Invoice # */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onSelectInvoice(inv)}
                          className="font-mono font-bold text-neutral-900 dark:text-neutral-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
                        >
                          {inv.invoiceNumber}
                        </button>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                          <span>{inv.issueDate}</span>
                          {inv.recurring && inv.recurring.isRecurring && (
                            <span className="inline-flex items-center gap-0.5 text-fuchsia-600 dark:text-fuchsia-400 font-medium">
                              <Repeat className="w-3 h-3" />
                              {inv.recurring.frequency}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Client & Project */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {inv.client.name}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {inv.client.company || inv.client.email}
                        </div>
                        {inv.client.projectCode && (
                          <span className="inline-block mt-0.5 text-[11px] font-mono text-neutral-500">
                            Ref: {inv.client.projectCode}
                          </span>
                        )}
                      </td>

                      {/* Due Date & status */}
                      <td className="py-3.5 px-4">
                        <div className="text-neutral-800 dark:text-neutral-200 font-mono text-xs">
                          {inv.dueDate}
                        </div>
                        <span className={`text-[11px] font-medium ${dueStatus.colorClass}`}>
                          {dueStatus.label}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={inv.status}
                          onChange={(e) => onUpdateStatus(inv.id, e.target.value as InvoiceStatus)}
                          className={`text-xs font-semibold uppercase tracking-wider py-1 px-2 rounded-md border-none ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : inv.status === 'overdue'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                              : inv.status === 'sent'
                              ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Amount Due */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatCurrency(grandTotal, inv.currency)}
                      </td>

                      {/* Quick Delivery (WhatsApp) */}
                      <td className="py-3.5 px-4 text-center">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Send to client on WhatsApp"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-medium transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectInvoice(inv)}
                            title="Edit Invoice"
                            className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDuplicateInvoice(inv)}
                            title="Duplicate as new invoice"
                            className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            title="Delete invoice"
                            className="p-1.5 rounded text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
