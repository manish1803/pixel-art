'use client';
import React from 'react';
import { Clock, Grid, Layers, Trash2, Star, Plus } from 'lucide-react';
import { Project } from './Dashboard';

interface SidebarProps {
  favourites: Project[];
  onOpenProject: (project: Project) => void;
  onNewProject: () => void;
}

export function Sidebar({ favourites, onOpenProject, onNewProject }: SidebarProps) {
  return (
    <div className="w-64 h-full bg-zinc-950 border-r border-border flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* New Project Button */}
        <button
          onClick={onNewProject}
          className="w-full h-10 px-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors shadow-lg active:scale-95 bg-foreground text-background rounded-lg"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>

        {/* Main Navigation */}
        <div className="space-y-1">
          <SidebarLink icon={<Clock className="w-4 h-4" />} label="Recents" active />
          <SidebarLink icon={<Grid className="w-4 h-4" />} label="All Projects" />
          <SidebarLink icon={<Layers className="w-4 h-4" />} label="Templates" />
          <SidebarLink icon={<Trash2 className="w-4 h-4" />} label="Trash" />
        </div>

        {/* Pinned Projects */}
        <div className="space-y-2">
          <h3 className="text-[9px] font-bold uppercase tracking-widest text-muted px-3">
            Pinned Projects
          </h3>
          <div className="space-y-1">
            {favourites.length === 0 ? (
              <div className="text-[10px] text-muted px-3 py-1 opacity-50">
                No pinned projects
              </div>
            ) : (
              favourites.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onOpenProject(project)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground/80 hover:text-foreground hover:bg-panel/50 rounded-lg transition-colors text-left"
                >
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="truncate">{project.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer / Storage */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-muted px-2">
          <span>Local Storage</span>
          <span>45%</span>
        </div>
        <div className="w-full h-1.5 bg-panel rounded-full overflow-hidden">
          <div className="h-full bg-accent w-[45%]" />
        </div>
      </div>
    </div>
  );
}

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function SidebarLink({ icon, label, active = false }: SidebarLinkProps) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
        active
          ? 'bg-panel text-foreground'
          : 'text-muted hover:text-foreground hover:bg-panel/30'
      }`}
    >
      <span className={active ? 'text-accent' : 'text-muted'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
