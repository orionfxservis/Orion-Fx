import React from 'react';
import { StatusBadge } from '../../types';

interface Props {
  status: StatusBadge;
  companyName: string;
  date?: string;
  color?: string;
}

export const StatusStamp: React.FC<Props> = ({ status, companyName, date, color }) => {
  if (status === 'NONE') return null;

  let borderColor = 'border-emerald-600 text-emerald-700';
  let label = status;

  if (status === 'PAID') {
    borderColor = 'border-emerald-600 text-emerald-700';
  } else if (status === 'DUE') {
    borderColor = 'border-rose-600 text-rose-700';
  } else if (status === 'PENDING') {
    borderColor = 'border-amber-600 text-amber-700';
  } else if (status === 'REFUNDED') {
    borderColor = 'border-purple-600 text-purple-700';
  } else if (status === 'DRAFT') {
    borderColor = 'border-slate-500 text-slate-600';
  }

  return (
    <div className="relative select-none pointer-events-none transform -rotate-12">
      <div 
        className={`border-4 border-dashed rounded-xl px-3 py-1.5 flex flex-col items-center justify-center opacity-85 shadow-xs ${borderColor}`}
        style={color ? { borderColor: color, color: color } : undefined}
      >
        <span className="text-[9px] font-black tracking-widest uppercase truncate max-w-[120px]">
          {companyName ? companyName.substring(0, 16) : 'OFFICIAL'}
        </span>
        <span className="text-xl font-black tracking-widest uppercase my-0.5 leading-none">
          {label}
        </span>
        <div className="flex items-center gap-1 text-[8px] font-mono tracking-tight opacity-90">
          <span>VERIFIED</span>
          {date && <span>• {date}</span>}
        </div>
      </div>
    </div>
  );
};
