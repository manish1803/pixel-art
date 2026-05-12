'use client';
import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Copy, Unlink, Link } from 'lucide-react';
import { AnimationState, findCel } from '@/lib/models/animation';

interface LayersPanelProps {
  state: AnimationState;
  selectedFrame: string;
  selectedLayer: string;
  setSelectedLayer: (id: string) => void;
  addLayer: (id: string, name: string) => void;
  unlinkCel: (frameId: string, layerId: string) => void;
}

export function LayersPanel({
  state,
  selectedFrame,
  selectedLayer,
  setSelectedLayer,
  addLayer,
  unlinkCel,
}: LayersPanelProps) {
  return (
    <div className="bg-panel border border-border rounded-xl flex flex-col h-full overflow-hidden">
      <div className="h-10 border-b border-border flex items-center justify-between px-3 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Layers</span>
        <button 
          onClick={() => {
            const newLayerId = `layer-${state.layers.length + 1}`;
            addLayer(newLayerId, `Layer ${state.layers.length + 1}`);
            setSelectedLayer(newLayerId);
          }}
          className="p-1 hover:text-foreground rounded transition-colors"
          title="Add Layer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.layers.map((layer) => {
          const cel = findCel(state, selectedFrame, layer.id);
          const isSelected = selectedLayer === layer.id;
          const isLinked = cel ? state.cels.filter(c => c.dataId === cel.dataId).length > 1 : false;

          return (
            <div 
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`h-12 border-b border-border flex items-center justify-between px-3 cursor-pointer transition-colors ${
                isSelected ? 'bg-accent/10 text-foreground' : 'text-muted hover:text-foreground hover:bg-panel/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Status Indicator (Linked/Unlinked) */}
                <div 
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    cel 
                      ? isLinked 
                        ? 'bg-accent/20 text-accent' 
                        : 'bg-foreground/10 text-foreground' 
                      : 'border border-dashed border-muted-foreground/30'
                  }`}
                  title={cel ? (isLinked ? 'Linked Cel' : 'Unique Cel') : 'Empty Cel'}
                >
                  {cel && (
                    isLinked 
                      ? <Link className="w-3 h-3" /> 
                      : <div className="w-2 h-2 bg-foreground rounded-full" />
                  )}
                </div>

                <span className="text-xs font-medium truncate">{layer.name}</span>
              </div>

              <div className="flex items-center gap-1">
                {cel && isLinked && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      unlinkCel(selectedFrame, layer.id);
                    }}
                    className="p-1 hover:text-foreground rounded"
                    title="Unlink Cel"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button className="p-1 hover:text-foreground rounded">
                  {layer.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button className="p-1 hover:text-foreground rounded">
                  {layer.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
