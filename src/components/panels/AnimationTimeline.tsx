'use client';
interface Frame {
  id: number;
  pixels: { [key: string]: string };
}

interface AnimationTimelineProps {
  frames: Frame[];
  currentFrame: number;
  setCurrentFrame: (index: number) => void;
  onAddFrame: () => void;
  darkMode: boolean;
}

export function AnimationTimeline({ frames, currentFrame, setCurrentFrame, onAddFrame, darkMode }: AnimationTimelineProps) {
  const bgColor = darkMode ? '#0B0B0B' : '#ffffff';
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const panelBg = darkMode ? '#111' : '#f9f9f9';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#666' : '#999';

  return (
    <div className="h-48 border-t p-6" style={{ fontFamily: "'Geist Mono', monospace", backgroundColor: bgColor, borderColor }}>
      <div className="flex items-center gap-4 overflow-x-auto pb-4">
        {frames.map((frame, index) => (
          <div key={frame.id} className="flex flex-col gap-2">
            <button
              onClick={() => setCurrentFrame(index)}
              className="flex-shrink-0 w-24 h-32 border transition-all flex flex-col overflow-hidden group"
              style={{
                borderColor: currentFrame === index ? (darkMode ? '#FFF' : '#000') : borderColor,
                backgroundColor: darkMode ? '#000' : '#FFF',
              }}
            >
              <div className="flex-1 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                {/* Simplified frame preview */}
                <div className="w-12 h-12 grid grid-cols-4 gap-1">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="w-full h-full bg-current" />
                  ))}
                </div>
              </div>
              <div className="h-8 border-t flex items-center justify-center font-bold text-xs" style={{ borderColor, color: textColor, backgroundColor: currentFrame === index ? (darkMode ? '#111' : '#F5F5F5') : 'transparent' }}>
                {index + 1}
              </div>
            </button>
          </div>
        ))}

        <button
          onClick={onAddFrame}
          className="flex-shrink-0 w-24 h-32 border border-dashed flex items-center justify-center transition-colors hover:bg-accent"
          style={{ borderColor, color: mutedText }}
        >
          <span className="text-2xl font-light">+</span>
        </button>
      </div>

      <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-2" style={{ color: textColor }}>
        Drag to reorder. Hover over frames for action
      </div>
    </div>
  );
}
