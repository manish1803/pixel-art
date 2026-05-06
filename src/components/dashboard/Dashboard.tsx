import React from 'react';
import { Plus } from 'lucide-react';
import { ProjectCard } from './ProjectCard';

interface Project {
  id: string;
  name: string;
  date: string;
  preview: string;
  isFavourite: boolean;
  isDraft: boolean;
  [key: string]: any;
}

interface DashboardProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  projects: Project[];
  onNewProject: () => void;
  onOpenProject: (project: Project) => void;
  onToggleFavourite: (id: string) => void;
  onToggleDraft: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

function SectionEmptyState({ label, darkMode }: { label: string; darkMode: boolean }) {
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  return (
    <div
      className="col-span-full border border-dashed flex items-center justify-center py-8 text-center"
      style={{ borderColor }}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-30" style={{ color: textColor }}>
        {label}
      </span>
    </div>
  );
}

function Section({
  title,
  icon,
  projects,
  darkMode,
  emptyLabel,
  onOpenProject,
  onToggleFavourite,
  onToggleDraft,
  onDeleteProject,
}: {
  title: string;
  icon: string;
  projects: Project[];
  darkMode: boolean;
  emptyLabel: string;
  onOpenProject: (p: Project) => void;
  onToggleFavourite: (id: string) => void;
  onToggleDraft: (id: string) => void;
  onDeleteProject: (id: string) => void;
}) {
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: textColor }}>
          {title}
        </span>
        <span className="text-[9px] font-bold opacity-30 ml-1" style={{ color: textColor }}>
          ({projects.length})
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {projects.length === 0 ? (
          <SectionEmptyState label={emptyLabel} darkMode={darkMode} />
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              darkMode={darkMode}
              onOpen={onOpenProject}
              onToggleFavourite={onToggleFavourite}
              onToggleDraft={onToggleDraft}
              onDelete={onDeleteProject}
            />
          ))
        )}
      </div>
    </section>
  );
}

export function Dashboard({
  darkMode,
  setDarkMode,
  projects,
  onNewProject,
  onOpenProject,
  onToggleFavourite,
  onToggleDraft,
  onDeleteProject,
}: DashboardProps) {
  const bgColor = darkMode ? '#0B0B0B' : '#ffffff';
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#888' : '#666';

  const favourites = projects.filter((p) => p.isFavourite);
  const drafts = projects.filter((p) => p.isDraft && !p.isFavourite);
  const all = projects;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ fontFamily: "'Geist Mono', monospace", backgroundColor: bgColor, color: textColor }}
    >
      {/* Top Nav */}
      <nav
        className="h-16 border-b flex items-center justify-between px-8 shrink-0"
        style={{ borderColor }}
      >
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-2.5 h-2.5 border" style={{ borderColor: darkMode ? '#333' : '#ddd' }} />
            <div className="w-2.5 h-2.5 bg-[#00FF41]" />
            <div className="w-2.5 h-2.5 border" style={{ borderColor: darkMode ? '#333' : '#ddd' }} />
            <div className="w-2.5 h-2.5 border" style={{ borderColor: darkMode ? '#333' : '#ddd' }} />
          </div>
          <span className="text-lg font-bold tracking-tighter" style={{ color: textColor }}>pixel</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Dark mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: mutedText }}>Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-12 h-6 border flex items-center px-1"
              style={{ borderColor, backgroundColor: darkMode ? '#1A1A1A' : '#F5F5F5' }}
            >
              <div
                className="w-4 h-4 transition-transform"
                style={{ transform: darkMode ? 'translateX(24px)' : 'translateX(0)', backgroundColor: darkMode ? '#FFF' : '#000' }}
              />
            </button>
          </div>

          {/* New Project */}
          <button
            onClick={onNewProject}
            className="h-9 px-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors"
            style={{ backgroundColor: darkMode ? 'white' : 'black', color: darkMode ? 'black' : 'white' }}
          >
            <Plus className="w-3 h-3" />
            New Project
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-10">
        {/* Favourites */}
        <Section
          title="Favourites"
          icon="★"
          projects={favourites}
          darkMode={darkMode}
          emptyLabel="Star a project to pin it here"
          onOpenProject={onOpenProject}
          onToggleFavourite={onToggleFavourite}
          onToggleDraft={onToggleDraft}
          onDeleteProject={onDeleteProject}
        />

        {/* Drafts */}
        <Section
          title="Drafts"
          icon="📄"
          projects={drafts}
          darkMode={darkMode}
          emptyLabel="No drafts yet"
          onOpenProject={onOpenProject}
          onToggleFavourite={onToggleFavourite}
          onToggleDraft={onToggleDraft}
          onDeleteProject={onDeleteProject}
        />

        {/* All Projects */}
        <Section
          title="All Projects"
          icon="📁"
          projects={all}
          darkMode={darkMode}
          emptyLabel="No saved projects yet — start drawing!"
          onOpenProject={onOpenProject}
          onToggleFavourite={onToggleFavourite}
          onToggleDraft={onToggleDraft}
          onDeleteProject={onDeleteProject}
        />
      </div>
    </div>
  );
}
