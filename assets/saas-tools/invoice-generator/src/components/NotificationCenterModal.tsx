import React, { useState, useEffect } from 'react';
import { ScheduledReminder } from '../types/invoice';
import { 
  X, 
  Bell, 
  BellRing, 
  Calendar, 
  AlertTriangle, 
  Repeat, 
  CheckCheck, 
  Sparkles,
  Check
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: ScheduledReminder[];
  onDismissReminder: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onDismissReminder,
  onClearAll,
}) => {
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  if (!isOpen) return null;

  const handleRequestPushPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setPermissionState(res);
      if (res === 'granted') {
        new Notification('OrionFx Invoice SaaS Alerts Enabled', {
          body: 'You will receive reminders for upcoming invoice due dates and recurring cycles.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const handleSendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Invoice Deadline Reminder', {
        body: 'Invoice #INV-2026-104 is due in 3 days. Send a friendly heads-up on WhatsApp!',
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      handleRequestPushPermission();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Reminders &amp; Push Notifications
              </h3>
              <p className="text-xs text-neutral-500">
                Deadline alerts, meeting reminders, and recurring billing cycles
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

        {/* Push Notification Permission Box */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
              Browser Push Notifications
            </span>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Status: <strong className="uppercase">{permissionState}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {permissionState !== 'granted' ? (
              <button
                onClick={handleRequestPushPermission}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-xs"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Enable Push</span>
              </button>
            ) : (
              <button
                onClick={handleSendTestNotification}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200"
              >
                {testSent ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bell className="w-3.5 h-3.5" />}
                <span>{testSent ? 'Sent!' : 'Test Notification'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Reminders List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Active Deadlines &amp; Scheduled Events ({reminders.length})
            </span>
            {reminders.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {reminders.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs italic bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                No active deadlines or overdue alerts right now. You are all caught up!
              </div>
            ) : (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                    rem.type === 'overdue'
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : rem.type === 'due_soon'
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                      : 'bg-fuchsia-50/70 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-900/60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {rem.type === 'overdue' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : rem.type === 'due_soon' ? (
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <Repeat className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                        {rem.clientName} (#{rem.invoiceNumber})
                      </span>
                      <p className="text-neutral-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
                        {rem.message}
                      </p>
                      <span className="text-[11px] text-neutral-400 font-mono mt-1 block">
                        Target Date: {rem.dueDate}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDismissReminder(rem.id)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 shrink-0"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
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
