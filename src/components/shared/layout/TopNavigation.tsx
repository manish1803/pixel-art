'use client';
import { Coffee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserMenu } from './UserMenu';
import { Logo } from '../Logo';

interface TopNavigationProps {
  mode: 'draw' | 'animate';
  setMode: (mode: 'draw' | 'animate') => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onBackToDashboard: () => void;
  projectName: string;
  setProjectName: (name: string) => void;
}

export function TopNavigation({ 
  mode, 
  setMode, 
  darkMode, 
  setDarkMode, 
  onBackToDashboard,
  projectName,
  setProjectName
}: TopNavigationProps) {
  const router = useRouter();

  return (
    <nav className="h-16 border-b border-border bg-background flex items-center justify-between px-8 text-foreground transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onBackToDashboard}
          className="hover:opacity-70 transition-opacity"
          title="Back to Dashboard"
        >
          <Logo />
        </button>

        <div className="flex items-center w-full max-w-sm h-10 border border-border px-4 bg-panel/30 focus-within:bg-panel/50 transition-colors">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Untitled Project"
            className="w-full bg-transparent border-0 outline-none text-[11px] font-bold uppercase tracking-wider focus:ring-0 placeholder:opacity-30 text-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border border-border p-1 bg-panel/50">
        <button
          onClick={() => setMode('draw')}
          className={`px-8 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            mode === 'draw' ? 'bg-panel border border-border shadow-sm text-foreground' : 'opacity-40 text-foreground hover:opacity-100'
          }`}
        >
          Draw
        </button>
        <button
          onClick={() => setMode('animate')}
          className={`px-8 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            mode === 'animate' ? 'bg-panel border border-border shadow-sm text-foreground' : 'opacity-40 text-foreground hover:opacity-100'
          }`}
        >
          Animate
        </button>
      </div>

      <div className="flex items-center gap-6 ml-12">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Dark Mode</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-12 h-6 border border-border flex items-center px-1 bg-panel"
          >
            <div 
              className={`w-4 h-4 transition-transform bg-foreground ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>

        <UserMenu 
          darkMode={darkMode}
          onSignIn={() => router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/editor')}`)} 
        />
      </div>
    </nav>
  );
}
