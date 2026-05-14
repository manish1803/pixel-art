'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Dashboard } from '@/components/features/dashboard/Dashboard';

interface Project {
  id: string;
  folderId?: string | null;
  name: string;
  date: string;
  preview: string;
  pixels: { [key: string]: string };
  gridSize: number;
  frames: { id: number; pixels: { [key: string]: string } }[];
  isFavourite: boolean;
  isDraft: boolean;
}

interface Folder {
  id: string;
  name: string;
}

export default function DashboardPage({ initialProjects = [], initialFolders = [] }: { initialProjects?: Project[], initialFolders?: Folder[] }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user?.id;

  const [darkMode, setDarkMode] = useState(true);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('recents');

  // ─── Load projects ──────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'loading') return;

    if (isAuthenticated) {
      // Background fetch to update data silently (Stale-While-Revalidate)
      Promise.all([
        fetch('/api/projects', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/folders', { cache: 'no-store' }).then((r) => r.json()),
      ])
        .then(([pRes, fRes]) => {
          if (pRes.success) setProjects(pRes.data);
          if (fRes.success) setFolders(fRes.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      // Guest mode loads from localStorage
      const saved = localStorage.getItem('pixel-art-projects');
      setProjects(saved ? JSON.parse(saved) : []);
      setFolders([]); // No folders in guest mode for now
      setLoading(false);
    }
  }, [status, isAuthenticated]);

  // Guest: persist to localStorage on every change
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      localStorage.setItem('pixel-art-projects', JSON.stringify(projects));
    }
  }, [projects, isAuthenticated, loading]);

  // Handle Tailwind dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleNewProject = useCallback(() => {
    router.push('/editor');
  }, [router]);

  const handleOpenProject = useCallback(
    (project: Project) => {
      sessionStorage.setItem('open-project', JSON.stringify(project));
      router.push(`/editor?id=${project.id}`);
    },
    [router]
  );

  const handleToggleFavourite = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'isFavourite' }),
        });
      }
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFavourite: !p.isFavourite } : p))
      );
    },
    [isAuthenticated]
  );

  const handleToggleDraft = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'isDraft' }),
        });
      }
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isDraft: !p.isDraft } : p))
      );
    },
    [isAuthenticated]
  );

  const handleSelectTemplate = useCallback((template: any) => {
    const mockId = `template_${template.id}_${Date.now()}`;
    const mockProject = {
      id: mockId,
      name: `New ${template.name}`,
      date: new Date().toLocaleDateString(),
      preview: '',
      pixels: {},
      gridSize: template.gridSize,
      palette: template.palette,
      frames: [{ id: 1, pixels: {} }],
      animationState: {
        layers: [{ id: 'layer-1', name: 'Layer 1', isVisible: true, isLocked: false, opacity: 100, blendMode: 'source-over' }],
        frames: [{ id: 'frame-1' }],
        cels: [{ layerId: 'layer-1', frameId: 'frame-1', dataId: 'data-1' }],
        celData: { 'data-1': { id: 'data-1', pixels: {} } }
      },
      isFavourite: false,
      isDraft: true
    };
    sessionStorage.setItem('open-project', JSON.stringify(mockProject));
    router.push(`/editor?id=${mockId}`);
  }, [router]);

  // ─── Folder Handlers ────────────────────────────────────────────────
  const handleCreateFolder = useCallback(async (name: string) => {
    if (!isAuthenticated) return;
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.success) setFolders(prev => [data.data, ...prev]);
  }, [isAuthenticated]);

  const handleRenameFolder = useCallback(async (id: string, name: string) => {
    if (!isAuthenticated) return;
    const res = await fetch(`/api/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.success) setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
  }, [isAuthenticated]);

  const handleDeleteFolder = useCallback(async (id: string) => {
    if (!isAuthenticated) return;
    await fetch(`/api/folders/${id}`, { method: 'DELETE' });
    setFolders(prev => prev.filter(f => f.id !== id));
    // Also update projects locally that were in this folder
    setProjects(prev => prev.map(p => p.folderId === id ? { ...p, folderId: null } : p));
  }, [isAuthenticated]);

  const handleMoveToFolder = useCallback(async (projectId: string, folderId: string | null) => {
    if (!isAuthenticated) return;
    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderId }),
    });
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, folderId } : p));
  }, [isAuthenticated]);

  return (
    <Dashboard
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      projects={projects}
      folders={folders}
      loading={loading}
      onNewProject={handleNewProject}
      onOpenProject={handleOpenProject}
      onToggleFavourite={handleToggleFavourite}
      onToggleDraft={handleToggleDraft}
      onDeleteProject={async (id: string) => {
        const project = projects.find((p) => p.id === id);
        const isTileset = (project as any)?.isTileset;
        const url = isTileset ? `/api/tilesets/${id}` : `/api/projects/${id}`;
        
        if (isAuthenticated) {
          await fetch(url, { method: 'DELETE' });
        }
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }}
      onCreateFolder={handleCreateFolder}
      onRenameFolder={handleRenameFolder}
      onDeleteFolder={handleDeleteFolder}
      onMoveToFolder={handleMoveToFolder}
      activeView={activeView}
      onViewChange={setActiveView}
      onSelectTemplate={handleSelectTemplate}
    />
  );
}
