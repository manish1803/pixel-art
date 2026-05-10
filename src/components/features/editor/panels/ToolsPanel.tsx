'use client';
import React from 'react';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { ShortcutsList } from '@/components/shared/ShortcutsList';
import { DiscreteSlider } from '@/components/ui/DiscreteSlider';
import { PanelContainer, PanelSection, PanelFooter } from '@/components/shared/PanelBase';

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
    <PanelContainer side="left">
      {/* Fill/Erase buttons */}
      <PanelSection border={false}>
        <div className="flex gap-2">
          <button
            onClick={() => setTool('fill')}
            className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
              tool === 'fill' ? 'bg-accent/10 border-accent text-accent' : 'bg-transparent border-border text-foreground opacity-40'
            }`}
          >
            FILL
          </button>
          <button
            onClick={() => setTool('erase')}
            className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
              tool === 'erase' ? 'bg-accent/10 border-accent text-accent' : 'bg-transparent border-border text-foreground opacity-40'
            }`}
          >
            ERASE
          </button>
        </div>
      </PanelSection>

      <ColorPicker 
        color={color} 
        setColor={setColor} 
        recentColors={recentColors} 
        addRecentColor={addRecentColor} 
        darkMode={darkMode} 
        onPickColor={handlePickColor}
        isPickerActive={tool === 'picker'}
      />

      <PanelSection title="Brush Size">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={brushSize}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= 16) {
                  setBrushSize(val);
                }
              }}
              className="w-12 bg-transparent border border-border text-[10px] font-bold text-foreground p-1 text-center focus:outline-none focus:border-accent"
              min={1}
              max={16}
            />
            <span className="text-[10px] font-bold text-foreground opacity-40">PX</span>
          </div>
        </div>
        <DiscreteSlider 
          value={brushSize}
          min={1}
          max={16}
          onChange={setBrushSize}
        />
      </PanelSection>

      <ShortcutsList />

      <PanelFooter />
    </PanelContainer>
  );
});
