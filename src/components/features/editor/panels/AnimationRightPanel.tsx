'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

interface Frame {
  id: number;
  pixels: { [key: string]: string };
}

interface AnimationRightPanelProps {
  frames: Frame[];
  gridSize: number;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  currentFrame: number;
  setCurrentFrame: (index: number) => void;
  totalFrames: number;
  fps: number;
  darkMode: boolean;
  onExportPNG: () => void;
  onExportSVG: () => void;
}

export function AnimationRightPanel({
  frames,
  gridSize,
  isPlaying,
  setIsPlaying,
  currentFrame,
  setCurrentFrame,
  totalFrames,
  fps,
  darkMode,
  onExportPNG,
  onExportSVG,
}: AnimationRightPanelProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playbackRef = useRef<number>(currentFrame);

  // Sync playback ref with prop
  useEffect(() => {
    playbackRef.current = currentFrame;
  }, [currentFrame]);

  // Animation Playback Logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const nextFrame = (playbackRef.current + 1) % totalFrames;
      playbackRef.current = nextFrame;
      setCurrentFrame(nextFrame);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [isPlaying, totalFrames, fps, setCurrentFrame]);

  // Render Preview Frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = frames[currentFrame];
    if (!frame) return;

    const size = canvas.width;
    const cellSize = size / gridSize;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = darkMode ? '#0B0B0B' : '#f9f9f9';
    ctx.fillRect(0, 0, size, size);

    Object.entries(frame.pixels).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    });
  }, [frames, currentFrame, gridSize, darkMode]);

  return (
    <div className="w-80 border-l border-border flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        {/* Animation Preview Block */}
        <div className="border border-border p-4 flex flex-col gap-4">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground">ANIMATION PREVIEW</div>
          <div className="border border-border aspect-square flex items-center justify-center relative overflow-hidden bg-panel">
            {/* Grid background for preview area */}
            <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:10px_10px] text-foreground" />
            <canvas 
              ref={canvasRef}
              width={200}
              height={200}
              className="relative z-10 [image-rendering:pixelated] w-full h-full"
            />
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-center gap-2">
              <button 
                onClick={() => setCurrentFrame((currentFrame - 1 + totalFrames) % totalFrames)}
                className="w-10 h-10 flex items-center justify-center border border-border transition-colors hover:bg-accent hover:text-black text-muted"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M12 0L0 6L12 12V0Z"/></svg>
              </button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 flex items-center justify-center border border-border transition-colors hover:bg-accent hover:text-black text-foreground">
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M0 0H4V12H0V0ZM8 0H12V12H8V0Z"/></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M0 0L12 6L0 12V0Z"/></svg>
                )}
              </button>
              <button 
                onClick={() => setCurrentFrame((currentFrame + 1) % totalFrames)}
                className="w-10 h-10 flex items-center justify-center border border-border transition-colors hover:bg-accent hover:text-black text-muted"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M0 0L12 6L0 12V0Z"/><path d="M10 0H12V12H10V0Z"/></svg>
              </button>
            </div>

            <div className="text-right space-y-0.5 pr-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-foreground">{fps} FPS</div>
              <div className="text-[9px] font-bold uppercase opacity-40 text-foreground">Frame {currentFrame + 1} of {totalFrames}</div>
            </div>
          </div>
        </div>

      </div>

      <div className="p-4 flex gap-2 border-t border-border">
        <div className="flex-1 relative">
          <button onClick={() => setExportOpen(!exportOpen)} className={`w-full px-4 py-3 border border-border text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-accent hover:text-black flex items-center justify-center gap-2 text-foreground ${
            exportOpen ? 'bg-panel' : 'bg-transparent'
          }`}>
            <span>EXPORT</span>
            <ChevronRight className={`w-3 h-3 transition-transform ${exportOpen ? '-rotate-90' : 'rotate-90'}`} />
          </button>
          
          {exportOpen && (
            <div className="absolute bottom-full mb-2 right-0 border border-border bg-panel flex flex-col w-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-1 duration-150">
              <button 
                onClick={() => { onExportPNG(); setExportOpen(false); }} 
                className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider hover:bg-accent hover:text-black transition-colors border-b border-border text-foreground" 
              >
                PNG
              </button>
              <button 
                onClick={() => { onExportSVG(); setExportOpen(false); }} 
                className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider hover:bg-accent hover:text-black transition-colors text-foreground" 
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
