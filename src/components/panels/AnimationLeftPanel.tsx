'use client';
import React from 'react';
import { ColorPicker } from '../common/ColorPicker';
import { ShortcutsList } from '../common/ShortcutsList';
import { CustomNumberInput } from '../ui/CustomNumberInput';
import { DiscreteSlider } from '../ui/DiscreteSlider';

interface AnimationLeftPanelProps {
  tool: 'fill' | 'erase' | 'picker';
  setTool: (tool: 'fill' | 'erase' | 'picker') => void;
  eraserSize: number;
  setEraserSize: (size: number) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  fps: number;
  setFps: (fps: number) => void;
  onionSkin: boolean;
  setOnionSkin: (value: boolean) => void;
  darkMode: boolean;
  onNewProject: () => void;
  color: string;
  setColor: (color: string) => void;
  recentColors: string[];
  addRecentColor: (color: string) => void;
}

export const AnimationLeftPanel = React.memo(function AnimationLeftPanel({
  tool,
  setTool,
  eraserSize,
  setEraserSize,
  gridSize,
  setGridSize,
  fps,
  setFps,
  onionSkin,
  setOnionSkin,
  darkMode,
  onNewProject,
  color,
  setColor,
  recentColors,
  addRecentColor,
}: AnimationLeftPanelProps) {

  const bgColor = darkMode ? '#0B0B0B' : '#ffffff';
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const panelBg = darkMode ? '#111' : '#f9f9f9';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#888' : '#666';
  const duration = Math.round(1000 / fps);

  const handlePickColor = async () => {
    if ('EyeDropper' in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result.sRGBHex) {
          setColor(result.sRGBHex);
          addRecentColor(result.sRGBHex);
        }
      } catch (e) {
        setTool('picker');
      }
    } else {
      setTool('picker');
    }
  };

  return (
    <div className="w-72 border-r flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Geist Mono', monospace", backgroundColor: bgColor, borderColor }}>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        {/* Open Project Block */}
        <div className="border p-4" style={{ borderColor }}>
          <button 
            onClick={onNewProject}
            className="w-full text-[10px] font-bold uppercase tracking-widest transition-colors hover:opacity-70" 
            style={{ color: textColor }}
          >
            OPEN PROJECT
          </button>
        </div>

        {/* Canvas Size Block */}
        <div className="border p-4 flex flex-col gap-4" style={{ borderColor }}>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: textColor }}>CANVAS SIZE</div>
            <CustomNumberInput 
              value={`${gridSize} X ${gridSize}`}
              onIncrement={() => setGridSize(Math.min(64, gridSize + 8))}
              onDecrement={() => setGridSize(Math.max(8, gridSize - 8))}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* FPS Block */}
        <div className="border p-4 flex items-center justify-between" style={{ borderColor }}>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: textColor }}>FPS</div>
            <div className="text-[9px] font-bold uppercase opacity-50" style={{ color: textColor }}>DURATION: {duration}MS</div>
          </div>
          <CustomNumberInput 
            variant="vertical"
            value={`${fps} FPS`}
            onIncrement={() => setFps(Math.min(60, fps + 1))}
            onDecrement={() => setFps(Math.max(1, fps - 1))}
            darkMode={darkMode}
          />
        </div>

        {/* Fill/Erase Block */}
        <div className="flex gap-2">
          <button
            onClick={() => setTool('fill')}
            className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
              tool === 'fill' ? '' : 'opacity-40'
            }`}
            style={{
              backgroundColor: tool === 'fill' ? (darkMode ? '#1A1A1A' : '#F5F5F5') : 'transparent',
              color: textColor,
              borderColor: tool === 'fill' ? textColor : borderColor
            }}
          >
            FILL
          </button>
          <button
            onClick={() => setTool('erase')}
            className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
              tool === 'erase' ? '' : 'opacity-40'
            }`}
            style={{
              backgroundColor: tool === 'erase' ? (darkMode ? '#1A1A1A' : '#F5F5F5') : 'transparent',
              color: textColor,
              borderColor: tool === 'erase' ? textColor : borderColor
            }}
          >
            ERASE
          </button>
        </div>

        <ColorPicker 
          color={color} 
          setColor={setColor} 
          recentColors={recentColors} 
          addRecentColor={addRecentColor} 
          darkMode={darkMode} 
          onPickColor={handlePickColor}
          isPickerActive={tool === 'picker'}
        />

        {/* Eraser Size Block */}
        <div className="border p-4 flex flex-col gap-4" style={{ borderColor }}>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: textColor }}>ERASER SIZE</div>
            <div className="text-[10px] font-bold" style={{ color: textColor }}>{eraserSize} px</div>
          </div>
          <DiscreteSlider 
            value={eraserSize}
            min={1}
            max={16}
            onChange={setEraserSize}
            darkMode={darkMode}
          />
        </div>

        {/* Onion Skin Block */}
        <div className="border p-4 flex items-center justify-between" style={{ borderColor }}>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: textColor }}>ONION SKIN</span>
          <button 
            onClick={() => setOnionSkin(!onionSkin)}
            className="w-12 h-6 border flex items-center px-1"
            style={{ borderColor, backgroundColor: onionSkin ? (darkMode ? '#1A1A1A' : '#F5F5F5') : 'transparent' }}
          >
            <div 
              className="w-4 h-4 transition-transform shadow-sm" 
              style={{ 
                transform: onionSkin ? 'translateX(24px)' : 'translateX(0)',
                backgroundColor: onionSkin ? (darkMode ? '#FFF' : '#000') : (darkMode ? '#666' : '#999')
              }}
            />
          </button>
        </div>

        <ShortcutsList darkMode={darkMode} />

        {/* Footer Block */}
        <div className="border p-4 flex items-center justify-between" style={{ borderColor }}>
          <div className="flex flex-col gap-1">
            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase" style={{ color: mutedText }}>DESIGNER</div>
            <a 
              href="https://github.com/Manish1803" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[10px] font-bold hover:underline" 
              style={{ color: textColor }}
            >
              @mainsh1803
            </a>
          </div>
        </div>

      </div>
    </div>
  );
});
