'use client';
import React from 'react';
import { ColorPicker } from '../common/ColorPicker';
import { ShortcutsList } from '../common/ShortcutsList';
import { DiscreteSlider } from '../ui/DiscreteSlider';

interface ToolsPanelProps {
  tool: 'fill' | 'erase' | 'picker';
  setTool: (tool: 'fill' | 'erase' | 'picker') => void;
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  recentColors: string[];
  addRecentColor: (color: string) => void;
  darkMode: boolean;
  onNewProject: () => void;
}

export const ToolsPanel = React.memo(function ToolsPanel({ tool, setTool, color, setColor, brushSize, setBrushSize, recentColors, addRecentColor, darkMode, onNewProject }: ToolsPanelProps) {

  const bgColor = darkMode ? '#0B0B0B' : '#ffffff';
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const panelBg = darkMode ? '#0B0B0B' : '#ffffff';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#888' : '#666';
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
        
        {/* Fill/Erase buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setTool('fill')}
            className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
              tool === 'fill' ? '' : 'opacity-40'
            }`}
            style={{ 
              backgroundColor: tool === 'fill' ? (darkMode ? '#1A1A1A' : '#F5F5F5') : 'transparent',
              borderColor: tool === 'fill' ? textColor : borderColor, 
              color: textColor 
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
              borderColor: tool === 'erase' ? textColor : borderColor, 
              color: textColor 
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

        {/* Brush Size Block */}
        <div className="border p-4 flex flex-col gap-4" style={{ borderColor }}>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: textColor }}>BRUSH SIZE</div>
            <div className="text-[10px] font-bold" style={{ color: textColor }}>{brushSize} px</div>
          </div>
          <DiscreteSlider 
            value={brushSize}
            min={1}
            max={16}
            onChange={setBrushSize}
            darkMode={darkMode}
          />
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
