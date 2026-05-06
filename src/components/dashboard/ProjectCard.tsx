'use client';
import React, { useState } from 'react';
import { Star, Pencil, Trash2, FileText, Folder as FolderIcon } from 'lucide-react';
import { DeleteModal } from '../ui/DeleteModal';

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

  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#555' : '#aaa';
  const cardBg = darkMode ? '#111' : '#fafafa';
  const overlayBg = darkMode ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.88)';

  return (
    <div
      className="relative group flex flex-col border transition-all duration-200"
      style={{ borderColor: hovered ? textColor : borderColor, backgroundColor: cardBg, cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(project)}
    >
      {/* Preview Image */}
      <div className="aspect-square w-full overflow-hidden relative" style={{ backgroundColor: darkMode ? '#000' : '#fff' }}>
        {project.preview ? (
          <img
            src={project.preview}
            alt={project.name}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            <div className="w-12 h-12 border border-dashed" style={{ borderColor: textColor }} />
          </div>
        )}

        {/* Draft badge */}
        {project.isDraft && (
          <div
            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: darkMode ? '#1A1A1A' : '#F5F5F5', color: mutedText, border: `1px solid ${borderColor}` }}
          >
            Draft
          </div>
        )}

        {/* Hover Action Overlay */}
        {hovered && (
          <div
            className="absolute inset-0 flex items-center justify-center gap-2"
            style={{ backgroundColor: overlayBg }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Favourite */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavourite(project.id); }}
              className="w-8 h-8 flex items-center justify-center border transition-colors hover:bg-yellow-400/10"
              style={{ borderColor, color: project.isFavourite ? '#F59E0B' : mutedText }}
              title={project.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Star className="w-3.5 h-3.5" fill={project.isFavourite ? '#F59E0B' : 'none'} />
            </button>

            {/* Draft toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleDraft(project.id); }}
              className="w-8 h-8 flex items-center justify-center border transition-colors hover:bg-accent"
              style={{ borderColor, color: project.isDraft ? textColor : mutedText }}
              title={project.isDraft ? 'Mark as complete' : 'Mark as draft'}
            >
              <FileText className="w-3.5 h-3.5" />
            </button>

            {/* Open / Edit */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(project); }}
              className="w-8 h-8 flex items-center justify-center border transition-colors hover:bg-accent"
              style={{ borderColor, color: textColor }}
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
              className="w-8 h-8 flex items-center justify-center border transition-colors hover:bg-red-500/10"
              style={{ borderColor, color: '#ef4444' }}
              title="Delete project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Move to Folder */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)}
                className="w-8 h-8 flex items-center justify-center border transition-colors hover:bg-accent"
                style={{ 
                  borderColor, 
                  backgroundColor: isMoveMenuOpen ? (darkMode ? '#1A1A1A' : '#F5F5F5') : 'transparent',
                  color: textColor 
                }}
                title="Move to folder"
              >
                <FolderIcon className="w-3.5 h-3.5" />
              </button>

              {isMoveMenuOpen && (
                <div 
                  className="absolute bottom-full mb-2 right-0 border flex flex-col min-w-[140px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150" 
                  style={{ backgroundColor: cardBg, borderColor }}
                >
                  <div className="px-3 py-2 text-[8px] font-bold uppercase tracking-widest border-b opacity-40" style={{ borderColor }}>
                    Move to...
                  </div>
                  <button 
                    onClick={() => { onMoveToFolder(project.id, null); setIsMoveMenuOpen(false); }}
                    className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider hover:bg-accent transition-colors flex items-center gap-2"
                    style={{ color: !project.folderId ? '#00FF41' : textColor }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full border" style={{ borderColor: !project.folderId ? '#00FF41' : mutedText }} />
                    Root Directory
                  </button>
                  {folders.map(f => (
                    <button 
                      key={f.id}
                      onClick={() => { onMoveToFolder(project.id, f.id); setIsMoveMenuOpen(false); }}
                      className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider hover:bg-accent transition-colors flex items-center gap-2"
                      style={{ color: project.folderId === f.id ? '#00FF41' : textColor }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full border" style={{ borderColor: project.folderId === f.id ? '#00FF41' : mutedText }} />
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
      <div className="px-3 py-2.5 border-t relative" style={{ borderColor }}>
        <div className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: textColor }}>
          {project.name || 'Untitled'}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <div className="text-[9px] uppercase tracking-widest opacity-40" style={{ color: textColor }}>
            {project.date}
          </div>
          {project.folderId && (
            <div className="text-[8px] font-bold uppercase tracking-tighter opacity-30 flex items-center gap-1" style={{ color: textColor }}>
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
