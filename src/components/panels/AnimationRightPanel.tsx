'use client';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface AnimationRightPanelProps {
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  darkMode: boolean;
  onExportPNG: () => void;
  onExportSVG: () => void;
}

export function AnimationRightPanel({
  isPlaying,
  setIsPlaying,
  currentFrame,
  totalFrames,
  fps,
  darkMode,
  onExportPNG,
  onExportSVG,
}: AnimationRightPanelProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const bgColor = darkMode ? '#0B0B0B' : '#ffffff';
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const panelBg = darkMode ? '#111' : '#f9f9f9';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#888' : '#666';

  return (
    <div className="w-80 border-l flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Geist Mono', monospace", backgroundColor: bgColor, borderColor }}>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        {/* Animation Preview Block */}
        <div className="border p-4 flex flex-col gap-4" style={{ borderColor }}>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: textColor }}>ANIMATION PREVIEW</div>
          <div className="border aspect-square flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: darkMode ? '#000' : '#FFF', borderColor }}>
            {/* Grid background for preview area */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: darkMode ? 'radial-gradient(white 1px, transparent 1px)' : 'radial-gradient(black 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-20" style={{ color: textColor }}>Preview Area</div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center border transition-colors hover:bg-accent" style={{ borderColor, color: mutedText }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M12 0L0 6L12 12V0Z"/></svg>
              </button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 flex items-center justify-center border transition-colors hover:bg-accent" style={{ borderColor, color: textColor }}>
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M0 0H4V12H0V0ZM8 0H12V12H8V0Z"/></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M0 0L12 6L0 12V0Z"/></svg>
                )}
              </button>
              <button className="w-10 h-10 flex items-center justify-center border transition-colors hover:bg-accent" style={{ borderColor, color: mutedText }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M0 0L12 6L0 12V0Z"/><path d="M10 0H12V12H10V0Z"/></svg>
              </button>
            </div>

            <div className="text-right space-y-0.5 pr-2">
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textColor }}>{fps} FPS</div>
              <div className="text-[9px] font-bold uppercase opacity-40" style={{ color: textColor }}>Frame {currentFrame + 1} of {totalFrames}</div>
            </div>
          </div>
        </div>

      </div>

      <div className="p-4 flex gap-2 border-t" style={{ borderColor }}>
        <div className="flex-1 relative">
          <button onClick={() => setExportOpen(!exportOpen)} className="w-full px-4 py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-accent flex items-center justify-center gap-2" style={{ backgroundColor: exportOpen ? (darkMode ? '#1A1A1A' : '#F5F5F5') : 'transparent', borderColor, color: textColor }}>
            <span>EXPORT</span>
            <ChevronRight className={`w-3 h-3 transition-transform ${exportOpen ? '-rotate-90' : 'rotate-90'}`} />
          </button>
          
          {exportOpen && (
            <div className="absolute bottom-full mb-2 right-0 border flex flex-col w-full shadow-2xl z-50" style={{ backgroundColor: panelBg, borderColor }}>
              <button 
                onClick={() => { onExportPNG(); setExportOpen(false); }} 
                className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider hover:bg-accent transition-colors border-b" 
                style={{ borderColor, color: textColor }}
              >
                PNG
              </button>
              <button 
                onClick={() => { onExportSVG(); setExportOpen(false); }} 
                className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider hover:bg-accent transition-colors" 
                style={{ color: textColor }}
              >
                SVG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
