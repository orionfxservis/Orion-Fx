import React, { useState, useEffect } from 'react';
import { ReceiptData } from './types';
import { INITIAL_RECEIPT_DATA } from './data/initialData';
import { Header } from './components/Header';
import { ReceiptEditor } from './components/ReceiptEditor';
import { ReceiptDocument } from './components/ReceiptPreview/ReceiptDocument';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { exportReceiptAsPdf, exportReceiptAsJpg, triggerPrint } from './utils/exportUtils';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Printer, 
  Download, 
  Image as ImageIcon, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  Eye, 
  Edit, 
  Layers
} from 'lucide-react';

const STORAGE_KEY = 'orionfx_receipt_data_v1';

export default function App() {
  const [data, setData] = useState<ReceiptData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return INITIAL_RECEIPT_DATA;
  });

  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview'>('editor');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showStandaloneModal, setShowStandaloneModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handlePrint = () => {
    // If on mobile editor tab, switch to preview first
    if (activeMobileTab !== 'preview' && window.innerWidth < 1024) {
      setActiveMobileTab('preview');
      setTimeout(() => triggerPrint(), 300);
    } else {
      triggerPrint();
    }
    showToast('Print dialog opened.');
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    // If mobile editor, switch to preview
    if (activeMobileTab !== 'preview' && window.innerWidth < 1024) {
      setActiveMobileTab('preview');
      await new Promise(r => setTimeout(r, 200));
    }
    const isThermal = data.styling.template === 'thermal';
    const success = await exportReceiptAsPdf(`Receipt-${data.receiptNumber}`, isThermal);
    setIsExporting(false);
    if (success) {
      showToast('PDF downloaded successfully!');
    }
  };

  const handleExportJpg = async () => {
    setIsExporting(true);
    if (activeMobileTab !== 'preview' && window.innerWidth < 1024) {
      setActiveMobileTab('preview');
      await new Promise(r => setTimeout(r, 200));
    }
    const success = await exportReceiptAsJpg(`Receipt-${data.receiptNumber}`);
    setIsExporting(false);
    if (success) {
      showToast('High-resolution JPG image exported!');
    }
  };

  const handleLoadSample = () => {
    if (confirm('Load sample OrionFx SaaS Receipt data? This will overwrite unsaved changes.')) {
      setData(INITIAL_RECEIPT_DATA);
      showToast('Sample receipt loaded.');
    }
  };

  const handleResetBlank = () => {
    if (confirm('Clear form to start a completely blank receipt?')) {
      setData({
        ...INITIAL_RECEIPT_DATA,
        receiptNumber: `OFX-${Date.now().toString().slice(-4)}`,
        items: [
          { id: `item_${Date.now()}`, description: '', details: '', quantity: 1, unitPrice: 0 }
        ],
        paidAmount: 0,
        notes: '',
      });
      showToast('Blank receipt initialized.');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-100 ${data.styling.template === 'thermal' ? 'receipt-thermal-mode' : ''}`}>
      
      {/* Top Application Header */}
      <Header
        receiptNumber={data.receiptNumber}
        activeMobileTab={activeMobileTab}
        setActiveMobileTab={setActiveMobileTab}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
        onExportJpg={handleExportJpg}
        onExportHtml={() => setShowStandaloneModal(true)}
        onLoadSample={handleLoadSample}
        isExporting={isExporting}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Column: Form Editor Controls */}
        <div 
          className={`w-full lg:w-[48%] xl:w-[45%] flex-shrink-0 no-print ${
            activeMobileTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="bg-slate-50/70 p-1 sm:p-2 rounded-2xl">
            <ReceiptEditor
              data={data}
              onChange={setData}
            />
          </div>
        </div>

        {/* Right Column: Live Document Preview & Actions */}
        <div 
          className={`w-full lg:w-[52%] xl:w-[55%] flex flex-col items-center sticky top-20 ${
            activeMobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Preview Controls Bar */}
          <div className="w-full max-w-[820px] mb-3 px-2 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Live Document Preview
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                ({data.styling.template.toUpperCase()} • {data.styling.template === 'thermal' ? '80mm Roll' : 'A4 Size'})
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.1))}
                title="Zoom Out"
                className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-600 px-1 font-semibold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                title="Zoom In"
                className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                title="Reset Zoom"
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Document Canvas Container */}
          <div 
            id="receipt-document-container"
            className="w-full overflow-x-auto flex justify-center pb-12 transition-transform duration-200"
            style={{
              transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined,
              transformOrigin: 'top center',
            }}
          >
            <ReceiptDocument data={data} />
          </div>

        </div>

      </main>

      {/* Floating Mobile Quick Action Bar */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30 bg-slate-900 text-white rounded-2xl p-2.5 shadow-2xl border border-slate-800 flex items-center justify-between no-print">
        <div className="flex items-center gap-1.5 pl-1">
          <button
            type="button"
            onClick={() => setActiveMobileTab(activeMobileTab === 'editor' ? 'preview' : 'editor')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            {activeMobileTab === 'editor' ? (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>View Preview</span>
              </>
            ) : (
              <>
                <Edit className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit Form</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleExportJpg}
            className="p-2 rounded-xl bg-slate-800 text-emerald-400 hover:text-emerald-300"
            title="Download JPG"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Standalone HTML Export Modal for direct OrionFx.net upload */}
      <StandaloneExportModal
        isOpen={showStandaloneModal}
        onClose={() => setShowStandaloneModal(false)}
        data={data}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
