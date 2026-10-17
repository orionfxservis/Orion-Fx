import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('InvoiceCraft Uncaught Exception:', error, errorInfo);
  }

  private handleResetStorage = () => {
    try {
      localStorage.removeItem('invoicecraft_invoices_v1');
      localStorage.removeItem('invoicecraft_sync_audit_v1');
      localStorage.removeItem('invoicecraft_saved_profile_v1');
      localStorage.removeItem('invoicecraft_theme');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Application Recovery
            </h2>
            <p className="text-xs text-neutral-500">
              An issue occurred while rendering. Click below to reload or clean stored invoice duplicates.
            </p>
            {this.state.error && (
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-left font-mono text-[11px] text-neutral-700 dark:text-neutral-300 max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Clean &amp; Reset Storage</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
