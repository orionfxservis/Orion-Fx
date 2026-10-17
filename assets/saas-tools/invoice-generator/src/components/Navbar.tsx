import React from 'react';
import { 
  FileText, 
  Plus, 
  Moon, 
  Sun, 
  Wifi, 
  WifiOff, 
  Bell, 
  CloudCheck, 
  FolderSync 
} from 'lucide-react';

interface NavbarProps {
  currentView: 'list' | 'editor';
  onNavigate: (view: 'list' | 'editor') => void;
  onNewInvoice: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isOnline: boolean;
  hasUnsynced: boolean;
  onOpenSyncModal: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  invoicesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onNewInvoice,
  isDarkMode,
  onToggleDarkMode,
  isOnline,
  hasUnsynced,
  onOpenSyncModal,
  onOpenNotifications,
  unreadNotificationsCount,
  invoicesCount,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('list')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs shadow-sm transition-transform group-hover:scale-105">
                OFX
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight leading-tight whitespace-nowrap">
                  OrionFx Invoice SaaS
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                  Standalone Client-Side POS &amp; Invoicing Platform
                </p>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onNavigate('list')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'list'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              All Invoices
              <span className="ml-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                ({invoicesCount})
              </span>
            </button>

            <button
              onClick={() => onNavigate('editor')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentView === 'editor'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Invoice Editor
            </button>
          </nav>

          {/* Zone 3: Actions & Status Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Sync / Offline Status Trigger */}
            <button
              onClick={onOpenSyncModal}
              title={isOnline ? (hasUnsynced ? 'Changes pending cloud sync' : 'Offline-ready & Synced') : 'Offline Mode Active'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isOnline ? (
                hasUnsynced ? (
                  <FolderSync className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                ) : (
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
                )
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className="hidden md:inline">
                {isOnline ? (hasUnsynced ? 'Sync Pending' : 'Cloud Synced') : 'Offline'}
              </span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              title="Reminders & Notifications"
              className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button: New Invoice */}
            <button
              onClick={onNewInvoice}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
