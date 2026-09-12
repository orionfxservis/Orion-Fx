import React, { useState } from 'react';
import { SignatureDetails } from '../../types';
import { TERMS_PRESETS } from '../../data/initialData';
import { 
  FileText, 
  PenTool, 
  Stamp, 
  Trash2, 
  Sparkles, 
  Calendar, 
  Award,
  Type
} from 'lucide-react';
import { SignaturePadModal } from '../SignaturePadModal';

interface Props {
  terms: string;
  notes: string;
  signature: SignatureDetails;
  onUpdateTerms: (terms: string) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateSignature: (sig: SignatureDetails) => void;
}

export const TermsAndSignatureSection: React.FC<Props> = ({
  terms,
  notes,
  signature,
  onUpdateTerms,
  onUpdateNotes,
  onUpdateSignature,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSigField = (field: keyof SignatureDetails, value: any) => {
    onUpdateSignature({
      ...signature,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Terms & Conditions Section */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Terms & Conditions / Policies
          </label>
          {/* Quick Presets */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
            {TERMS_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onUpdateTerms(preset.text)}
                title={preset.title}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded transition"
              >
                {preset.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <textarea
          id="textarea-terms"
          rows={3}
          value={terms}
          onChange={(e) => onUpdateTerms(e.target.value)}
          placeholder="Specify payment deadlines, refund policies, warranties, or service terms..."
          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed text-slate-800"
        />
      </div>

      {/* Customer Notes / Special Message */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Customer Note / Thank You Message
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="e.g. Thank you for your business! We look forward to working together."
          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
        />
      </div>

      {/* Authorized Signature & Stamps */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-blue-600" />
            Signature & Verification Stamp
          </span>

          <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={signature.showStamp}
              onChange={(e) => handleSigField('showStamp', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <Stamp className="w-3.5 h-3.5 text-blue-600" />
            Show "PAID" Official Stamp
          </label>
        </div>

        {/* Signature Type Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-600">Signature Style:</span>
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleSigField('type', 'typed')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition ${
                signature.type === 'typed' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type className="w-3 h-3" /> Script Font
            </button>
            <button
              type="button"
              onClick={() => {
                handleSigField('type', 'drawn');
                if (!signature.dataUrl) setIsModalOpen(true);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition ${
                signature.type === 'drawn' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3 h-3" /> Draw Signature
            </button>
            <button
              type="button"
              onClick={() => handleSigField('type', 'none')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition ${
                signature.type === 'none' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              None
            </button>
          </div>
        </div>

        {/* If Drawn Signature is selected */}
        {signature.type === 'drawn' && (
          <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-3">
            {signature.dataUrl ? (
              <div className="h-14 w-44 bg-slate-50 border border-slate-200 rounded flex items-center justify-center p-1">
                <img src={signature.dataUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">No signature drawn yet</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-semibold transition"
              >
                {signature.dataUrl ? 'Redraw' : 'Open Signature Pad'}
              </button>
              {signature.dataUrl && (
                <button
                  type="button"
                  onClick={() => handleSigField('dataUrl', '')}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Signer Name & Title */}
        {signature.type !== 'none' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                Signer Full Name
              </label>
              <input
                type="text"
                value={signature.signerName}
                onChange={(e) => handleSigField('signerName', e.target.value)}
                placeholder="e.g. Alexander Vance"
                className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                Signer Title / Designation
              </label>
              <input
                type="text"
                value={signature.signerTitle}
                onChange={(e) => handleSigField('signerTitle', e.target.value)}
                placeholder="e.g. Chief Financial Officer"
                className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                Sign Date
              </label>
              <input
                type="date"
                value={signature.signDate || ''}
                onChange={(e) => handleSigField('signDate', e.target.value)}
                className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Signature Pad Modal */}
      <SignaturePadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(url) => {
          handleSigField('dataUrl', url);
          handleSigField('type', 'drawn');
        }}
        initialSignature={signature.dataUrl}
      />
    </div>
  );
};
