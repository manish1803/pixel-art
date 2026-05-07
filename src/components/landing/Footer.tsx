"use client";
import React from "react";
import Link from "next/link";
import { Logo } from "../shared/Logo";

export function Footer() {
  return (
    <footer className="py-20 bg-background border-t border-white/5">
      <div className="content-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-24 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="mb-6 block transition-transform hover:scale-105">
              <Logo />
            </Link>
            <p className="text-xs text-text-muted leading-relaxed">
              The high-performance creative suite for modern pixel artists. 
              Built for precision, speed, and cloud-first collaboration.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/editor" className="text-xs text-text-muted hover:text-foreground transition-colors">Editor</Link></li>
              <li><Link href="/projects" className="text-xs text-text-muted hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="#features" className="text-xs text-text-muted hover:text-foreground transition-colors">Features</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Company</h4>
            <ul className="space-y-3">
              <li><Link href="https://github.com/manish1803/pixel-art" className="text-xs text-text-muted hover:text-foreground transition-colors">GitHub</Link></li>
              <li><Link href="#" className="text-xs text-text-muted hover:text-foreground transition-colors">Discord</Link></li>
              <li><Link href="#" className="text-xs text-text-muted hover:text-foreground transition-colors">Twitter</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-xs text-text-muted hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="#" className="text-xs text-text-muted hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/[0.03]">
          <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">
            © 2026 PIXEL.ART ENGINE. BUILT FOR THE NEON GENERATION.
          </p>
          <div className="flex gap-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent/10" />
          </div>
        </div>
      </div>
    </footer>
  );
}
