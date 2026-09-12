import React, { useRef } from 'react';
import { CompanyInfo } from '../../types';
import { 
  Building2, 
  Upload, 
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Sliders, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Hash 
} from 'lucide-react';

interface Props {
  company: CompanyInfo;
  onChange: (company: CompanyInfo) => void;
}

export const CompanyBrandingSection: React.FC<Props> = ({ company, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (field: keyof CompanyInfo, value: any) => {
    onChange({
      ...company,
      [field]: value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, or WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange({
          ...company,
          logoUrl: event.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onChange({
      ...company,
      logoUrl: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Company Name & Tagline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Company / Business Name *
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-company-name"
              type="text"
              value={company.name}
              onChange={(e) => handleTextChange('name', e.target.value)}
              placeholder="e.g. OrionFx Technologies"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-semibold text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Business Tagline / Industry
          </label>
          <input
            id="input-company-tagline"
            type="text"
            value={company.tagline}
            onChange={(e) => handleTextChange('tagline', e.target.value)}
            placeholder="e.g. SaaS Solutions & Billing"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-700"
          />
        </div>
      </div>

      {/* Logo & Adjustable Template Area */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            Adjustable Logo & Placement
          </span>
          {company.logoUrl && (
            <button
              id="btn-remove-logo"
              type="button"
              onClick={handleRemoveLogo}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Logo
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Logo Preview or Upload Box */}
          <div className="relative group">
            {company.logoUrl ? (
              <div 
                className="bg-white p-2 border-2 border-dashed border-blue-300 rounded-lg shadow-sm flex items-center justify-center overflow-hidden"
                style={{ width: '130px', height: '80px' }}
              >
                <img
                  src={company.logoUrl}
                  alt="Company Logo"
                  className="max-w-full max-h-full object-contain"
                  style={{ borderRadius: `${company.logoBorderRadius}px` }}
                />
              </div>
            ) : (
              <button
                id="btn-upload-logo-box"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-2 text-center hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer bg-white"
              >
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-600">Upload Logo</span>
                <span className="text-[9px] text-slate-400">PNG, JPG, SVG</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Alignment and Size adjustments */}
          <div className="flex-1 w-full space-y-2.5">
            {/* Quick change file button if logo exists */}
            {company.logoUrl && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-blue-600 hover:underline inline-block mb-1"
              >
                Choose another file...
              </button>
            )}

            {/* Logo Alignment Control */}
            <div>
              <span className="text-[11px] font-medium text-slate-600 block mb-1">
                Header Logo Alignment:
              </span>
              <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => handleTextChange('logoAlignment', 'left')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition ${
                    company.logoAlignment === 'left' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlignLeft className="w-3 h-3" /> Left
                </button>
                <button
                  type="button"
                  onClick={() => handleTextChange('logoAlignment', 'center')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition ${
                    company.logoAlignment === 'center' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlignCenter className="w-3 h-3" /> Center
                </button>
                <button
                  type="button"
                  onClick={() => handleTextChange('logoAlignment', 'right')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition ${
                    company.logoAlignment === 'right' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlignRight className="w-3 h-3" /> Right
                </button>
              </div>
            </div>

            {/* Logo Width Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Display Width:</span>
                <span className="font-mono text-slate-900">{company.logoWidth}px</span>
              </div>
              <input
                id="slider-logo-width"
                type="range"
                min="50"
                max="220"
                step="5"
                value={company.logoWidth}
                onChange={(e) => handleTextChange('logoWidth', Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address & Contact Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Street Address
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={company.address}
              onChange={(e) => handleTextChange('address', e.target.value)}
              placeholder="123 Business Way, Suite 400"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            City, State, Zip & Country
          </label>
          <input
            type="text"
            value={company.cityStateZip}
            onChange={(e) => handleTextChange('cityStateZip', e.target.value)}
            placeholder="San Francisco, CA 94105, USA"
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="email"
              value={company.email}
              onChange={(e) => handleTextChange('email', e.target.value)}
              placeholder="billing@company.com"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Phone / Hotline
          </label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={company.phone}
              onChange={(e) => handleTextChange('phone', e.target.value)}
              placeholder="+1 (800) 555-0199"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Website URL
          </label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={company.website}
              onChange={(e) => handleTextChange('website', e.target.value)}
              placeholder="https://orionfx.net"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tax ID / VAT / GSTIN / Reg #
          </label>
          <div className="relative">
            <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={company.taxId}
              onChange={(e) => handleTextChange('taxId', e.target.value)}
              placeholder="e.g. US-EIN-94-3829104"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            NTN (Pakistan National Tax No.)
          </label>
          <div className="relative">
            <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={company.ntn || ''}
              onChange={(e) => handleTextChange('ntn', e.target.value)}
              placeholder="e.g. 7412985-3"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            STRN (Sales Tax Registration #)
          </label>
          <div className="relative">
            <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={company.strn || ''}
              onChange={(e) => handleTextChange('strn', e.target.value)}
              placeholder="e.g. 17-00-7412-985-19"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            POS Machine / Counter ID
          </label>
          <div className="relative">
            <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={company.posTerminalId || ''}
              onChange={(e) => handleTextChange('posTerminalId', e.target.value)}
              placeholder="e.g. POS-01 / Counter 1"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
