import React, { useState } from 'react';
import { READY_TEMPLATES, ReadyTemplate } from '../utils/readyTemplates';
import { InvoiceTemplate } from '../types/invoice';
import { 
  Sparkles, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Palette, 
  Layout, 
  Briefcase, 
  Building2, 
  UserCheck, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface ReadyTemplatesGalleryProps {
  onApplyTemplate: (template: ReadyTemplate) => void;
  activeTemplateStyle: InvoiceTemplate;
  activeAccentColor: string;
  onAccentColorChange: (color: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const CATEGORY_TABS: { id: 'all' | 'professional' | 'corporate' | 'simple' | 'creative'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Ready Templates', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'professional', label: 'Professional Style', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'corporate', label: 'Corporate Style', icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'simple', label: 'Simple Freelancer', icon: <UserCheck className="w-3.5 h-3.5" /> },
  { id: 'creative', label: 'Modern & Creative', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

export const ReadyTemplatesGallery: React.FC<ReadyTemplatesGalleryProps> = ({
  onApplyTemplate,
  activeTemplateStyle,
  activeAccentColor,
  onAccentColorChange,
  isExpanded,
  onToggleExpanded,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'professional' | 'corporate' | 'simple' | 'creative'>('all');
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);

  const filteredTemplates = selectedCategory === 'all'
    ? READY_TEMPLATES
    : READY_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleSelectTemplate = (tpl: ReadyTemplate) => {
    onApplyTemplate(tpl);
    setAppliedTemplateId(tpl.id);
    setTimeout(() => {
      setAppliedTemplateId(null);
    }, 3000);
  };

  return (
    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 dark:from-indigo-950/20 dark:via-neutral-900 dark:to-sky-950/20 p-5 sm:p-6 mb-8 shadow-xs transition-all">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Ready Invoice Templates
              </h2>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Quick Start
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select pre-crafted templates for Professional, Corporate, Simple Freelancer, or Creative sprints. Customize colors and items anytime.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shrink-0"
        >
          {isExpanded ? (
            <>
              <span>Collapse Gallery</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Explore Ready Templates ({READY_TEMPLATES.length})</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Expandable Gallery Body */}
      {isExpanded && (
        <div className="pt-4 space-y-5">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((tpl) => {
              const isApplied = appliedTemplateId === tpl.id;
              const matchesStyle = activeTemplateStyle === tpl.templateStyle;

              return (
                <div
                  key={tpl.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between group bg-white dark:bg-neutral-900 ${
                    isApplied
                      ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md'
                      : matchesStyle
                      ? 'border-indigo-300 dark:border-indigo-700 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top strip with category badge and recommended color pill */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
                        {tpl.badge}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full shadow-xs border border-white dark:border-neutral-800"
                          style={{ backgroundColor: tpl.recommendedColor }}
                          title={`Recommended Accent: ${tpl.recommendedColor}`}
                        />
                        <span className="text-[10px] text-neutral-400 capitalize">
                          {tpl.templateStyle}
                        </span>
                      </div>
                    </div>

                    {/* Template Title */}
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tpl.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {tpl.categoryLabel}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        isApplied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied!</span>
                        </>
                      ) : (
                        <>
                          <span>Use Template</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick theme tweak helper bar */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span>
                Want to customize the theme after choosing a template? Click any color circle above or enter your custom hex.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-[11px] font-mono">Current:</span>
              <div
                className="w-5 h-5 rounded-full border border-neutral-300 shadow-xs"
                style={{ backgroundColor: activeAccentColor }}
              />
              <span className="font-mono text-neutral-700 dark:text-neutral-200 font-semibold">
                {activeAccentColor}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
