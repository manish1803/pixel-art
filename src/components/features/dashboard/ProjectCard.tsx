'use client';
import React, { useState } from 'react';
import { Star, Pencil, Trash2, FileText, Folder as FolderIcon } from 'lucide-react';
import { DeleteModal } from '@/components/ui/DeleteModal';

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
  folderId?: string | null;
  [key: string]: any;
}

interface Folder {
  id: string;
  name: string;
}

interface ProjectCardProps {
  project: Project;
  darkMode: boolean;
  folders: Folder[];
  onOpen: (project: Project) => void;
  onToggleFavourite: (id: string) => void;
  onToggleDraft: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveToFolder: (projectId: string, folderId: string | null) => void;
}

export function ProjectCard({ 
  project, 
  darkMode, 
  folders,
  onOpen, 
  onToggleFavourite, 
  onToggleDraft, 
  onDelete,
  onMoveToFolder
}: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);

  return (
    <div
      className={`relative group flex flex-col border transition-all duration-200 cursor-pointer bg-panel ${
        hovered ? 'border-foreground shadow-xl' : 'border-border'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(project)}
    >
      {/* Preview Image */}
      <div className="aspect-square w-full overflow-hidden relative bg-background">
        {project.preview ? (
          <img
            src={project.preview}
            alt={project.name}
            className={`w-full h-full object-contain [image-rendering:pixelated] transition-transform duration-300 ${hovered ? 'scale-105' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            <div className="w-12 h-12 border border-dashed border-foreground" />
          </div>
        )}

        {/* Draft badge */}
        {project.isDraft && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest bg-panel text-muted border border-border">
            Draft
          </div>
        )}

        {/* Hover Action Overlay */}
        {hovered && (
          <div
            className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Favourite */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavourite(project.id); }}
              className={`w-8 h-8 flex items-center justify-center border transition-colors hover:bg-yellow-400/10 ${
                project.isFavourite ? 'text-yellow-500' : 'text-muted'
              } border-border`}
              title={project.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Star className="w-3.5 h-3.5" fill={project.isFavourite ? 'currentColor' : 'none'} />
            </button>

            {/* Draft toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleDraft(project.id); }}
              className={`w-8 h-8 flex items-center justify-center border border-border transition-colors hover:bg-accent hover:text-black ${
                project.isDraft ? 'text-foreground' : 'text-muted'
              }`}
              title={project.isDraft ? 'Mark as complete' : 'Mark as draft'}
            >
              <FileText className="w-3.5 h-3.5" />
            </button>

            {/* Open / Edit */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(project); }}
              className="w-8 h-8 flex items-center justify-center border border-border text-foreground transition-colors hover:bg-accent hover:text-black"
              title="Open project"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              className="w-8 h-8 flex items-center justify-center border border-border text-red-500 transition-colors hover:bg-red-500/10"
              title="Delete project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Move to Folder */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)}
                className={`w-8 h-8 flex items-center justify-center border border-border transition-colors hover:bg-accent hover:text-black text-foreground ${
                  isMoveMenuOpen ? 'bg-panel' : 'bg-transparent'
                }`}
                title="Move to folder"
              >
                <FolderIcon className="w-3.5 h-3.5" />
              </button>

              {isMoveMenuOpen && (
                <div className="absolute bottom-full mb-2 right-0 border border-border bg-panel flex flex-col min-w-[140px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-3 py-2 text-[8px] font-bold uppercase tracking-widest border-b border-border opacity-40">
                    Move to...
                  </div>
                  <button 
                    onClick={() => { onMoveToFolder(project.id, null); setIsMoveMenuOpen(false); }}
                    className={`px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider hover:bg-accent hover:text-black transition-colors flex items-center gap-2 ${
                      !project.folderId ? 'text-accent' : 'text-foreground'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full border ${!project.folderId ? 'border-accent bg-accent' : 'border-muted'}`} />
                    Root Directory
                  </button>
                  {folders.map(f => (
                    <button 
                      key={f.id}
                      onClick={() => { onMoveToFolder(project.id, f.id); setIsMoveMenuOpen(false); }}
                      className={`px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider hover:bg-accent hover:text-black transition-colors flex items-center gap-2 ${
                        project.folderId === f.id ? 'text-accent' : 'text-foreground'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full border ${project.folderId === f.id ? 'border-accent bg-accent' : 'border-muted'}`} />
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-3 py-2.5 border-t border-border relative">
        <div className="text-[10px] font-bold tracking-wider truncate text-foreground">
          {project.name || 'Untitled'}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <div className="text-[9px] uppercase tracking-widest opacity-40 text-foreground flex gap-1.5">
            <span>{project.date}</span>
            <span>•</span>
            <span>{project.gridSize}x{project.gridSize}</span>
            <span>•</span>
            <span>{project.frames?.length || 1}f</span>
          </div>
          {project.folderId && (
            <div className="text-[8px] font-bold uppercase tracking-tighter opacity-30 flex items-center gap-1 text-foreground">
              <FolderIcon className="w-2 h-2" />
              {folders.find(f => f.id === project.folderId)?.name || 'Folder'}
            </div>
          )}
        </div>
      </div>

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => onDelete(project.id)}
        projectName={project.name || 'Untitled Project'}
        darkMode={darkMode}
      />
    </div>
  );
}
