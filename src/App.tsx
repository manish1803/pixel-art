import React, { useState, useCallback, useEffect } from 'react';
import { TopNavigation } from './components/layout/TopNavigation';
import { ToolsPanel } from './components/panels/ToolsPanel';
import { CanvasArea } from './components/canvas/CanvasArea';
import { Dashboard } from './components/dashboard/Dashboard';
import { generatePNG, generateSVG } from './utils/export';
import { AnimationLeftPanel } from './components/panels/AnimationLeftPanel';
import { AnimationRightPanel } from './components/panels/AnimationRightPanel';
import { AnimationTimeline } from './components/panels/AnimationTimeline';
import { usePixelHistory } from './hooks/usePixelHistory';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';

export default function App() {
  const [mode, setMode] = useState<'draw' | 'animate'>('draw');
  const [darkMode, setDarkMode] = useState(false);
  const [tool, setTool] = useState<'fill' | 'erase' | 'picker'>('fill');
  const [color, setColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(1);
  const [eraserSize, setEraserSize] = useState(1);
  const [gridSize, setGridSize] = useState(32);
  const [toyMode, setToyMode] = useState(false);
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [projectName, setProjectName] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  const { pixels, history, historyIndex, updatePixelsWithHistory, undo, redo, clearHistory } = usePixelHistory();

  const [fps, setFps] = useState(12);
  const [onionSkin, setOnionSkin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frames, setFrames] = useState([{ id: 1, pixels: {} as { [key: string]: string } }]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [savedProjects, setSavedProjects] = useState<{ 
    id: string; 
    name: string; 
    date: string; 
    preview: string;
    pixels: { [key: string]: string };
    gridSize: number;
    frames: { id: number; pixels: { [key: string]: string } }[];
    isFavourite: boolean;
    isDraft: boolean;
  }[]>(() => {
    const saved = localStorage.getItem('pixel-art-projects');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pixel-art-projects', JSON.stringify(savedProjects));
  }, [savedProjects]);

  const [recentColors, setRecentColors] = useState(['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']);

  const addRecentColor = useCallback((newColor: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== newColor);
      return [newColor, ...filtered].slice(0, 18);
    });
  }, []);

  const handleNewProject = useCallback(() => {
    clearHistory();
    setFrames([{ id: 1, pixels: {} }]);
    setCurrentFrame(0);
    setProjectName('');
    setCurrentProjectId(null);
    setView('editor');
  }, [clearHistory]);

  const handleAddFrame = useCallback(() => {
    setFrames(prev => [...prev, { id: prev.length + 1, pixels: {} }]);
  }, []);

  const handleSaveProject = useCallback((preview: string) => {
    setSavedProjects(prev => {
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

      if (currentProjectId) {
        return prev.map(p => p.id === currentProjectId ? { ...p, ...projectData } : p);
      } else {
        const newId = Date.now().toString();
        setCurrentProjectId(newId);
        return [{ id: newId, ...projectData }, ...prev];
      }
    });
  }, [projectName, pixels, gridSize, frames, currentProjectId]);

  const handleOpenProject = useCallback((project: any) => {
    setCurrentProjectId(project.id);
    setProjectName(project.name);
    setGridSize(project.gridSize);
    updatePixelsWithHistory(project.pixels);
    if (project.frames) setFrames(project.frames);
    setCurrentFrame(0);
    setView('editor');
  }, [updatePixelsWithHistory]);

  const handleDeleteProject = useCallback((id: string) => {
    setSavedProjects(prev => prev.filter(p => p.id !== id));
    if (currentProjectId === id) handleNewProject();
  }, [currentProjectId, handleNewProject]);

  const handleToggleFavourite = useCallback((id: string) => {
    setSavedProjects(prev => prev.map(p => p.id === id ? { ...p, isFavourite: !p.isFavourite } : p));
  }, []);

  const handleToggleDraft = useCallback((id: string) => {
    setSavedProjects(prev => prev.map(p => p.id === id ? { ...p, isDraft: !p.isDraft } : p));
  }, []);

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
    onAdjustBrush: handleAdjustBrush
  });

  const bgColor = darkMode ? '#0B0B0B' : '#ffffff';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';

  if (view === 'dashboard') {
    return (
      <Dashboard
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        projects={savedProjects}
        onNewProject={handleNewProject}
        onOpenProject={handleOpenProject}
        onToggleFavourite={handleToggleFavourite}
        onToggleDraft={handleToggleDraft}
        onDeleteProject={handleDeleteProject}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ fontFamily: "'Geist Mono', monospace", backgroundColor: bgColor, color: textColor }}>
      <TopNavigation
        mode={mode}
        setMode={setMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onBackToDashboard={() => setView('dashboard')}
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
                const blob = new Blob([svgContent], {type: 'image/svg+xml'});
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
