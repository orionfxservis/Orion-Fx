import React from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Code, 
  RefreshCw, 
  Eye, 
  Edit3, 
  Sparkles,
  Layers
} from 'lucide-react';

interface HeaderProps {
  receiptNumber: string;
  activeMobileTab: 'editor' | 'preview';
  setActiveMobileTab: (tab: 'editor' | 'preview') => void;
  onPrint: () => void;
  onExportPdf: () => void;
  onExportJpg: () => void;
  onExportHtml: () => void;
  onLoadSample: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  receiptNumber,
  activeMobileTab,
  setActiveMobileTab,
  onPrint,
  onExportPdf,
  onExportJpg,
  onExportHtml,
  onLoadSample,
  isExporting,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Section Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-inner flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white truncate">
                  OrionFx<span className="text-blue-400">.net</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                  <Layers className="w-3 h-3" />
                  SaaS Applications
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                <span>Receipt & Automated Invoice Generator</span>
                <span className="hidden md:inline text-slate-600">•</span>
                <span className="hidden md:inline text-slate-300 font-mono text-[11px] bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                  {receiptNumber}
                </span>
              </p>
            </div>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              id="mobile-tab-edit"
              onClick={() => setActiveMobileTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeMobileTab === 'editor' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              id="mobile-tab-preview"
              onClick={() => setActiveMobileTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeMobileTab === 'preview' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Quick Sample Button */}
            <button
              id="btn-load-sample"
              onClick={onLoadSample}
              title="Load full sample receipt"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sample</span>
            </button>

            {/* Standalone Code for OrionFx.net upload */}
            <button
              id="btn-export-html"
              onClick={onExportHtml}
              title="Export Standalone HTML (Vanilla JS/CDN - No npm needed)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 transition"
            >
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Embed HTML</span>
            </button>

            {/* Print Button */}
            <button
              id="btn-print"
              onClick={onPrint}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* JPG Export */}
            <button
              id="btn-export-jpg"
              onClick={onExportJpg}
              disabled={isExporting}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 transition disabled:opacity-50"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>JPG</span>
            </button>

            {/* PDF Export Button (Primary CTA) */}
            <button
              id="btn-export-pdf"
              onClick={onExportPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
