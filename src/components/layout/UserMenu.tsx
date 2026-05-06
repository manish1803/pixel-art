'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User, ChevronDown } from 'lucide-react';

interface UserMenuProps {
  darkMode: boolean;
  onSignIn: () => void;
}

export function UserMenu({ darkMode, onSignIn }: UserMenuProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const borderColor = darkMode ? '#1F1F1F' : '#e5e5e5';
  const textColor = darkMode ? '#EAEAEA' : '#1a1a1a';
  const bgColor = darkMode ? '#111' : '#fff';
  const mutedText = darkMode ? '#888' : '#666';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (status === 'loading') {
    return <div className="w-8 h-8 border animate-pulse" style={{ borderColor }} />;
  }

  if (!session) {
    return (
      <button
        onClick={onSignIn}
        className="h-8 px-4 border text-[9px] font-bold uppercase tracking-widest transition-colors hover:border-current"
        style={{ borderColor, color: mutedText }}
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-8 px-3 border transition-colors hover:border-current"
        style={{ borderColor, color: textColor }}
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || ''}
            className="w-5 h-5 rounded-full"
          />
        ) : (
          <User className="w-4 h-4" />
        )}
        <span className="text-[9px] font-bold uppercase tracking-widest max-w-[80px] truncate hidden sm:block">
          {session.user?.name?.split(' ')[0] || 'Account'}
        </span>
        <ChevronDown className="w-3 h-3 opacity-40" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-52 border z-50 shadow-lg"
          style={{ backgroundColor: bgColor, borderColor }}
        >
          {/* User info */}
          <div className="px-4 py-3 border-b" style={{ borderColor }}>
            <div className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: textColor }}>
              {session.user?.name}
            </div>
            <div className="text-[9px] opacity-40 truncate mt-0.5" style={{ color: textColor }}>
              {session.user?.email}
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-red-500/10"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-red-500">Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
