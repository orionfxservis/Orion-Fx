import React, { useState } from 'react';
import { ReceiptData } from '../types';
import { generateStandaloneHtml } from '../utils/exportUtils';
import { Code, Copy, Check, Download, ExternalLink, X, FileCode, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData;
}

export const StandaloneExportModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const standaloneHtml = generateStandaloneHtml(data);

  const handleCopy = () => {
    navigator.clipboard.writeText(standaloneHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([standaloneHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-app-${data.receiptNumber.toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Export Standalone HTML (Vanilla JS & CDN - Zero NPM)
              </h3>
              <p className="text-xs text-slate-500">
                Ready to deploy directly into your <span className="font-semibold text-indigo-600">OrionFx.net / SaaS Applications</span> section.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description Banner */}
        <div className="p-4 bg-indigo-50/70 border-b border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-0.5">No npm install required & No GitHub Actions complications!</p>
            <p className="text-indigo-800 leading-relaxed">
              This single-file solution embeds Vanilla JavaScript with CDN-hosted HTML5 Canvas and CSS PDF generation. Simply upload it as <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono text-[11px]">index.html</code> inside your OrionFx.net hosting or iframe it directly into any webpage.
            </p>
          </div>
        </div>

        {/* Code Preview */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
            <span>standalone-receipt-generator.html</span>
            <span>~{Math.round(standaloneHtml.length / 1024)} KB</span>
          </div>

          <pre className="flex-1 bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-auto border border-slate-800 selection:bg-indigo-500 selection:text-white">
            <code>{standaloneHtml}</code>
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Works offline & client-side in all modern mobile and desktop browsers.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied HTML!' : 'Copy Code'}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition shadow-md shadow-indigo-600/30"
            >
              <Download className="w-4 h-4" />
              Download .html File
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
