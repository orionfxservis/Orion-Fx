import React, { useState } from 'react';
import { SyncAuditLog, Invoice } from '../types/invoice';
import { 
  X, 
  Wifi, 
  WifiOff, 
  CloudCheck, 
  RefreshCw, 
  Download, 
  Upload, 
  ShieldCheck, 
  Clock, 
  FileJson,
  CheckCircle2
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  hasUnsynced: boolean;
  onTriggerSync: () => Promise<void>;
  auditLogs: SyncAuditLog[];
  invoices: Invoice[];
  onImportInvoices: (imported: Invoice[]) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  hasUnsynced,
  onTriggerSync,
  auditLogs,
  invoices,
  onImportInvoices,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    await onTriggerSync();
    setIsSyncing(false);
  };

  // Export JSON backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoices, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `invoicecraft-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportInvoices(json);
          setImportMessage(`Successfully restored ${json.length} invoices!`);
          setTimeout(() => setImportMessage(null), 4000);
        } else {
          setImportMessage('Error: Invalid JSON invoice backup structure.');
        }
      } catch (err) {
        setImportMessage('Error: Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isOnline ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
            }`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Offline Mode &amp; Cloud Sync Engine
              </h3>
              <p className="text-xs text-neutral-500">
                Local-first IndexedDB persistence with remote cloud synchronization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network & Sync Status Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
          isOnline
            ? hasUnsynced
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
        }`}>
          <div className="text-xs">
            <span className="font-bold block text-sm">
              {isOnline
                ? hasUnsynced
                  ? 'Unsynced Local Changes Detected'
                  : 'All Invoices Fully Synced'
                : 'Working Completely Offline'}
            </span>
            <span className="opacity-90">
              {isOnline
                ? 'Your local invoices can be synchronized with the secure cloud repository.'
                : 'You can continue creating and editing invoices on the go. Changes will sync once connectivity returns.'}
            </span>
          </div>

          {isOnline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}
        </div>

        {/* Cross-device Backup & Portability */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Cross-Device Backup &amp; Portability
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportJson}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export JSON Backup</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-sky-600" />
              <span>Restore from JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>

          {importMessage && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300">
              {importMessage}
            </div>
          )}
        </div>

        {/* Recent Sync Audit Trail */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Recent Synchronization Ledger
          </h4>
          <div className="max-h-36 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {auditLogs.length === 0 ? (
              <p className="p-2 text-neutral-400 italic">No sync events logged yet.</p>
            ) : (
              auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {log.action.toUpperCase()}: #{log.invoiceNumber}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
