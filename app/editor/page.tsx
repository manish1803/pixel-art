'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopNavigation } from '../../src/components/layout/TopNavigation';
import { ToolsPanel } from '../../src/components/panels/ToolsPanel';
import { CanvasArea } from '../../src/components/canvas/CanvasArea';
import { AnimationLeftPanel } from '../../src/components/panels/AnimationLeftPanel';
import { AnimationRightPanel } from '../../src/components/panels/AnimationRightPanel';
import { AnimationTimeline } from '../../src/components/panels/AnimationTimeline';
import { generatePNG, generateSVG } from '../../src/utils/export';
import { usePixelHistory } from '../../src/hooks/usePixelHistory';
import { useGlobalShortcuts } from '../../src/hooks/useGlobalShortcuts';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');

  const [mode, setMode] = useState<'draw' | 'animate'>('draw');
  const [darkMode, setDarkMode] = useState(false);
  const [tool, setTool] = useState<'fill' | 'erase' | 'picker'>('fill');
  const [color, setColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(1);
  const [eraserSize, setEraserSize] = useState(1);
  const [gridSize, setGridSize] = useState(32);
  const [toyMode, setToyMode] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [recentColors, setRecentColors] = useState(['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']);

  const { pixels, updatePixelsWithHistory, undo, redo, clearHistory } = usePixelHistory();

  const [fps, setFps] = useState(12);
  const [onionSkin, setOnionSkin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frames, setFrames] = useState([{ id: 1, pixels: {} as { [key: string]: string } }]);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Load project from sessionStorage when navigating from dashboard
  useEffect(() => {
    if (!projectId) return;
    const stored = sessionStorage.getItem('open-project');
    if (!stored) return;
    const project = JSON.parse(stored);
    if (project.id === projectId) {
      setCurrentProjectId(project.id);
      setProjectName(project.name);
      setGridSize(project.gridSize || 32);
      updatePixelsWithHistory(project.pixels || {});
      if (project.frames?.length) setFrames(project.frames);
      sessionStorage.removeItem('open-project');
    }
  }, [projectId]);

  const syncToLocalStorage = useCallback((updater: (prev: any[]) => any[]) => {
    const saved = localStorage.getItem('pixel-art-projects');
    const all = saved ? JSON.parse(saved) : [];
    const updated = updater(all);
    localStorage.setItem('pixel-art-projects', JSON.stringify(updated));
  }, []);

  const addRecentColor = useCallback((newColor: string) => {
    setRecentColors(prev => [newColor, ...prev.filter(c => c !== newColor)].slice(0, 18));
  }, []);

  const handleNewProject = useCallback(() => {
    clearHistory();
    setFrames([{ id: 1, pixels: {} }]);
    setCurrentFrame(0);
    setProjectName('');
    setCurrentProjectId(null);
  }, [clearHistory]);

  const handleAddFrame = useCallback(() => {
    setFrames(prev => [...prev, { id: prev.length + 1, pixels: {} }]);
  }, []);

  const handleSaveProject = useCallback((preview: string) => {
    const projectData = {
      name: projectName || 'Untitled Project',
      date: new Date().toLocaleDateString(),
      preview,
      pixels,
      gridSize,
      frames,
      isFavourite: false,
      isDraft: false,
    };

    syncToLocalStorage(prev => {
      if (currentProjectId) {
        return prev.map(p => p.id === currentProjectId ? { ...p, ...projectData } : p);
      } else {
        const newId = Date.now().toString();
        setCurrentProjectId(newId);
        return [{ id: newId, ...projectData }, ...prev];
      }
    });
  }, [projectName, pixels, gridSize, frames, currentProjectId, syncToLocalStorage]);

  const performSave = useCallback(async () => {
    const currentPixels = mode === 'draw' ? pixels : frames[currentFrame]?.pixels || {};
    const preview = await generatePNG(currentPixels, gridSize, 600, darkMode ? '#000000' : '#ffffff');
    handleSaveProject(preview);
  }, [mode, pixels, frames, currentFrame, gridSize, darkMode, handleSaveProject]);

  const performClear = useCallback(() => {
    if (mode === 'draw') {
      updatePixelsWithHistory({});
    } else {
      setFrames(prev => {
        const newFrames = [...prev];
        newFrames[currentFrame] = { ...newFrames[currentFrame], pixels: {} };
        return newFrames;
      });
    }
  }, [mode, updatePixelsWithHistory, currentFrame]);

  const handleAdjustBrush = useCallback((increment: boolean) => {
    if (mode === 'draw') {
      setBrushSize(s => increment ? Math.min(16, s + 1) : Math.max(1, s - 1));
    } else {
      setEraserSize(s => increment ? Math.min(16, s + 1) : Math.max(1, s - 1));
    }
  }, [mode]);

  useGlobalShortcuts({
    onUndo: undo,
    onRedo: redo,
    onSave: performSave,
    onClear: performClear,
    onSetTool: setTool,
    onAdjustBrush: handleAdjustBrush,
  });

  const bgColor = darkMode ? '#0B0B0B' : '#ffffff';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';

  return (
    <div className="h-screen flex flex-col" style={{ fontFamily: "'Geist Mono', monospace", backgroundColor: bgColor, color: textColor }}>
      <TopNavigation
        mode={mode}
        setMode={setMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onBackToDashboard={() => router.push('/')}
      />

      <div className="flex-1 flex overflow-hidden">
        {mode === 'draw' ? (
          <>
            <ToolsPanel
              tool={tool}
              setTool={setTool}
              color={color}
              setColor={setColor}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              recentColors={recentColors}
              addRecentColor={addRecentColor}
              darkMode={darkMode}
              onNewProject={handleNewProject}
            />

            <CanvasArea
              projectName={projectName}
              setProjectName={setProjectName}
              gridSize={gridSize}
              setGridSize={setGridSize}
              toyMode={toyMode}
              setToyMode={setToyMode}
              tool={tool}
              setTool={setTool}
              color={color}
              setColor={setColor}
              brushSize={brushSize}
              pixels={pixels}
              setPixels={updatePixelsWithHistory}
              mode={mode}
              darkMode={darkMode}
              onNewProject={handleNewProject}
              onSaveProject={handleSaveProject}
            />
          </>
        ) : (
          <>
            <AnimationLeftPanel
              tool={tool}
              setTool={setTool}
              eraserSize={eraserSize}
              setEraserSize={setEraserSize}
              gridSize={gridSize}
              setGridSize={setGridSize}
              fps={fps}
              setFps={setFps}
              onionSkin={onionSkin}
              setOnionSkin={setOnionSkin}
              darkMode={darkMode}
              onNewProject={handleNewProject}
              color={color}
              setColor={setColor}
              recentColors={recentColors}
              addRecentColor={addRecentColor}
            />

            <div className="flex-1 flex flex-col">
              <CanvasArea
                projectName={projectName}
                setProjectName={setProjectName}
                gridSize={gridSize}
                setGridSize={setGridSize}
                toyMode={toyMode}
                setToyMode={setToyMode}
                tool={tool}
                setTool={setTool}
                color={color}
                setColor={setColor}
                brushSize={eraserSize}
                pixels={frames[currentFrame]?.pixels || {}}
                setPixels={(newPixels) => {
                  const newFrames = [...frames];
                  newFrames[currentFrame] = { ...newFrames[currentFrame], pixels: newPixels };
                  setFrames(newFrames);
                }}
                mode={mode}
                darkMode={darkMode}
                onNewProject={handleNewProject}
                onSaveProject={handleSaveProject}
              />

              <AnimationTimeline
                frames={frames}
                currentFrame={currentFrame}
                setCurrentFrame={setCurrentFrame}
                onAddFrame={handleAddFrame}
                darkMode={darkMode}
              />
            </div>

            <AnimationRightPanel
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              currentFrame={currentFrame}
              totalFrames={frames.length}
              fps={fps}
              darkMode={darkMode}
              onSave={async () => {
                const preview = await generatePNG(frames[currentFrame].pixels, gridSize, 600, darkMode ? '#000000' : '#ffffff');
                handleSaveProject(preview);
              }}
              onExportPNG={async () => {
                const dataUrl = await generatePNG(frames[currentFrame].pixels, gridSize, 600, darkMode ? '#000000' : '#ffffff');
                const link = document.createElement('a');
                link.download = `${projectName || 'pixel-art-frame'}.png`;
                link.href = dataUrl;
                link.click();
              }}
              onExportSVG={() => {
                const svgContent = generateSVG(frames[currentFrame].pixels, gridSize, 600);
                const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `${projectName || 'pixel-art-frame'}.svg`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center" style={{ fontFamily: "'Geist Mono', monospace" }}>
        Loading editor...
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
