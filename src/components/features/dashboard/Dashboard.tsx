'use client';
import React from 'react';
import { Plus, FolderPlus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ProjectCard } from './ProjectCard';
import { FolderCard } from './FolderCard';
import { UserMenu } from '@/components/shared/layout/UserMenu';
import { CreateFolderModal } from '@/components/ui/CreateFolderModal';
import { Logo } from '@/components/shared/Logo';

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

interface DashboardProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  projects: Project[];
  folders: Folder[];
  loading?: boolean;
  onNewProject: () => void;
  onOpenProject: (project: Project) => void;
  onToggleFavourite: (id: string) => void;
  onToggleDraft: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveToFolder: (projectId: string, folderId: string | null) => void;
}

function SectionEmptyState({ label }: { label: string; darkMode: boolean }) {
  return (
    <div className="col-span-full border border-dashed border-border flex items-center justify-center py-8 text-center">
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 text-foreground">
        {label}
      </span>
    </div>
  );
}

function Section({
  title,
  icon,
  projects,
  folders = [],
  darkMode,
  emptyLabel,
  onOpenProject,
  onToggleFavourite,
  onToggleDraft,
  onDeleteProject,
  onFolderClick,
  onRenameFolder,
  onDeleteFolder,
  onMoveToFolder,
  onAddFolder,
  allFolders,
}: {
  title: string | React.ReactNode;
  icon: any;
  projects: Project[];
  folders?: Folder[];
  darkMode: boolean;
  emptyLabel: string;
  onOpenProject: (p: Project) => void;
  onToggleFavourite: (id: string) => void;
  onToggleDraft: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onFolderClick?: (id: string) => void;
  onRenameFolder?: (id: string, name: string) => void;
  onDeleteFolder?: (id: string) => void;
  onMoveToFolder: (projectId: string, folderId: string | null) => void;
  onAddFolder?: () => void;
  allFolders: Folder[];
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground">
            {title}
          </span>
          <span className="text-[9px] font-bold opacity-30 ml-1 text-foreground">
            ({projects.length + folders.length})
          </span>
        </div>
        
        {onAddFolder && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddFolder(); }}
            className="h-8 px-3 border border-border flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-colors hover:bg-accent hover:text-black text-foreground"
          >
            <FolderPlus className="w-3 h-3" />
            <span>New Folder</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {projects.length === 0 && folders.length === 0 ? (
          <SectionEmptyState label={emptyLabel} darkMode={darkMode} />
        ) : (
          <>
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                darkMode={darkMode}
                onClick={onFolderClick!}
                onRename={onRenameFolder!}
                onDelete={onDeleteFolder!}
              />
            ))}
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                darkMode={darkMode}
                folders={allFolders}
                onOpen={onOpenProject}
                onToggleFavourite={onToggleFavourite}
                onToggleDraft={onToggleDraft}
                onDelete={onDeleteProject}
                onMoveToFolder={onMoveToFolder}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

export function Dashboard({
  darkMode,
  setDarkMode,
  projects,
  folders,
  loading = false,
  onNewProject,
  onOpenProject,
  onToggleFavourite,
  onToggleDraft,
  onDeleteProject,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveToFolder,
}: DashboardProps) {
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = React.useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const favourites = projects.filter((p) => p.isFavourite);
  const drafts = projects.filter((p) => p.isDraft && !p.isFavourite);
  
  // Filter for the main view
  const currentFolders = currentFolderId ? [] : folders; // We only have one level for now
  const filteredProjects = projects.filter(p => p.folderId === (currentFolderId || null));
  const currentFolderName = folders.find(f => f.id === currentFolderId)?.name;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Top Nav */}
      <nav className="h-16 border-b border-border flex items-center justify-between px-8 shrink-0">
        <Logo />

        <div className="flex items-center gap-6">
          {/* Dark mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-12 h-6 border border-border flex items-center px-1 bg-panel"
            >
              <div
                className="w-4 h-4 transition-transform bg-foreground"
                style={{ transform: darkMode ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          {/* New Project */}
          <button
            onClick={onNewProject}
            className="h-9 px-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors shadow-lg active:scale-95 bg-foreground text-background"
          >
            <Plus className="w-3 h-3" />
            New Project
          </button>

          <UserMenu
            darkMode={darkMode}
            onSignIn={() => router.push('/auth/signin?callbackUrl=/projects')}
          />
        </div>
      </nav>

      {/* Guest sync banner */}
      {!session && (
        <div className="px-8 py-2.5 border-b border-border flex items-center justify-between bg-panel/50">
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 text-foreground">
            ☁ Sign in to sync your projects across devices
          </span>
          <button
            onClick={() => router.push('/auth/signin?callbackUrl=/projects')}
            className="text-[9px] font-bold uppercase tracking-widest underline opacity-40 hover:opacity-100 transition-opacity text-foreground"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-20 text-foreground">
            Loading projects...
          </span>
        </div>
      ) : (
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
            onMoveToFolder={onMoveToFolder}
            allFolders={folders}
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
            onMoveToFolder={onMoveToFolder}
            allFolders={folders}
          />

          {/* All Projects / Folder View */}
          <Section
            title={currentFolderId ? `Folder: ${currentFolderName}` : "All Projects"}
            icon={currentFolderId ? <button onClick={() => setCurrentFolderId(null)} className="hover:opacity-50"><ArrowLeft className="w-4 h-4" /></button> : "📁"}
            projects={filteredProjects}
            folders={currentFolders}
            darkMode={darkMode}
            emptyLabel={currentFolderId ? "This folder is empty" : "No saved projects yet — start drawing!"}
            onOpenProject={onOpenProject}
            onToggleFavourite={onToggleFavourite}
            onToggleDraft={onToggleDraft}
            onDeleteProject={onDeleteProject}
            onFolderClick={(id) => setCurrentFolderId(id)}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onMoveToFolder={onMoveToFolder}
            onAddFolder={() => setIsFolderModalOpen(true)}
            allFolders={folders}
          />

          <CreateFolderModal 
            isOpen={isFolderModalOpen}
            onClose={() => setIsFolderModalOpen(false)}
            onConfirm={onCreateFolder}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
}
