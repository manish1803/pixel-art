'use client';
import { Copy, Trash2, GripVertical } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

interface Frame {
  id: number;
  pixels: { [key: string]: string };
}

interface AnimationTimelineProps {
  frames: Frame[];
  setFrames: (frames: Frame[]) => void;
  currentFrame: number;
  setCurrentFrame: (index: number) => void;
  onAddFrame: () => void;
  onDuplicateFrame: (index: number) => void;
  onDeleteFrame: (index: number) => void;
  gridSize: number;
  darkMode: boolean;
}

export function AnimationTimeline({ 
  frames, 
  setFrames,
  currentFrame, 
  setCurrentFrame, 
  onAddFrame, 
  onDuplicateFrame, 
  onDeleteFrame, 
  gridSize, 
  darkMode 
}: AnimationTimelineProps) {

  return (
    <div className="h-48 border-t border-border p-4 bg-background shrink-0 overflow-hidden flex flex-col">
      <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <Reorder.Group 
            axis="x" 
            values={frames} 
            onReorder={setFrames}
            className="flex items-center gap-4 flex-nowrap h-full pr-8"
        >
          {frames.map((frame, index) => (
            <Reorder.Item 
                key={frame.id} 
                value={frame}
                className="relative group shrink-0"
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20 bg-panel border border-border rounded px-1">
                 <GripVertical className="w-3 h-3 text-muted" />
              </div>
              
              <button
                onClick={() => setCurrentFrame(index)}
                className={`flex-shrink-0 w-24 h-28 border transition-all flex flex-col overflow-hidden ${
                  currentFrame === index ? 'border-foreground ring-1 ring-foreground' : 'border-border'
                } bg-panel`}
              >
                <div className="flex-1 relative overflow-hidden flex items-center justify-center p-1 bg-background">
                  {/* Real pixel preview */}
                  <div 
                    className="grid h-full aspect-square [image-rendering:pixelated]" 
                    style={{ 
                      gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                      width: '100%',
                    }}
                  >
                    {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                      const x = i % gridSize;
                      const y = Math.floor(i / gridSize);
                      const color = frame.pixels[`${x},${y}`];
                      return (
                        <div 
                          key={i} 
                          style={{ backgroundColor: color || 'transparent' }} 
                        />
                      );
                    })}
                  </div>
                </div>
                <div className={`h-8 border-t border-border flex items-center justify-center font-bold text-xs text-foreground ${
                  currentFrame === index ? 'bg-panel' : 'bg-transparent'
                }`}>
                  {index + 1}
                </div>
              </button>

              {/* Quick Actions */}
              <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); onDuplicateFrame(index); }}
                  className="p-1.5 bg-panel border border-border rounded shadow-lg hover:bg-accent hover:text-black transition-colors"
                  title="Duplicate Frame"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {frames.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteFrame(index); }}
                    className="p-1.5 bg-panel border border-border rounded shadow-lg hover:bg-red-500 hover:text-white transition-colors"
                    title="Delete Frame"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Reorder.Item>
          ))}

          <button
            onClick={onAddFrame}
            className="flex-shrink-0 w-24 h-28 border border-dashed border-border flex items-center justify-center transition-colors hover:bg-accent hover:text-black text-muted self-start mt-0"
          >
            <span className="text-2xl font-light">+</span>
          </button>
        </Reorder.Group>
      </div>

      <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-2 text-foreground shrink-0">
        Drag to reorder. Hover over frames for action
      </div>
    </div>
  );
}
