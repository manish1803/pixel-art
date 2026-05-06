'use client';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';

interface ShortcutsListProps {
  darkMode: boolean;
}

export function ShortcutsList({ darkMode }: ShortcutsListProps) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#888' : '#666';

  return (
    <div className="border p-4" style={{ borderColor }}>
      <Collapsible open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: textColor }}>SHORTCUTS</div>
          <ChevronRight className={`w-3 h-3 transition-transform opacity-40 ${shortcutsOpen ? 'rotate-90' : ''}`} style={{ color: textColor }} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-3">
          {[
            { label: 'Fill Tool', keys: ['F'] },
            { label: 'Erase Tool', keys: ['E'] },
            { label: 'Increase Brush Size', keys: ['.'] },
            { label: 'Decrease Brush Size', keys: [','] },
            { label: 'Undo', keys: ['⌘', 'Z'] },
            { label: 'Redo', keys: ['⌘', 'Shift', 'Z'] },
            { label: 'Save', keys: ['⌘', 'S'] },
            { label: 'Pick Color', keys: ['I'] },
            { label: 'Clear Canvas', keys: ['⌘', 'X'] }
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center text-[10px] font-bold tracking-wider" style={{ color: mutedText, textTransform: 'none' }}>
              <span className="font-mono text-[11px]">{item.label}</span>
              <div className="flex gap-1">
                {item.keys.map(k => (
                  <kbd key={k} className="px-1.5 py-0.5 rounded flex items-center justify-center font-mono font-normal" style={{ backgroundColor: darkMode ? '#1A1A1A' : '#F0F0F0', color: textColor, minWidth: '20px' }}>
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
