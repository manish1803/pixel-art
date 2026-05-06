'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const [darkMode, setDarkMode] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pixel-art-projects');
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('pixel-art-projects', JSON.stringify(projects));
  }, [projects]);

  const handleNewProject = useCallback(() => {
    router.push('/editor');
  }, [router]);

  const handleOpenProject = useCallback((project: Project) => {
    // Store the project to open in sessionStorage so the editor page can read it
    sessionStorage.setItem('open-project', JSON.stringify(project));
    router.push(`/editor?id=${project.id}`);
  }, [router]);

  const handleToggleFavourite = useCallback((id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isFavourite: !p.isFavourite } : p));
  }, []);

  const handleToggleDraft = useCallback((id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isDraft: !p.isDraft } : p));
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    if (!window.confirm('Delete this project?')) return;
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <Dashboard
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      projects={projects}
      onNewProject={handleNewProject}
      onOpenProject={handleOpenProject}
      onToggleFavourite={handleToggleFavourite}
      onToggleDraft={handleToggleDraft}
      onDeleteProject={handleDeleteProject}
    />
  );
}
