import React, { useState } from 'react';
import { Star, Pencil, Trash2, FileText } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  date: string;
  preview: string;
  isFavourite: boolean;
  isDraft: boolean;
  [key: string]: any;
}

interface ProjectCardProps {
  project: Project;
  darkMode: boolean;
  onOpen: (project: Project) => void;
  onToggleFavourite: (id: string) => void;
  onToggleDraft: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, darkMode, onOpen, onToggleFavourite, onToggleDraft, onDelete }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);

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
                if (window.confirm(`Delete "${project.name}"?`)) onDelete(project.id);
              }}
              className="w-8 h-8 flex items-center justify-center border transition-colors hover:bg-red-500/10"
              style={{ borderColor, color: '#ef4444' }}
              title="Delete project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-3 py-2.5 border-t" style={{ borderColor }}>
        <div className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: textColor }}>
          {project.name || 'Untitled'}
        </div>
        <div className="text-[9px] uppercase tracking-widest mt-0.5 opacity-40" style={{ color: textColor }}>
          {project.date}
        </div>
      </div>
    </div>
  );
}
