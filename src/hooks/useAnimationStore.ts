import { useState, useCallback } from 'react';
import { AnimationState, createInitialState, findCel } from '@/lib/models/animation';

// Action Types
type Action =
  | { type: 'ADD_FRAME'; payload: { frameId: string; copyFromFrameId?: string } }
  | { type: 'DELETE_FRAME'; payload: { frameId: string } }
  | { type: 'ADD_LAYER'; payload: { layerId: string; name: string } }
  | { type: 'UPDATE_PIXELS'; payload: { frameId: string; layerId: string; pixels: { [key: string]: string } } }
  | { type: 'UNLINK_CEL'; payload: { frameId: string; layerId: string } }
  | { type: 'CLEAR_CEL'; payload: { frameId: string; layerId: string } }
  | { type: 'UPDATE_TRANSFORM'; payload: { frameId: string; layerId: string; transform: { x: number; y: number; rotation: number } } }
  | { type: 'UPDATE_SELECTION'; payload: { frameId: string; layerId: string; selection: { x: number; y: number; w: number; h: number } | null } }
  | { type: 'RESET_STATE'; payload: { state: AnimationState } }
  | { type: 'UPDATE_THUMBNAIL'; payload: { frameId: string } };

// Reducer
function animationReducer(state: AnimationState, action: Action): AnimationState {
  switch (action.type) {
    case 'ADD_FRAME': {
      const { frameId, copyFromFrameId } = action.payload;
      const newFrame = { id: frameId };
      
      const newCels = state.layers.map((layer) => {
        const dataId = `data-${frameId}-${layer.id}`; // Always unique by default!
        
        return {
          frameId,
          layerId: layer.id,
          dataId,
        };
      });

      // Create CelData entries for the new cels
      const newCelData = { ...state.celData };
      newCels.forEach((cel) => {
        if (copyFromFrameId) {
          const prevCel = findCel(state, copyFromFrameId, cel.layerId);
          if (prevCel) {
            const prevData = state.celData[prevCel.dataId];
            newCelData[cel.dataId] = { 
              id: cel.dataId, 
              pixels: { ...prevData.pixels } // Copy pixels instead of sharing!
            };
          } else {
            newCelData[cel.dataId] = { id: cel.dataId, pixels: {} };
          }
        } else {
          newCelData[cel.dataId] = { id: cel.dataId, pixels: {} };
        }
      });

      const frames = (() => {
        if (copyFromFrameId) {
          const index = state.frames.findIndex(f => f.id === copyFromFrameId);
          if (index !== -1) {
            const newFrames = [...state.frames];
            newFrames.splice(index + 1, 0, newFrame);
            return newFrames;
          }
        }
        return [...state.frames, newFrame];
      })();

      return {
        ...state,
        frames,
        cels: [...state.cels, ...newCels],
        celData: newCelData,
      };
    }

    case 'DELETE_FRAME': {
      const { frameId } = action.payload;
      if (state.frames.length <= 1) return state;
      
      const newFrames = state.frames.filter(f => f.id !== frameId);
      const newCels = state.cels.filter(c => c.frameId !== frameId);
      
      return {
        ...state,
        frames: newFrames,
        cels: newCels,
      };
    }

    case 'ADD_LAYER': {
      const { layerId, name } = action.payload;
      const newLayer = { id: layerId, name, isVisible: true, isLocked: false };
      
      // Create cels for this new layer in all existing frames
      const newCels = state.frames.map((frame) => {
        const dataId = `data-${frame.id}-${layerId}`;
        return {
          frameId: frame.id,
          layerId,
          dataId,
        };
      });

      const newCelData = { ...state.celData };
      newCels.forEach((cel) => {
        newCelData[cel.dataId] = { id: cel.dataId, pixels: {} };
      });

      return {
        ...state,
        layers: [...state.layers, newLayer],
        cels: [...state.cels, ...newCels],
        celData: newCelData,
      };
    }

    case 'UPDATE_PIXELS': {
      const { frameId, layerId, pixels } = action.payload;
      const cel = findCel(state, frameId, layerId);
      if (!cel) return state; // Should not happen

      // Update the shared CelData!
      return {
        ...state,
        celData: {
          ...state.celData,
          [cel.dataId]: {
            ...state.celData[cel.dataId],
            pixels: (() => {
              const p = { ...state.celData[cel.dataId].pixels };
              Object.entries(pixels).forEach(([k, v]) => {
                if (v === '') delete p[k];
                else p[k] = v;
              });
              return p;
            })(),
          },
        },
      };
    }

    case 'UNLINK_CEL': {
      const { frameId, layerId } = action.payload;
      const cel = findCel(state, frameId, layerId);
      if (!cel) return state;

      const currentData = state.celData[cel.dataId];
      if (!currentData) return state;

      // Create a NEW unique data ID
      const newDataId = `data-${frameId}-${layerId}-unique`;
      
      // Copy the pixels!
      const newData = { id: newDataId, pixels: { ...currentData.pixels } };

      // Update the cel to point to the new data
      const newCels = state.cels.map((c) =>
        c.frameId === frameId && c.layerId === layerId ? { ...c, dataId: newDataId } : c
      );

      return {
        ...state,
        cels: newCels,
        celData: {
          ...state.celData,
          [newDataId]: newData,
        },
      };
    }

    case 'CLEAR_CEL': {
      const { frameId, layerId } = action.payload;
      const cel = findCel(state, frameId, layerId);
      if (!cel) return state;

      return {
        ...state,
        celData: {
          ...state.celData,
          [cel.dataId]: {
            ...state.celData[cel.dataId],
            pixels: {}, // Empty pixels!
          },
        },
      };
    }

    case 'UPDATE_TRANSFORM': {
      const { frameId, layerId, transform } = action.payload;
      const newCels = state.cels.map((c) =>
        c.frameId === frameId && c.layerId === layerId ? { ...c, transform } : c
      );
      return { ...state, cels: newCels };
    }

    case 'UPDATE_SELECTION': {
      const { layerId, selection } = action.payload;
      const newCels = state.cels.map((c) =>
        c.layerId === layerId ? { ...c, selection } : c
      );
      return { ...state, cels: newCels };
    }

    case 'RESET_STATE': {
      return action.payload.state;
    }

    case 'UPDATE_THUMBNAIL': {
      return { ...state, thumbnailFrameId: action.payload.frameId };
    }

    default:
      return state;
  }
}

// Hook
export function useAnimationStore() {
  const [state, setState] = useState<AnimationState>(createInitialState());
  const [history, setHistory] = useState<AnimationState[]>([createInitialState()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateStateWithHistory = useCallback((newState: AnimationState) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory;
    });
    setHistoryIndex(prevIndex => prevIndex + 1);
    setState(newState);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1);
      setState(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(i => i + 1);
      setState(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const dispatch = useCallback((action: Action) => {
    const newState = animationReducer(state, action);
    updateStateWithHistory(newState);
  }, [state, updateStateWithHistory]);

  return {
    state,
    addFrame: (frameId: string, copyFromFrameId?: string) =>
      dispatch({ type: 'ADD_FRAME', payload: { frameId, copyFromFrameId } }),
    deleteFrame: (frameId: string) =>
      dispatch({ type: 'DELETE_FRAME', payload: { frameId } }),
    addLayer: (layerId: string, name: string) =>
      dispatch({ type: 'ADD_LAYER', payload: { layerId, name } }),
    updatePixels: (frameId: string, layerId: string, pixels: { [key: string]: string }) =>
      dispatch({ type: 'UPDATE_PIXELS', payload: { frameId, layerId, pixels } }),
    unlinkCel: (frameId: string, layerId: string) =>
      dispatch({ type: 'UNLINK_CEL', payload: { frameId, layerId } }),
    clearCel: (frameId: string, layerId: string) =>
      dispatch({ type: 'CLEAR_CEL', payload: { frameId, layerId } }),
    updateTransform: (frameId: string, layerId: string, transform: { x: number; y: number; rotation: number }) =>
      dispatch({ type: 'UPDATE_TRANSFORM', payload: { frameId, layerId, transform } }),
    updateSelection: (frameId: string, layerId: string, selection: { x: number; y: number; w: number; h: number } | null) =>
      dispatch({ type: 'UPDATE_SELECTION', payload: { frameId, layerId, selection } }),
    resetState: (state: AnimationState) =>
      dispatch({ type: 'RESET_STATE', payload: { state } }),
    updateThumbnail: (frameId: string) =>
      dispatch({ type: 'UPDATE_THUMBNAIL', payload: { frameId } }),
    undo,
    redo,
  };
}
