'use client';
import React, { useRef, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CustomNumberInput } from '../ui/CustomNumberInput';

interface CanvasAreaProps {
  projectName: string;
  setProjectName: (name: string) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  toyMode: boolean;
  setToyMode: (value: boolean) => void;
  tool: 'fill' | 'erase' | 'picker';
  setTool: (tool: 'fill' | 'erase' | 'picker') => void;
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  pixels: { [key: string]: string };
  setPixels: (pixels: { [key: string]: string }) => void;
  mode: 'draw' | 'animate';
  darkMode: boolean;
  onNewProject: () => void;
  onSaveProject: (previewUrl: string) => void;
}

export const CanvasArea = React.memo(function CanvasArea({
  projectName,
  setProjectName,
  gridSize,
  setGridSize,
  toyMode,
  setToyMode,
  tool,
  setTool,
  color,
  setColor,
  brushSize,
  pixels,
  setPixels,
  mode,
  darkMode,
  onNewProject,
  onSaveProject,
}: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const canvasSize = 600;
  const cellSize = canvasSize / gridSize;

  const bgColor = darkMode ? '#0B0B0B' : '#ffffff';
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const panelBg = darkMode ? '#111' : '#f9f9f9';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#888' : '#999';
  const gridLineColor = darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
  const canvasBg = darkMode ? '#000' : '#fff';

  useEffect(() => {
    drawCanvas();
  }, [pixels, gridSize, darkMode, toyMode]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    if (toyMode) {
      const defaultColor = darkMode ? '#1a1a1a' : '#ffffff';
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const key = `${x},${y}`;
          const pColor = pixels[key] || defaultColor;

          // Base block
          ctx.fillStyle = pColor;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

          const centerX = x * cellSize + cellSize / 2;
          const centerY = y * cellSize + cellSize / 2;
          const radius = cellSize * 0.35;

          // Drop shadow for the stud
          ctx.beginPath();
          ctx.arc(centerX + cellSize * 0.04, centerY + cellSize * 0.04, radius, 0, Math.PI * 2);
          ctx.fillStyle = darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.15)';
          ctx.fill();

          // Main stud circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fillStyle = pColor;
          ctx.fill();

          // 3D Highlight
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          const grad = ctx.createLinearGradient(
            centerX - radius, centerY - radius, 
            centerX + radius, centerY + radius
          );
          grad.addColorStop(0, darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }
    } else {
      // Draw standard pixels
      Object.entries(pixels).forEach(([key, color]) => {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      });
    }

    // Draw grid
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      const pos = Math.round(i * cellSize);
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvasSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvasSize, pos);
      ctx.stroke();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.floor((e.clientX - rect.left) / (rect.width / gridSize));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / gridSize));
    
    if (tool === 'picker') {
      const pickedColor = pixels[`${x},${y}`] || (darkMode ? '#000000' : '#ffffff');
      setColor(pickedColor);
      setTool('fill');
      return;
    }
    
    const newPixels = { ...pixels };
    const radius = Math.floor(brushSize / 2);
    const start = brushSize % 2 === 0 ? -radius : -radius;
    const end = brushSize % 2 === 0 ? radius - 1 : radius;

    for (let dx = start; dx <= end; dx++) {
      for (let dy = start; dy <= end; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
          if (tool === 'erase') {
            delete newPixels[`${nx},${ny}`];
          } else {
            newPixels[`${nx},${ny}`] = color;
          }
        }
      }
    }
    setPixels(newPixels);
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    handleCanvasClick(e);
  };

  const handleClear = () => {
    setPixels({});
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${projectName || 'pixel-art'}.png`;
    link.href = canvas.toDataURL();
    link.click();
    setExportOpen(false);
  };

  const handleExportSVG = () => {
    const svgSize = gridSize * 10;
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridSize} ${gridSize}" width="${svgSize}" height="${svgSize}">`;
    Object.entries(pixels).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number);
      svgContent += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}" />`;
    });
    svgContent += `</svg>`;
    
    const blob = new Blob([svgContent], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${projectName || 'pixel-art'}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preview = canvas.toDataURL('image/png');
    onSaveProject(preview);
  };

  const getCursor = () => {
    if (tool === 'picker') {
      const stroke = darkMode ? 'white' : 'black';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>`;
      return `url("data:image/svg+xml;base64,${btoa(svg)}") 2 22, crosshair`;
    }
    return 'crosshair';
  };

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col p-12" style={{ fontFamily: "'Geist Mono', monospace", backgroundColor: bgColor }}>
      {mode === 'draw' && (
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-14 border flex items-center px-6" style={{ backgroundColor: darkMode ? '#1A1A1A' : '#F5F5F5', borderColor }}>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full bg-transparent border-0 outline-none text-sm font-normal focus:ring-0 focus:outline-none placeholder:opacity-50 md:text-sm"
              style={{ color: textColor }}
            />
          </div>
          <button
            onClick={onNewProject}
            className="h-14 border px-8 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-accent shrink-0"
            style={{ backgroundColor: 'transparent', borderColor, color: textColor }}
          >
            New Canvas
          </button>
        </div>
      )}


      <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onMouseDown={(e) => {
            setIsDrawing(true);
            handleCanvasClick(e);
          }}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          onMouseMove={handleCanvasMove}
          className="border shadow-2xl max-w-full max-h-full object-contain"
          style={{ cursor: getCursor(), imageRendering: 'pixelated', borderColor, width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>

      <div className="flex items-center justify-between mt-12 shrink-0">

        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">CANVAS SIZE</div>
            <div className="w-40">
              <CustomNumberInput 
                value={`${gridSize} X ${gridSize}`}
                onIncrement={() => setGridSize(Math.min(64, gridSize + 8))}
                onDecrement={() => setGridSize(Math.max(8, gridSize - 8))}
                darkMode={darkMode}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">TOY MODE</div>
            <button 
              onClick={() => setToyMode(!toyMode)}
              className="w-12 h-6 border flex items-center px-1"
              style={{ borderColor, backgroundColor: toyMode ? (darkMode ? '#1F1F1F' : '#F5F5F5') : 'transparent' }}
            >
              <div 
                className="w-4 h-4 transition-transform" 
                style={{ 
                  transform: toyMode ? 'translateX(24px)' : 'translateX(0)',
                  backgroundColor: toyMode ? (darkMode ? '#FFF' : '#000') : (darkMode ? '#666' : '#999')
                }}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end">
          <button
            onClick={handleClear}
            className="border px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-accent"
            style={{ backgroundColor: 'transparent', borderColor, color: textColor }}
          >
            Clear
          </button>

          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="border px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-accent flex items-center gap-2"
              style={{ backgroundColor: exportOpen ? (darkMode ? '#1A1A1A' : '#F5F5F5') : 'transparent', borderColor, color: textColor }}
            >
              <span>Export</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${exportOpen ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            
            {exportOpen && (
              <div className="absolute bottom-full mb-2 right-0 border flex flex-col min-w-[120px] shadow-2xl z-50" style={{ backgroundColor: panelBg, borderColor }}>
                <button onClick={handleExportPNG} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-accent transition-colors border-b" style={{ borderColor, color: textColor }}>
                  Export PNG
                </button>
                <button onClick={handleExportSVG} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-accent transition-colors" style={{ color: textColor }}>
                  Export SVG
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="px-8 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-transform active:scale-95"
            style={{ backgroundColor: darkMode ? 'white' : 'black', color: darkMode ? 'black' : 'white' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
});
