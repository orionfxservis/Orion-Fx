import React, { useEffect, useState } from 'react';

interface WorkflowProgressProps {
  onOpenSave?: () => void;
  playlistCount?: number;
}

export type StageId = 'search' | 'build' | 'review' | 'save';

interface StageItem {
  id: StageId;
  num: string;
  label: string;
  targetId?: string;
  description: string;
}

const STAGES: StageItem[] = [
  { id: 'search', num: '01', label: 'Search', targetId: 'step-google-search', description: 'Google Music Grounding' },
  { id: 'build', num: '02', label: 'Build', targetId: 'step-select-songs', description: 'Select & Queue Songs' },
  { id: 'review', num: '03', label: 'Review', targetId: 'stage-03-playlist-section', description: 'Playlist Workspace' },
  { id: 'save', num: '04', label: 'Save', description: 'Cloud Sync & Studio' },
];

export default function WorkflowProgress({ onOpenSave, playlistCount = 12 }: WorkflowProgressProps) {
  const [activeStage, setActiveStage] = useState<StageId>('search');

  // Scrollspy to detect which stage is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const searchEl = document.getElementById('step-google-search');
      const buildEl = document.getElementById('step-select-songs');
      const reviewEl = document.getElementById('stage-03-playlist-section');

      const scrollPos = window.scrollY + 200;

      if (reviewEl && scrollPos >= reviewEl.offsetTop - 100) {
        setActiveStage('review');
      } else if (buildEl && scrollPos >= buildEl.offsetTop - 100) {
        setActiveStage('build');
      } else if (searchEl) {
        setActiveStage('search');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStageClick = (stage: StageItem) => {
    setActiveStage(stage.id);

    if (stage.id === 'save') {
      if (onOpenSave) {
        onOpenSave();
      } else {
        const el = document.getElementById('stage-03-playlist-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (stage.targetId) {
      const el = document.getElementById(stage.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const currentStageObj = STAGES.find((s) => s.id === activeStage) || STAGES[0];

  return (
    <div id="workflow-stage-progress" className="flex flex-col gap-3 pt-1 pb-2">
      {/* Container with subtle dark card framing */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-white/[0.08] backdrop-blur-md">
        <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-white/40 mb-2.5">
          Workflow Stage Progress
        </div>

        {/* 2-column, 2-row layout:
            ● 01 Search    ○ 02 Build
            ○ 03 Review   ○ 04 Save
        */}
        <div className="grid grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-2.5 max-w-sm">
          {STAGES.map((stage) => {
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => handleStageClick(stage)}
                className={`group flex items-center gap-2.5 text-left py-0.5 px-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-amber-300 font-bold'
                    : 'text-white/60 hover:text-white font-medium'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Bullet indicator: ● for active, ○ for other stages */}
                <span
                  className={`text-base leading-none transition-transform group-hover:scale-110 select-none ${
                    isActive ? 'text-amber-400 font-bold' : 'text-white/40'
                  }`}
                >
                  {isActive ? '●' : '○'}
                </span>

                {/* Stage Number & Label */}
                <span className="text-xs sm:text-sm font-mono tracking-tight flex items-center gap-1.5">
                  <span className={isActive ? 'text-amber-300' : 'text-white/40'}>
                    {stage.num}
                  </span>
                  <span>{stage.label}</span>
                </span>

                {/* Extra contextual badge if review */}
                {stage.id === 'review' && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300/80 font-mono hidden min-[440px]:inline">
                    {playlistCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prominent Stage Name Below */}
      <div className="px-1 pt-1 flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>{currentStageObj.label}</span>
        </h1>
        <span className="text-[11px] font-mono text-white/40">
          Stage {currentStageObj.num} of 04
        </span>
      </div>
    </div>
  );
}
