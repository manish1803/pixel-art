'use client';
import React from 'react';

interface PanelContainerProps {
  children: React.ReactNode;
  side: 'left' | 'right';
  width?: string;
}

export function PanelContainer({ children, side, width = 'w-72' }: PanelContainerProps) {
  return (
    <div className={`${width} ${side === 'left' ? 'border-r' : 'border-l'} flex flex-col h-full overflow-hidden bg-background border-border text-foreground transition-colors`}>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

export function PanelSection({ title, children, border = true }: { title?: string, children: React.ReactNode, border?: boolean }) {
  return (
    <div className={`flex flex-col gap-4 ${border ? 'border p-4 border-border' : ''}`}>
      {title && (
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function PanelFooter() {
  return (
    <div className="border border-border p-4 flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <div className="text-[9px] font-bold tracking-widest uppercase text-muted">DESIGNER</div>
        <a 
          href="https://github.com/Manish1803" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[10px] font-bold hover:underline text-foreground"
        >
          @mainsh1803
        </a>
      </div>
    </div>
  );
}
