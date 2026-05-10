'use client';

import { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopNavigation } from '@/components/shared/layout/TopNavigation';
import { ToolsPanel } from '@/components/features/editor/panels/ToolsPanel';
import { CanvasArea } from '@/components/features/canvas/CanvasArea';
import { AnimationRightPanel } from '@/components/features/editor/panels/AnimationRightPanel';
import { AnimationTimeline } from '@/components/features/editor/panels/AnimationTimeline';
import { generatePNG, generateSVG } from '@/lib/utils/export';
import { usePixelHistory } from '@/hooks/usePixelHistory';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { CommandPalette, Command } from '@/components/features/editor/CommandPalette';
import { ShortcutsReference } from '@/components/features/editor/ShortcutsReference';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user?.id;

  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [tool, setTool] = useState<'fill' | 'erase' | 'picker'>('fill');
  const [color, setColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(1);
  const [mirrorMode, setMirrorMode] = useState<'none' | 'vertical' | 'horizontal' | 'both'>('none');
  const [gridSize, setGridSize] = useState(32);
  const [toyMode, setToyMode] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [recentColors, setRecentColors] = useState(['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']);

  const { frames, setFrames, setFramesWithoutHistory, undo, redo, clearHistory } = usePixelHistory([{ id: 1, pixels: {} }]);

  const [fps, setFps] = useState(12);
  const [onionSkin, setOnionSkin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  // Timeline resizing state
  const [timelineHeight, setTimelineHeight] = useState(220);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);

  // Zoom & Pan State (Lifted for Mini-map)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const startTimelineDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingTimeline(true);
  }, []);

  useEffect(() => {
    if (!isDraggingTimeline) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      setTimelineHeight(Math.max(100, Math.min(600, newHeight)));
    };
    const handleMouseUp = () => setIsDraggingTimeline(false);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTimeline]);

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
        if (project.frames?.length) {
          setFramesWithoutHistory(project.frames);
        } else if (project.pixels) {
          setFramesWithoutHistory([{ id: 1, pixels: project.pixels }]);
        }
        sessionStorage.removeItem('open-project');
      }
    } catch (e) {
      console.error('Failed to parse project from sessionStorage', e);
    }
  }, [projectId, setFramesWithoutHistory]);

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
          if (project.frames?.length) {
            setFramesWithoutHistory(project.frames);
          } else if (project.pixels) {
            setFramesWithoutHistory([{ id: 1, pixels: project.pixels }]);
          }
        }
      } catch (e) {
        console.error('Failed to fetch project from API', e);
      }
    };

    fetchProject();
  }, [projectId, currentProjectId, isAuthenticated, setFramesWithoutHistory]);

  const syncToLocalStorage = useCallback((updater: (prev: any[]) => any[]) => {
    const saved = localStorage.getItem('pixel-art-projects');
    const all = saved ? JSON.parse(saved) : [];
    const updated = updater(all);
    localStorage.setItem('pixel-art-projects', JSON.stringify(updated));
  }, []);

  const addRecentColor = useCallback((newColor: string) => {
    setRecentColors(prev => [newColor, ...prev.filter(c => c.toLowerCase() !== newColor.toLowerCase())].slice(0, 18));
  }, []);

  const handleNewProject = useCallback(() => {
    clearHistory();
    setFrames([{ id: 1, pixels: {} }]);
    setCurrentFrame(0);
    setProjectName('');
    setCurrentProjectId(null);
  }, [clearHistory]);

  const handleAddFrame = useCallback(() => {
    setFrames([...frames, { id: Date.now(), pixels: {} }]);
  }, [frames, setFrames]);

  const handleDuplicateFrame = useCallback((index: number) => {
    const newFrames = [...frames];
    const frameToCopy = frames[index];
    const duplicatedFrame = {
      id: Date.now(),
      pixels: { ...frameToCopy.pixels }
    };
    newFrames.splice(index + 1, 0, duplicatedFrame);
    setFrames(newFrames);
    setCurrentFrame(index + 1);
  }, [frames, setFrames]);

  const handleDeleteFrame = useCallback((index: number) => {
    if (frames.length <= 1) return;
    const newFrames = frames.filter((_, i) => i !== index);
    setFrames(newFrames);
    if (currentFrame >= index && currentFrame > 0) {
      setCurrentFrame(currentFrame - 1);
    }
  }, [frames, currentFrame, setFrames]);

  const handleSaveProject = useCallback(async (preview: string, metadata: Partial<any> = {}) => {
    // If we're updating an existing project, we should preserve its current metadata
    // unless explicitly overridden.
    const projectData = {
      name: projectName || 'Untitled Project',
      date: new Date().toLocaleDateString(),
      preview,
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
  }, [isAuthenticated, projectName, gridSize, frames, currentProjectId, syncToLocalStorage]);

  const performSave = useCallback(async (metadata: Partial<any> = {}) => {
    setSaving(true);
    try {
      const currentPixels = frames[currentFrame]?.pixels || {};
      // Use 200px for cloud storage efficiency; 600px is wasteful for previews
      const previewSize = isAuthenticated ? 200 : 600;
      const preview = await generatePNG(currentPixels, gridSize, previewSize, darkMode ? '#0B0B0B' : '#ffffff');
      await handleSaveProject(preview, metadata);
    } finally {
      // Small delay so the indicator doesn't just flicker
      setTimeout(() => setSaving(false), 500);
    }
  }, [frames, currentFrame, gridSize, darkMode, isAuthenticated, handleSaveProject]);

  // ── Auto-save logic ────────────────────────────────────────────────
  useEffect(() => {
    // Don't auto-save if no changes have been made yet (e.g. empty new project)
    const hasFrames = frames.some(f => Object.keys(f.pixels).length > 0);
    if (!hasFrames && !projectName) return;

    const timer = setTimeout(() => {
      performSave({ isDraft: true });
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [frames, projectName, gridSize, performSave]);

  // Handle Tailwind dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const performClear = useCallback(() => {
    const newFrames = [...frames];
    newFrames[currentFrame] = { ...newFrames[currentFrame], pixels: {} };
    setFrames(newFrames);
  }, [frames, setFrames, currentFrame]);

  const handleAdjustBrush = useCallback((increment: boolean) => {
    setBrushSize(s => increment ? Math.min(16, s + 1) : Math.max(1, s - 1));
  }, []);

  const commands = useMemo<Command[]>(() => [
    { id: 'shortcuts', title: 'Open Keyboard Shortcuts', category: 'General', action: () => setIsShortcutsOpen(true), shortcut: '?' },
    { id: 'fill', title: 'Fill Tool', category: 'Tools', action: () => setTool('fill'), shortcut: 'F' },
    { id: 'erase', title: 'Erase Tool', category: 'Tools', action: () => setTool('erase'), shortcut: 'E' },
    { id: 'picker', title: 'Color Picker', category: 'Tools', action: () => setTool('picker'), shortcut: 'I' },
    { id: 'undo', title: 'Undo', category: 'History', action: undo, shortcut: 'Cmd+Z' },
    { id: 'redo', title: 'Redo', category: 'History', action: redo, shortcut: 'Cmd+Shift+Z' },
    { id: 'clear', title: 'Clear Canvas', category: 'Canvas', action: performClear, shortcut: 'Cmd+X' },
    { id: 'save', title: 'Save Project', category: 'File', action: () => performSave({ isDraft: false }), shortcut: 'Cmd+S' },
    { id: 'toggle-dark', title: 'Toggle Dark Mode', category: 'Settings', action: () => setDarkMode(prev => !prev) },
    { id: 'toggle-timeline', title: 'Toggle Timeline', category: 'View', action: () => setIsTimelineExpanded(prev => !prev) },
    { id: 'toggle-onion', title: 'Toggle Onion Skin', category: 'View', action: () => setOnionSkin(prev => !prev) },
  ], [setTool, undo, redo, performClear, performSave, setDarkMode, setIsTimelineExpanded, setOnionSkin, setIsShortcutsOpen]);

  useGlobalShortcuts({
    onUndo: undo,
    onRedo: redo,
    onSave: performSave,
    onClear: performClear,
    onSetTool: setTool,
    onAdjustBrush: handleAdjustBrush,
    onToggleCommandPalette: () => setIsCommandPaletteOpen(prev => !prev),
    onToggleShortcuts: () => setIsShortcutsOpen(prev => !prev),
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
        onUndo={undo}
        onRedo={redo}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onBackToDashboard={() => router.push('/projects')}
        projectName={projectName}
        setProjectName={setProjectName}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
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

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <div className="shrink-0 h-full z-10">
          <ToolsPanel
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            mirrorMode={mirrorMode}
            setMirrorMode={setMirrorMode}
            recentColors={recentColors}
            addRecentColor={addRecentColor}
            darkMode={darkMode}
            onNewProject={handleNewProject}
          />
        </div>

        {/* Center Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background/50 relative overflow-hidden">
          <div className="flex-1 relative overflow-hidden min-h-0">
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
              mirrorMode={mirrorMode}
              onionSkin={onionSkin}
              previousFramePixels={currentFrame > 0 ? frames[currentFrame - 1].pixels : undefined}
              pixels={frames[currentFrame]?.pixels || {}}
              setPixels={(newPixels) => {
                const newFrames = [...frames];
                newFrames[currentFrame] = { ...newFrames[currentFrame], pixels: newPixels };
                setFrames(newFrames);
              }}
              darkMode={darkMode}
              onSave={() => performSave({ isDraft: false })}
              saving={saving}
              zoom={zoom}
              setZoom={setZoom}
              pan={pan}
              setPan={setPan}
            />
          </div>

          {/* Timeline Toggle Divider */}
          <div 
            onMouseDown={isTimelineExpanded ? startTimelineDrag : undefined}
            className={`w-full flex justify-center relative bg-background border-t border-border shrink-0 z-20 py-1 ${isTimelineExpanded ? 'cursor-ns-resize hover:bg-accent/20 transition-colors group' : ''}`}
          >
            <div className={`absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isDraggingTimeline ? 'opacity-100' : ''}`} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTimelineExpanded(!isTimelineExpanded);
              }}
              className="absolute -top-[14px] bg-panel border border-border px-4 py-1 text-[9px] font-bold tracking-widest uppercase rounded-full shadow-lg hover:bg-accent hover:text-black transition-colors"
            >
              {isTimelineExpanded ? '▼ Close Timeline' : '▲ Open Timeline'}
            </button>
          </div>

          {/* Bottom Bar: Timeline */}
          <div 
            className="bg-background flex flex-col overflow-hidden"
            style={{ 
              height: isTimelineExpanded ? timelineHeight : 0,
              transition: isDraggingTimeline ? 'none' : 'height 300ms ease-in-out'
            }}
          >
            <AnimationTimeline
              frames={frames}
              setFrames={setFrames}
              currentFrame={currentFrame}
              setCurrentFrame={setCurrentFrame}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              fps={fps}
              setFps={setFps}
              onAddFrame={handleAddFrame}
              onDuplicateFrame={handleDuplicateFrame}
              onDeleteFrame={handleDeleteFrame}
              gridSize={gridSize}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="shrink-0 h-full z-10">
          <AnimationRightPanel
            frames={frames}
            gridSize={gridSize}
            setGridSize={setGridSize}
            currentFrame={currentFrame}
            onionSkin={onionSkin}
            setOnionSkin={setOnionSkin}
            darkMode={darkMode}
            onExportPNG={async () => {
              const dataUrl = await generatePNG(frames[currentFrame].pixels, gridSize, 600, darkMode ? '#000000' : '#ffffff');
              const link = document.createElement('a');
              link.download = `${projectName || 'pixel-art'}.png`;
              link.href = dataUrl;
              link.click();
            }}
            onExportSVG={() => {
              const svgContent = generateSVG(frames[currentFrame].pixels, gridSize, 600);
              const blob = new Blob([svgContent], { type: 'image/svg+xml' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.download = `${projectName || 'pixel-art'}.svg`;
              link.href = url;
              link.click();
              URL.revokeObjectURL(url);
            }}
            zoom={zoom}
            pan={pan}
            setPan={setPan}
          />
        </div>
      </div>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />
      <ShortcutsReference
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
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
