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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user?.id;

  const [darkMode, setDarkMode] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Load projects ──────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'loading') return;

    if (isAuthenticated) {
      Promise.all([
        fetch('/api/projects').then((r) => r.json()),
        fetch('/api/folders').then((r) => r.json()),
      ])
        .then(([pRes, fRes]) => {
          if (pRes.success) setProjects(pRes.data);
          if (fRes.success) setFolders(fRes.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
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

  const handleDeleteProject = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [isAuthenticated]
  );

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
      onDeleteProject={handleDeleteProject}
      onCreateFolder={handleCreateFolder}
      onRenameFolder={handleRenameFolder}
      onDeleteFolder={handleDeleteFolder}
      onMoveToFolder={handleMoveToFolder}
    />
  );
}
