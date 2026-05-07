"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export function HeroSection() {
  const { data: session } = useSession();
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      
      <div className="content-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent font-mono">Real-Time Collaborative Engine Live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
                Professional Pixel Art.<br />
                <span className="text-text-muted">Directly in your browser.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-muted mb-12 leading-relaxed">
                Experience the power of a dedicated desktop suite in a web environment. 
                Built with precision, performance, and the professional artist in mind.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                <Link 
                  href={session ? "/projects" : "/editor"} 
                  className="btn-primary py-4 px-8 rounded-lg text-base w-full sm:w-auto shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                    {session ? "Continue to Dashboard" : "Launch Editor"}
                </Link>
                {!session && (
                  <Link href="/projects" className="btn-secondary py-4 px-8 rounded-lg text-base w-full sm:w-auto">
                      Go to Dashboard
                  </Link>
                )}
            </div>
        </motion.div>

        {/* Browser-like Video Showcase */}
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto max-w-6xl"
        >
            {/* Professional Pulsing Border Glow */}
            <div className="absolute -inset-[1px] rounded-xl bg-accent/20 blur-[2px] animate-pulse-slow" />
            <div className="absolute -inset-[2px] rounded-xl bg-accent/5 blur-[10px] animate-pulse-slow opacity-50" />
            
            <div className="relative rounded-xl border border-white/10 bg-background overflow-hidden shadow-2xl flex flex-col">
                {/* Browser Header / Chrome */}
                <div className="h-10 border-b border-white/5 bg-panel flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    </div>
                    <div className="flex items-center gap-2 border border-white/5 bg-black/40 px-3 py-1 rounded">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono">pixel.art/showcase</span>
                    </div>
                    <div className="w-12" />
                </div>
                
                {/* The Video Container */}
                <div className="aspect-video bg-black relative">
                    <video 
                        src="/Showcase.mov" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                    />
                    {/* Subtle Overlay to match theme */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Floating Label (Aesthetic Addition) */}
            <div className="absolute -top-4 -right-4 px-3 py-1 bg-accent text-black text-[9px] font-black uppercase tracking-widest rounded shadow-xl z-20">
                Live Preview
            </div>
        </motion.div>
      </div>
    </section>
  );
}
