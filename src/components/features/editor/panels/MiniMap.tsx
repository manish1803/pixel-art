'use client';
import { useRef, useEffect } from 'react';

interface Frame {
  id: number;
  pixels: { [key: string]: string };
}

interface MiniMapProps {
  frames: Frame[];
  currentFrame: number;
  gridSize: number;
  zoom: number;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;
  darkMode: boolean;
}

export function MiniMap({ frames, currentFrame, gridSize, zoom, pan, setPan, darkMode }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 150; // Fixed size for mini-map
  const pixels = frames[currentFrame]?.pixels || {};

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = darkMode ? '#141414' : '#f5f5f5';
    ctx.fillRect(0, 0, size, size);

    const cellSize = size / gridSize;

    // Draw pixels
    Object.entries(pixels).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    });

    // Draw viewport rectangle
    // Assuming container size is roughly equivalent to canvas base size (600px)
    const viewportWidth = size / zoom;
    const viewportHeight = size / zoom;
    
    // Pan is in screen pixels, need to map to mini-map pixels
    // mini-map scale = size / 600
    const mapScale = size / 600;
    const rx = (size / 2) - (viewportWidth / 2) - (pan.x * mapScale / zoom);
    const ry = (size / 2) - (viewportHeight / 2) - (pan.y * mapScale / zoom);

    ctx.strokeStyle = darkMode ? '#00ffff' : '#0096ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(rx, ry, viewportWidth, viewportHeight);
  }, [pixels, gridSize, zoom, pan, darkMode]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const handleMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.clientX - rect.left;
      const y = moveEvent.clientY - rect.top;
      
      // Calculate new pan based on click position
      // Center of viewport should move to click position
      const mapScale = size / 600;
      const newPanX = -((x - size / 2) * zoom / mapScale);
      const newPanY = -((y - size / 2) * zoom / mapScale);
      
      setPan({ x: newPanX, y: newPanY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Trigger once for click
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mapScale = size / 600;
    const newPanX = -((x - size / 2) * zoom / mapScale);
    const newPanY = -((y - size / 2) * zoom / mapScale);
    setPan({ x: newPanX, y: newPanY });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">NAVIGATOR</div>
      <div className="border border-border bg-panel p-2 rounded-lg">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          onMouseDown={handleMouseDown}
          className="cursor-crosshair [image-rendering:pixelated]"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      </div>
    </div>
  );
}
