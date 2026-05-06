'use client';
import React, { useState } from 'react';
import { Folder as FolderIcon, MoreVertical, Trash2, Edit2 } from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  [key: string]: any;
}

interface FolderCardProps {
  folder: Folder;
  darkMode: boolean;
  onClick: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export function FolderCard({ folder, darkMode, onClick, onRename, onDelete }: FolderCardProps) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#555' : '#aaa';
  const cardBg = darkMode ? '#111' : '#fafafa';

  return (
    <div
      className="relative group flex flex-col border transition-all duration-200"
      style={{ 
        borderColor: hovered ? textColor : borderColor, 
        backgroundColor: cardBg, 
        cursor: 'pointer' 
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      onClick={() => onClick(folder.id)}
    >
      <div className="aspect-square w-full flex flex-col items-center justify-center gap-4 relative">
        <div 
          className="w-16 h-16 flex items-center justify-center bg-accent/10 border"
          style={{ borderColor: darkMode ? '#333' : '#ddd' }}
        >
          <FolderIcon className="w-8 h-8 opacity-40" style={{ color: textColor }} />
        </div>
        
        {/* Actions Menu */}
        {hovered && (
          <div className="absolute top-2 right-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
             <button 
                onClick={() => {
                  const newName = prompt('Enter new folder name:', folder.name);
                  if (newName && newName !== folder.name) onRename(folder.id, newName);
                }}
                className="w-7 h-7 flex items-center justify-center border hover:bg-accent transition-colors"
                style={{ borderColor, color: textColor }}
             >
                <Edit2 className="w-3 h-3" />
             </button>
             <button 
                onClick={() => {
                  if (confirm(`Delete folder "${folder.name}"? (Projects inside will be moved to root)`)) {
                    onDelete(folder.id);
                  }
                }}
                className="w-7 h-7 flex items-center justify-center border hover:bg-red-500/10 transition-colors"
                style={{ borderColor, color: '#ef4444' }}
             >
                <Trash2 className="w-3 h-3" />
             </button>
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 border-t flex items-center justify-between" style={{ borderColor }}>
        <div className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: textColor }}>
          {folder.name}
        </div>
        <div className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em]" style={{ color: textColor }}>
          Folder
        </div>
      </div>
    </div>
  );
}
