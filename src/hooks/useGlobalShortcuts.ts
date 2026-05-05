import { useEffect } from 'react';

interface GlobalShortcutsConfig {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onClear: () => void;
  onSetTool: (tool: 'fill' | 'erase' | 'picker') => void;
  onAdjustBrush: (increment: boolean) => void;
}

export function useGlobalShortcuts({
  onUndo,
  onRedo,
  onSave,
  onClear,
  onSetTool,
  onAdjustBrush
}: GlobalShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmd = isMac ? e.metaKey : e.ctrlKey;

      if (cmd && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onRedo();
      } else if (cmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onUndo();
      } else if (cmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      } else if (cmd && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        onClear();
      } else if (!cmd && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'f':
            onSetTool('fill');
            break;
          case 'e':
            onSetTool('erase');
            break;
          case 'i':
            onSetTool('picker');
            break;
          case '.':
            onAdjustBrush(true); // increment
            break;
          case ',':
            onAdjustBrush(false); // decrement
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, onSave, onClear, onSetTool, onAdjustBrush]);
}
