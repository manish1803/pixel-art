import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Home',
  description: 'The ultimate premium, dark-themed pixel art editor and animator. Create stunning pixel art, sprites, and animations directly in your browser.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex justify-center gap-2 mb-8">
          <div className="grid grid-cols-2 gap-1">
            <div className="w-4 h-4 border border-border" />
            <div className="w-4 h-4 bg-accent" />
            <div className="w-4 h-4 border border-border" />
            <div className="w-4 h-4 border border-border" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">pixel art editor</h1>
        </div>
        
        <p className="text-xl text-muted leading-relaxed">
          A premium, dark-themed pixel art editor and animator built for designers and artists. 
          Experience a professional workflow with a minimalist aesthetic.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <Link 
            href="/projects" 
            className="px-8 py-4 bg-foreground text-background font-bold uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/editor" 
            className="px-8 py-4 border border-border font-bold uppercase tracking-widest hover:bg-panel transition-colors"
          >
            Launch Editor
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-6 border border-border bg-panel/30">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-accent">Professional</h2>
            <p className="text-sm opacity-60">High-performance canvas with custom grid sizes and advanced color picking.</p>
          </div>
          <div className="p-6 border border-border bg-panel/30">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-accent">Animation</h2>
            <p className="text-sm opacity-60">Powerful frame-based animation tools with real-time preview and export.</p>
          </div>
          <div className="p-6 border border-border bg-panel/30">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-accent">Cloud Sync</h2>
            <p className="text-sm opacity-60">Securely save your projects to the cloud and access them from any device.</p>
          </div>
        </div>
      </div>
      
      <footer className="mt-auto py-8 opacity-20 text-[10px] font-bold uppercase tracking-[0.3em]">
        Built with Next.js & Tailwind CSS 4
      </footer>
    </div>
  );
}
