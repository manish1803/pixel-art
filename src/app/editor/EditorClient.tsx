'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopNavigation } from '@/components/shared/layout/TopNavigation';
import { ToolsPanel } from '@/components/features/editor/panels/ToolsPanel';
import { CanvasArea } from '@/components/features/canvas/CanvasArea';
import { AnimationLeftPanel } from '@/components/features/editor/panels/AnimationLeftPanel';
import { AnimationRightPanel } from '@/components/features/editor/panels/AnimationRightPanel';
import { AnimationTimeline } from '@/components/features/editor/panels/AnimationTimeline';
import { generatePNG, generateSVG } from '@/lib/utils/export';
import { usePixelHistory } from '@/hooks/usePixelHistory';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user?.id;

  const [mode, setMode] = useState<'draw' | 'animate'>('draw');
  const [darkMode, setDarkMode] = useState(true);
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
  const [saving, setSaving] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  // Check for mobile screen on mount
  useEffect(() => {
    const isMobile = window.innerWidth < 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      setShowMobileWarning(true);
    }
  }, []);

  // Load project from sessionStorage when navigating from dashboard
  useEffect(() => {
    if (!projectId) return;
    const stored = sessionStorage.getItem('open-project');
    if (!stored) return;
    try {
      const project = JSON.parse(stored);
      if (project.id === projectId) {
        setCurrentProjectId(project.id);
        setProjectName(project.name);
        setGridSize(project.gridSize || 32);
        updatePixelsWithHistory(project.pixels || {});
        if (project.frames?.length) setFrames(project.frames);
        sessionStorage.removeItem('open-project');
      }
    } catch (e) {
      console.error('Failed to parse project from sessionStorage', e);
    }
  }, [projectId, updatePixelsWithHistory]);

  // Fetch project from API if missing from sessionStorage (e.g. on refresh)
  useEffect(() => {
    if (!projectId || currentProjectId || !isAuthenticated) return;

    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const data = await res.json();
        if (data.success && data.data) {
          const project = data.data;
          setCurrentProjectId(project.id);
          setProjectName(project.name);
          setGridSize(project.gridSize || 32);
          updatePixelsWithHistory(project.pixels || {});
          if (project.frames?.length) setFrames(project.frames);
        }
      } catch (e) {
        console.error('Failed to fetch project from API', e);
      }
    };

    fetchProject();
  }, [projectId, currentProjectId, isAuthenticated, updatePixelsWithHistory]);

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
    setFrames(prev => [...prev, { id: Date.now(), pixels: {} }]);
  }, []);

  const handleDuplicateFrame = useCallback((index: number) => {
    setFrames(prev => {
      const newFrames = [...prev];
      const frameToCopy = prev[index];
      const duplicatedFrame = {
        id: Date.now(),
        pixels: { ...frameToCopy.pixels }
      };
      newFrames.splice(index + 1, 0, duplicatedFrame);
      return newFrames;
    });
    setCurrentFrame(index + 1);
  }, []);

  const handleDeleteFrame = useCallback((index: number) => {
    setFrames(prev => {
      if (prev.length <= 1) return prev;
      const newFrames = prev.filter((_, i) => i !== index);
      return newFrames;
    });
    if (currentFrame >= index && currentFrame > 0) {
      setCurrentFrame(currentFrame - 1);
    }
  }, [currentFrame]);

  const handleSaveProject = useCallback(async (preview: string, metadata: Partial<any> = {}) => {
    // If we're updating an existing project, we should preserve its current metadata
    // unless explicitly overridden.
    const projectData = {
      name: projectName || 'Untitled Project',
      date: new Date().toLocaleDateString(),
      preview,
      pixels,
      gridSize,
      frames,
      isFavourite: false,
      isDraft: true, // Default to draft for auto-saves
      ...metadata
    };

    if (isAuthenticated) {
      // ── Cloud save (MongoDB) ──────────────────────────────────────
      if (currentProjectId) {
        await fetch(`/api/projects/${currentProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });
        const data = await res.json();
        if (data.success) {
          setCurrentProjectId(data.data.id);
          // If it's a new project, we might want to update the URL without refreshing
          window.history.replaceState(null, '', `/editor?id=${data.data.id}`);
        }
      }
    } else {
      // ── Guest save (localStorage) ─────────────────────────────────
      syncToLocalStorage((prev) => {
        if (currentProjectId) {
          return prev.map((p) => (p.id === currentProjectId ? { ...p, ...projectData } : p));
        } else {
          const newId = Date.now().toString();
          setCurrentProjectId(newId);
          window.history.replaceState(null, '', `/editor?id=${newId}`);
          return [{ id: newId, ...projectData }, ...prev];
        }
      });
    }
  }, [isAuthenticated, projectName, pixels, gridSize, frames, currentProjectId, syncToLocalStorage]);

  const performSave = useCallback(async (metadata: Partial<any> = {}) => {
    setSaving(true);
    try {
      const currentPixels = mode === 'draw' ? pixels : frames[currentFrame]?.pixels || {};
      // Use 200px for cloud storage efficiency; 600px is wasteful for previews
      const previewSize = isAuthenticated ? 200 : 600;
      const preview = await generatePNG(currentPixels, gridSize, previewSize, darkMode ? '#0B0B0B' : '#ffffff');
      await handleSaveProject(preview, metadata);
    } finally {
      // Small delay so the indicator doesn't just flicker
      setTimeout(() => setSaving(false), 500);
    }
  }, [mode, pixels, frames, currentFrame, gridSize, darkMode, isAuthenticated, handleSaveProject]);

  // ── Auto-save logic ────────────────────────────────────────────────
  useEffect(() => {
    // Don't auto-save if no changes have been made yet (e.g. empty new project)
    const hasPixels = Object.keys(pixels).length > 0;
    const hasFrames = frames.some(f => Object.keys(f.pixels).length > 0);
    if (!hasPixels && !hasFrames && !projectName) return;

    const timer = setTimeout(() => {
      performSave({ isDraft: true });
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [pixels, frames, projectName, gridSize, performSave]);

  // Handle Tailwind dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-300" style={{ fontFamily: "'Geist Mono', monospace" }}>
      <AnimatePresence>
        {showMobileWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-[#141414] border border-white/10 rounded-xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white">Desktop Recommended</h3>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Precision Workspace</p>
                </div>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mb-6">
                This editor is optimized for larger screens and precision input (like a mouse or stylus). For the best experience while creating or animating, we recommend using a laptop or desktop computer.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowMobileWarning(false)}
                  className="flex-1 btn-primary py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg"
                >
                  Continue Anyway
                </button>
                <button 
                  onClick={() => router.push('/projects')}
                  className="flex-1 btn-secondary py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TopNavigation
        mode={mode}
        setMode={setMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onBackToDashboard={() => router.push('/projects')}
        projectName={projectName}
        setProjectName={setProjectName}
      />

      {/* Auto-save status indicator */}
      <div className="absolute top-[18px] left-1/2 -translate-x-1/2 pointer-events-none z-[60]">
        <div className={`px-4 py-1.5 border transition-all duration-500 flex items-center gap-2 bg-panel border-border ${saving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
            Saving to {isAuthenticated ? 'Cloud' : 'Drafts'}
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {mode === 'draw' ? (
          <>
            <div className="shrink-0 h-full">
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
            </div>

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
              onSave={() => performSave({ isDraft: false })}
              saving={saving}
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

            <div className="flex-1 flex flex-col min-w-0">
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
                onSave={() => performSave({ isDraft: false })}
                saving={saving}
              />

              <AnimationTimeline
                frames={frames}
                setFrames={setFrames}
                currentFrame={currentFrame}
                setCurrentFrame={setCurrentFrame}
                onAddFrame={handleAddFrame}
                onDuplicateFrame={handleDuplicateFrame}
                onDeleteFrame={handleDeleteFrame}
                gridSize={gridSize}
                darkMode={darkMode}
              />
            </div>

            <AnimationRightPanel
              frames={frames}
              gridSize={gridSize}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              currentFrame={currentFrame}
              setCurrentFrame={setCurrentFrame}
              totalFrames={frames.length}
              fps={fps}
              darkMode={darkMode}
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
