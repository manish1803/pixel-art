'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { PanelContainer, PanelSection } from '@/components/shared/PanelBase';
import { CustomNumberInput } from '@/components/ui/CustomNumberInput';
import { MiniMap } from './MiniMap';

interface Frame {
  id: number;
  pixels: { [key: string]: string };
}

interface AnimationRightPanelProps {
  frames: Frame[];
  gridSize: number;
  setGridSize: (size: number) => void;
  currentFrame: number;
  onionSkin: boolean;
  setOnionSkin: (value: boolean) => void;
  darkMode: boolean;
  onExportPNG: () => void;
  onExportSVG: () => void;
  zoom: number;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;
}

export function AnimationRightPanel({
  frames,
  gridSize,
  setGridSize,
  currentFrame,
  onionSkin,
  setOnionSkin,
  darkMode,
  onExportPNG,
  onExportSVG,
  zoom,
  pan,
  setPan,
}: AnimationRightPanelProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    <PanelContainer side="right" width="w-80">
      
      {/* Animation Preview Block */}
      <PanelSection title="Animation Preview">
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
      </PanelSection>

      <PanelSection title="Navigator">
        <MiniMap
          frames={frames}
          currentFrame={currentFrame}
          gridSize={gridSize}
          zoom={zoom}
          pan={pan}
          setPan={setPan}
          darkMode={darkMode}
        />
      </PanelSection>

      <PanelSection title="Document Settings">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase text-foreground">Canvas Size</div>
            <CustomNumberInput 
              value={`${gridSize} X ${gridSize}`}
              onIncrement={() => setGridSize(Math.min(64, gridSize + 8))}
              onDecrement={() => setGridSize(Math.max(8, gridSize - 8))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase text-foreground">Onion Skin</div>
            <button 
              onClick={() => setOnionSkin(!onionSkin)}
              className={`w-12 h-6 border flex items-center px-1 border-border transition-colors ${
                onionSkin ? 'bg-panel' : 'bg-transparent'
              }`}
            >
              <div 
                className={`w-4 h-4 transition-transform shadow-sm ${
                  onionSkin ? 'translate-x-6 bg-foreground' : 'translate-x-0 bg-muted'
                }`}
              />
            </button>
          </div>
        </div>
      </PanelSection>

      {/* Export Section */}
      <PanelSection title="Export Assets">
        <div className="relative">
          <button onClick={() => setExportOpen(!exportOpen)} className={`w-full px-4 py-3 border border-border text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-accent hover:text-black flex items-center justify-center gap-2 text-foreground ${
            exportOpen ? 'bg-panel' : 'bg-transparent'
          }`}>
            <span>EXPORT FRAME</span>
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
      </PanelSection>

    </PanelContainer>
  );
}
