import { useState } from 'react';
import { Paintbrush, Check, Sliders, Sparkles, Palette, Zap } from 'lucide-react';
import { ThemeId, ThemeConfig } from '../types';

interface ThemeSelectorProps {
  activeTheme: ThemeConfig;
  onSelectTheme: (themeId: ThemeId) => void;
  themeConfigs: { [key in ThemeId]?: ThemeConfig };
  onUpdateCustomTheme?: (customTheme: ThemeConfig) => void;
}

const CUSTOM_COLOR_PRESETS = [
  { name: 'Neon Lime', hex: '#84cc16', accentName: 'lime', bgTint: '#031402' },
  { name: 'Hyper Violet', hex: '#a855f7', accentName: 'purple', bgTint: '#120324' },
  { name: 'Laser Cyan', hex: '#06b6d4', accentName: 'cyan', bgTint: '#02131a' },
  { name: 'Sunset Coral', hex: '#f97316', accentName: 'amber', bgTint: '#1c0a02' },
  { name: 'Hot Pink', hex: '#ec4899', accentName: 'pink', bgTint: '#1f0312' },
  { name: 'Pure Gold', hex: '#eab308', accentName: 'amber', bgTint: '#171101' },
  { name: 'Electric Blue', hex: '#3b82f6', accentName: 'blue', bgTint: '#030c24' },
  { name: 'Mint Jade', hex: '#10b981', accentName: 'emerald', bgTint: '#021710' },
];

export default function ThemeSelector({
  activeTheme,
  onSelectTheme,
  themeConfigs,
  onUpdateCustomTheme,
}: ThemeSelectorProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customName, setCustomName] = useState('My Custom Theme');
  const [selectedColorHex, setSelectedColorHex] = useState(activeTheme.customAccentHex || '#10b981');
  const [selectedSliderAccent, setSelectedSliderAccent] = useState(activeTheme.sliderAccentColor || 'emerald');

  const handleApplyCustomColor = (colorObj: typeof CUSTOM_COLOR_PRESETS[0]) => {
    setSelectedColorHex(colorObj.hex);
    setSelectedSliderAccent(colorObj.accentName);
    
    if (onUpdateCustomTheme) {
      const newCustom: ThemeConfig = {
        id: 'custom',
        name: customName || 'My Custom Theme',
        bgClass: `bg-[${colorObj.bgTint}] text-gray-100`,
        cardClass: 'glass-panel shadow-2xl duration-300',
        accentClass: `bg-[${colorObj.hex}]/10 border-[${colorObj.hex}]/25`,
        textClass: 'text-white',
        mutedTextClass: 'text-zinc-400',
        borderClass: 'border-white/[0.08]',
        primaryButtonClass: `bg-[${colorObj.hex}] shadow-md text-black font-semibold`,
        sliderAccentColor: colorObj.accentName,
        customAccentHex: colorObj.hex,
        customBgHex: colorObj.bgTint,
      };
      onUpdateCustomTheme(newCustom);
      onSelectTheme('custom');
    }
  };

  const handleCustomHexChange = (hex: string) => {
    setSelectedColorHex(hex);
    if (onUpdateCustomTheme) {
      const newCustom: ThemeConfig = {
        id: 'custom',
        name: customName || 'My Custom Theme',
        bgClass: 'bg-[#030611] text-gray-100',
        cardClass: 'glass-panel shadow-2xl duration-300',
        accentClass: `bg-white/5 border-white/10`,
        textClass: 'text-white',
        mutedTextClass: 'text-zinc-400',
        borderClass: 'border-white/[0.08]',
        primaryButtonClass: 'bg-white text-black font-semibold',
        sliderAccentColor: selectedSliderAccent,
        customAccentHex: hex,
      };
      onUpdateCustomTheme(newCustom);
      onSelectTheme('custom');
    }
  };

  return (
    <div id="theme-selector-container" className="p-4 sm:p-6 rounded-2xl border border-pink-500/25 bg-gradient-to-b from-[#26051c]/95 via-[#1a0213]/95 to-[#080006]/95 shadow-xl shadow-pink-950/25 flex flex-col gap-4 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute right-0 top-0 w-36 h-36 bg-pink-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Stage Header - Compact, small font for mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider bg-pink-500/15 text-pink-300 border border-pink-500/25 shrink-0">
            STAGE 05
          </span>
          <div>
            <h2 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
              <Paintbrush className="w-4 h-4 text-pink-400 shrink-0" />
              Custom Workspace Theme Studio
            </h2>
            <p className="text-[11px] sm:text-xs text-pink-200/60 mt-0.5">
              Select luxury workspace skins or create a personal mobile color scheme.
            </p>
          </div>
        </div>

        {/* Tab switchers on mobile */}
        <div className="flex items-center gap-1 self-start sm:self-center bg-black/40 p-0.5 rounded-lg border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all text-xs ${
              activeTab === 'presets' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-xs' : 'text-white/50 hover:text-white'
            }`}
          >
            Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all text-xs flex items-center gap-1 ${
              activeTab === 'custom' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-xs' : 'text-white/50 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-pink-400" />
            Customizer
          </button>
        </div>
      </div>

      {activeTab === 'presets' ? (
        /* Preset Theme Cards Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {(Object.keys(themeConfigs) as ThemeId[]).map((tId) => {
            const cfg = themeConfigs[tId];
            if (!cfg) return null;
            const isSelected = activeTheme.id === tId;

            // Define thematic swatch colors
            const swatchPrimary =
              tId === 'obsidian' ? '#10b981' :
              tId === 'cyberpunk' ? '#ec4899' :
              tId === 'midnight-gold' ? '#fbbf24' :
              tId === 'vaporwave' ? '#8b5cf6' :
              tId === 'crimson' ? '#ef4444' :
              tId === 'arctic-azure' ? '#06b6d4' :
              tId === 'solar-sunset' ? '#f97316' :
              selectedColorHex;

            return (
              <button
                key={tId}
                onClick={() => onSelectTheme(tId)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 relative ${
                  isSelected
                    ? 'bg-pink-500/15 border-pink-400/50 shadow-md shadow-pink-950/40 ring-1 ring-pink-500/30 scale-[1.02]'
                    : 'bg-black/40 border-white/5 hover:border-white/15 hover:bg-black/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white truncate pr-1">{cfg.name}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-black font-extrabold stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Theme Mini Color Preview Swatches */}
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: swatchPrimary }} />
                  <span className="w-3 h-3 rounded-full bg-neutral-900 border border-white/10 shrink-0" />
                  <span className="w-3 h-3 rounded-full bg-neutral-800 shrink-0" />
                  <span className="text-[9px] font-mono text-white/40 ml-auto uppercase">{tId.replace('-', ' ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Interactive Custom Theme Creator */
        <div className="flex flex-col gap-3.5 bg-black/40 p-3.5 sm:p-4 rounded-xl border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-pink-400" />
                Pick Workspace Primary Accent Color
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">
                Tap any preset color or enter a custom hex color code below.
              </p>
            </div>
            
            {/* Custom Hex input */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedColorHex}
                onChange={(e) => handleCustomHexChange(e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                title="Choose custom color"
              />
              <span className="text-xs font-mono text-pink-300 bg-pink-500/10 px-2 py-1 rounded border border-pink-500/20">
                {selectedColorHex}
              </span>
            </div>
          </div>

          {/* Quick Palette Chips */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {CUSTOM_COLOR_PRESETS.map((preset) => {
              const isCurrent = selectedColorHex.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.name}
                  onClick={() => handleApplyCustomColor(preset)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-pink-400 bg-pink-500/20 scale-105 shadow-md'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  title={preset.name}
                >
                  <span className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: preset.hex }} />
                  <span className="text-[9px] font-semibold text-white/80 truncate w-full text-center">{preset.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[11px] text-white/50">
              Active Mode: <strong className="text-pink-300">{activeTheme.name}</strong>
            </span>
            <span className="text-[10px] font-mono text-white/40 uppercase">Live Hot-Reload Active</span>
          </div>
        </div>
      )}
    </div>
  );
}
