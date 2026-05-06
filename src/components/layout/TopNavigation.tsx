import { Coffee, LayoutDashboard } from 'lucide-react';

interface TopNavigationProps {
  mode: 'draw' | 'animate';
  setMode: (mode: 'draw' | 'animate') => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onBackToDashboard: () => void;
}

export function TopNavigation({ mode, setMode, darkMode, setDarkMode, onBackToDashboard }: TopNavigationProps) {
  const bgColor = darkMode ? '#0B0B0B' : '#ffffff';
  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const mutedText = darkMode ? '#888' : '#666';

  return (
    <nav className="h-16 border-b flex items-center justify-between px-8" style={{ fontFamily: "'Geist Mono', monospace", backgroundColor: bgColor, borderColor }}>
      <div className="flex items-center gap-4">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity"
          title="Back to Dashboard"
        >
          <LayoutDashboard className="w-4 h-4" style={{ color: textColor }} />
        </button>
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-2.5 h-2.5 border" style={{ borderColor: darkMode ? '#333' : '#ddd' }} />
            <div className="w-2.5 h-2.5 bg-[#00FF41]" />
            <div className="w-2.5 h-2.5 border" style={{ borderColor: darkMode ? '#333' : '#ddd' }} />
            <div className="w-2.5 h-2.5 border" style={{ borderColor: darkMode ? '#333' : '#ddd' }} />
          </div>
          <span className="text-lg font-bold tracking-tighter" style={{ color: textColor }}>pixel</span>
        </div>
      </div>

      <div className="flex items-center gap-2 border p-1" style={{ borderColor }}>
        <button
          onClick={() => setMode('draw')}
          className={`px-8 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            mode === 'draw' ? '' : 'opacity-40'
          }`}
          style={{ 
            backgroundColor: mode === 'draw' ? (darkMode ? '#1A1A1A' : '#F5F5F5') : 'transparent',
            color: textColor 
          }}
        >
          Draw
        </button>
        <button
          onClick={() => setMode('animate')}
          className={`px-8 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            mode === 'animate' ? '' : 'opacity-40'
          }`}
          style={{ 
            backgroundColor: mode === 'animate' ? (darkMode ? '#1A1A1A' : '#F5F5F5') : 'transparent',
            color: textColor 
          }}
        >
          Animate
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: mutedText }}>Dark Mode</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-12 h-6 border flex items-center px-1"
            style={{ borderColor, backgroundColor: darkMode ? '#1A1A1A' : '#F5F5F5' }}
          >
            <div 
              className="w-4 h-4 transition-transform" 
              style={{ 
                transform: darkMode ? 'translateX(24px)' : 'translateX(0)',
                backgroundColor: darkMode ? '#FFF' : '#000'
              }}
            />
          </button>
        </div>

        <button 
          className="px-6 py-2 border text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-accent"
          style={{ borderColor, color: textColor, backgroundColor: 'transparent' }}
        >
          Buy me a Coffee
        </button>
      </div>
    </nav>
  );
}
