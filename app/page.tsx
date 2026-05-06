'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Dashboard } from '../src/components/dashboard/Dashboard';

interface Project {
  id: string;
  name: string;
  date: string;
  preview: string;
  pixels: { [key: string]: string };
  gridSize: number;
  frames: { id: number; pixels: { [key: string]: string } }[];
  isFavourite: boolean;
  isDraft: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user?.id;

  const [darkMode, setDarkMode] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Load projects ──────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'loading') return;

    if (isAuthenticated) {
      fetch('/api/projects')
        .then((r) => r.json())
        .then((res) => {
          if (res.success) setProjects(res.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      const saved = localStorage.getItem('pixel-art-projects');
      setProjects(saved ? JSON.parse(saved) : []);
      setLoading(false);
    }
  }, [status, isAuthenticated]);

  // Guest: persist to localStorage on every change
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      localStorage.setItem('pixel-art-projects', JSON.stringify(projects));
    }
  }, [projects, isAuthenticated, loading]);

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

  return (
    <Dashboard
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      projects={projects}
      loading={loading}
      onNewProject={handleNewProject}
      onOpenProject={handleOpenProject}
      onToggleFavourite={handleToggleFavourite}
      onToggleDraft={handleToggleDraft}
      onDeleteProject={handleDeleteProject}
    />
  );
}
