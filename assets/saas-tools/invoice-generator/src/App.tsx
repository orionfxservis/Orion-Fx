import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus, SyncAuditLog, ScheduledReminder } from './types/invoice';
import { 
  getStoredInvoices, 
  saveInvoices, 
  deduplicateInvoices,
  createDefaultInvoice,
  resetStorageToSamples,
  sanitizeInvoice,
  getStoredAuditLogs, 
  addAuditLog, 
  computeScheduledReminders, 
  getSavedSenderProfile, 
  saveSenderProfile 
} from './utils/storage';
import { getDefaultFollowUpSequences } from './utils/communication';
import { Navbar } from './components/Navbar';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceEditor } from './components/InvoiceEditor';
import { CloudSyncModal } from './components/CloudSyncModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';

export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const stored = getStoredInvoices();
      return deduplicateInvoices(stored);
    } catch {
      return [];
    }
  });
  const [activeInvoice, setActiveInvoice] = useState<Invoice>(() => {
    try {
      const stored = getStoredInvoices();
      return stored[0] ? sanitizeInvoice(stored[0]) : createDefaultInvoice(0);
    } catch {
      return createDefaultInvoice(0);
    }
  });
  const [currentView, setCurrentView] = useState<'list' | 'editor'>('list');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('invoicecraft_theme') : null;
      if (saved) return saved === 'dark';
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    } catch {
      return false;
    }
  });
  
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && 'onLine' in navigator ? navigator.onLine : true;
  });
  const [hasUnsynced, setHasUnsynced] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<SyncAuditLog[]>(() => {
    try {
      return getStoredAuditLogs();
    } catch {
      return [];
    }
  });
  const [reminders, setReminders] = useState<ScheduledReminder[]>(() => {
    try {
      return computeScheduledReminders(invoices);
    } catch {
      return [];
    }
  });
  const [dismissedReminderIds, setDismissedReminderIds] = useState<string[]>([]);

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync dark mode class on document
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('invoicecraft_theme', 'dark');
        }
      } else {
        document.documentElement.classList.remove('dark');
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('invoicecraft_theme', 'light');
        }
      }
    } catch (e) {
      console.warn('Could not persist theme:', e);
    }
  }, [isDarkMode]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync once connection restored
      triggerCloudSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [invoices]);

  // Re-calculate reminders when invoices change
  useEffect(() => {
    const computed = computeScheduledReminders(invoices);
    setReminders(computed.filter((r) => !dismissedReminderIds.includes(r.id)));
  }, [invoices, dismissedReminderIds]);

  // Handlers
  const handleSelectInvoice = (inv: Invoice) => {
    setActiveInvoice(sanitizeInvoice(inv));
    setCurrentView('editor');
  };

  const handleNewInvoice = () => {
    const fresh = createDefaultInvoice(invoices.length);
    setActiveInvoice(fresh);
    setCurrentView('editor');
  };

  const handleDuplicateInvoice = (target: Invoice) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const nextNum = `INV-2026-${randomSuffix}`;
    const clone: Invoice = {
      ...target,
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      invoiceNumber: nextNum,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      items: (target.items || []).map((it, idx) => ({
        ...it,
        id: 'item-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).slice(2, 6),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedToCloud: false,
    };

    const updated = deduplicateInvoices([clone, ...invoices]);
    setInvoices(updated);
    saveInvoices(updated);
    addAuditLog({
      action: 'create',
      invoiceNumber: clone.invoiceNumber,
      status: isOnline ? 'synced' : 'offline_saved',
    });
    setAuditLogs(getStoredAuditLogs());
    setActiveInvoice(clone);
    setCurrentView('editor');
  };

  const handleCleanDuplicates = () => {
    const cleaned = deduplicateInvoices(invoices);
    setInvoices(cleaned);
    saveInvoices(cleaned);
    if (!cleaned.some((i) => i.id === activeInvoice.id)) {
      setActiveInvoice(cleaned[0] || createDefaultInvoice(0));
    }
    addAuditLog({
      action: 'sync',
      invoiceNumber: 'DEDUP_CLEAN',
      status: 'synced',
    });
    setAuditLogs(getStoredAuditLogs());
  };

  const handleResetToStandard = () => {
    const samples = resetStorageToSamples();
    setInvoices(samples);
    setActiveInvoice(samples[0] || createDefaultInvoice(0));
    addAuditLog({
      action: 'sync',
      invoiceNumber: 'RESET_SAMPLES_PKR',
      status: 'synced',
    });
    setAuditLogs(getStoredAuditLogs());
  };

  const handleDeleteInvoice = (id: string) => {
    const toDelete = invoices.find((i) => i.id === id);
    const updated = invoices.filter((i) => i.id !== id);
    const cleanUpdated = deduplicateInvoices(updated);
    setInvoices(cleanUpdated);
    saveInvoices(cleanUpdated);
    if (toDelete) {
      addAuditLog({
        action: 'delete',
        invoiceNumber: toDelete.invoiceNumber,
        status: isOnline ? 'synced' : 'offline_saved',
      });
      setAuditLogs(getStoredAuditLogs());
    }

    if (activeInvoice.id === id) {
      setActiveInvoice(cleanUpdated[0] || createDefaultInvoice());
    }
  };

  const handleUpdateStatus = (id: string, newStatus: InvoiceStatus) => {
    const updated = invoices.map((inv) =>
      inv.id === id ? { ...inv, status: newStatus, updatedAt: new Date().toISOString(), syncedToCloud: false } : inv
    );
    const cleanUpdated = deduplicateInvoices(updated);
    setInvoices(cleanUpdated);
    saveInvoices(cleanUpdated);
    setHasUnsynced(true);

    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      addAuditLog({
        action: 'update',
        invoiceNumber: inv.invoiceNumber,
        status: isOnline ? 'synced' : 'offline_saved',
      });
      setAuditLogs(getStoredAuditLogs());
    }

    if (activeInvoice.id === id) {
      setActiveInvoice({ ...activeInvoice, status: newStatus });
    }
  };

  const handleUpdateActiveInvoice = (updated: Invoice) => {
    setActiveInvoice(updated);
    setHasUnsynced(true);
  };

  const handleSaveActiveInvoice = () => {
    setIsSaving(true);
    const invoiceToSave: Invoice = {
      ...activeInvoice,
      updatedAt: new Date().toISOString(),
      syncedToCloud: isOnline,
    };

    // Match by ID OR invoiceNumber to strictly prevent duplicate entries
    const existingIndex = invoices.findIndex(
      (i) =>
        i.id === invoiceToSave.id ||
        (i.invoiceNumber && invoiceToSave.invoiceNumber && i.invoiceNumber.trim().toUpperCase() === invoiceToSave.invoiceNumber.trim().toUpperCase())
    );

    let updatedInvoices: Invoice[];
    if (existingIndex >= 0) {
      updatedInvoices = [...invoices];
      updatedInvoices[existingIndex] = invoiceToSave;
    } else {
      updatedInvoices = [invoiceToSave, ...invoices];
    }

    const deduped = deduplicateInvoices(updatedInvoices);
    setInvoices(deduped);
    saveInvoices(deduped);
    saveSenderProfile(invoiceToSave.sender);

    addAuditLog({
      action: existingIndex >= 0 ? 'update' : 'create',
      invoiceNumber: invoiceToSave.invoiceNumber,
      status: isOnline ? 'synced' : 'offline_saved',
    });
    setAuditLogs(getStoredAuditLogs());
    setHasUnsynced(!isOnline);

    setTimeout(() => {
      setIsSaving(false);
    }, 400);
  };

  const triggerCloudSync = async () => {
    // Simulated cloud sync with audit log and state update
    await new Promise((resolve) => setTimeout(resolve, 800));
    const synced = invoices.map((i) => ({ ...i, syncedToCloud: true }));
    setInvoices(synced);
    saveInvoices(synced);
    setHasUnsynced(false);

    addAuditLog({
      action: 'sync',
      invoiceNumber: 'ALL_BATCH',
      status: 'synced',
    });
    setAuditLogs(getStoredAuditLogs());
  };

  const handleImportInvoices = (imported: Invoice[]) => {
    setInvoices(imported);
    saveInvoices(imported);
    if (imported[0]) {
      setActiveInvoice(imported[0]);
    }
    addAuditLog({
      action: 'sync',
      invoiceNumber: `IMPORT_${imported.length}`,
      status: 'synced',
    });
    setAuditLogs(getStoredAuditLogs());
  };

  const handleDismissReminder = (id: string) => {
    setDismissedReminderIds((prev) => [...prev, id]);
  };

  const handleClearAllReminders = () => {
    setDismissedReminderIds(reminders.map((r) => r.id));
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      
      {/* Top Navbar (active in List view) */}
      {currentView === 'list' && (
        <Navbar
          currentView={currentView}
          onNavigate={setCurrentView}
          onNewInvoice={handleNewInvoice}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isOnline={isOnline}
          hasUnsynced={hasUnsynced}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationsCount={reminders.length}
          invoicesCount={invoices.length}
        />
      )}

      {/* Main View Router */}
      <main className="transition-all">
        {currentView === 'list' ? (
          <InvoiceList
            invoices={invoices}
            onSelectInvoice={handleSelectInvoice}
            onNewInvoice={handleNewInvoice}
            onDuplicateInvoice={handleDuplicateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onUpdateStatus={handleUpdateStatus}
            onCleanDuplicates={handleCleanDuplicates}
            onResetToStandard={handleResetToStandard}
          />
        ) : (
          <InvoiceEditor
            invoice={activeInvoice}
            onUpdateInvoice={handleUpdateActiveInvoice}
            onSave={handleSaveActiveInvoice}
            onDuplicate={handleDuplicateInvoice}
            isSaving={isSaving}
            onNavigateToHistory={() => setCurrentView('list')}
            invoicesCount={invoices.length}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        )}
      </main>

      {/* Modals */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        isOnline={isOnline}
        hasUnsynced={hasUnsynced}
        onTriggerSync={triggerCloudSync}
        auditLogs={auditLogs}
        invoices={invoices}
        onImportInvoices={handleImportInvoices}
      />

      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        reminders={reminders}
        onDismissReminder={handleDismissReminder}
        onClearAll={handleClearAllReminders}
      />

    </div>
  );
}
