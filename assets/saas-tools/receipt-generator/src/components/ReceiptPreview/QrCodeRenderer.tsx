import React, { useEffect, useRef } from 'react';

interface Props {
  text: string;
  size?: number;
}

export const QrCodeRenderer: React.FC<Props> = ({ text, size = 68 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    if (window.QRCode && text) {
      try {
        new window.QRCode(containerRef.current, {
          text: text,
          width: size,
          height: size,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: 2, // 'M'
        });
      } catch (err) {
        console.warn('QRCode generation failed, using fallback', err);
      }
    }
  }, [text, size]);

  if (!text) return null;

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={containerRef} 
        className="p-1 bg-white border border-slate-200 rounded shadow-2xs inline-block"
        style={{ width: `${size + 10}px`, height: `${size + 10}px` }}
      />
      <span className="text-[8px] text-slate-400 mt-0.5 tracking-tighter uppercase font-mono">
        Scan to Pay / Verify
      </span>
    </div>
  );
};
