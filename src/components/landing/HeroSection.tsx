"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSession } from "next-auth/react";
import { IconCloud, IconStack2, IconFocus2 } from "@tabler/icons-react";

export function HeroSection() {
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Scale and tilt effects for the video showcase
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.85, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.4], [15, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  // Stagger variants for the text content
  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  const floatingCards = [
    {
      icon: <IconCloud className="w-4 h-4 text-accent" />,
      title: "Real-time Sync",
      text: "Saved to cloud instantly",
      position: "top-[20%] -left-12 md:-left-24",
      delay: 1.2
    },
    {
      icon: <IconStack2 className="w-4 h-4 text-accent" />,
      title: "Layered Timeline",
      text: "Pro-grade animation",
      position: "bottom-[30%] -right-12 md:-right-24",
      delay: 1.4
    },
    {
      icon: <IconFocus2 className="w-4 h-4 text-accent" />,
      title: "Precision Grid",
      text: "Pixel-perfect drawing",
      position: "top-[60%] -left-8 md:-left-16",
      delay: 1.6
    }
  ];

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      
      <div className="content-container text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 mb-8"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent font-mono">Real-Time Collaborative Engine Live</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
            >
                Professional Pixel Art.<br />
                <span className="text-text-muted">Directly in your browser.</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="max-w-2xl mx-auto text-lg md:text-xl text-text-muted mb-12 leading-relaxed"
            >
                Experience the power of a dedicated desktop suite in a web environment. 
                Built with precision, performance, and the professional artist in mind.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
            >
                <Link 
                  href={session ? "/projects" : "/editor"} 
                  className="btn-primary py-4 px-8 rounded-lg text-base w-full sm:w-auto shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform hover:scale-105 active:scale-95"
                >
                    {session ? "Continue to Dashboard" : "Launch Editor"}
                </Link>
                {!session && (
                  <Link href="/projects" className="btn-secondary py-4 px-8 rounded-lg text-base w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
                      Go to Dashboard
                  </Link>
                )}
            </motion.div>
        </motion.div>

        {/* Browser-like Video Showcase with Scroll Scaling */}
        <motion.div
            style={{ 
                scale,
                rotateX,
                opacity
            }}
            className="relative mx-auto max-w-6xl perspective-[1200px]"
        >
            {/* Floating Feature Cards */}
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: 0,
                  y: [0, -10, 0] // Gentle floating animation
                }}
                transition={{ 
                  delay: card.delay,
                  duration: 0.8,
                  y: {
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className={`absolute ${card.position} z-30 hidden lg:flex items-center gap-3 p-3 bg-black/60 border border-white/10 rounded-xl backdrop-blur-xl shadow-2xl pointer-events-none`}
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  {card.icon}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/90 leading-none mb-1">
                    {card.title}
                  </p>
                  <p className="text-[8px] font-bold text-text-muted whitespace-nowrap">
                    {card.text}
                  </p>
                </div>
              </motion.div>
            ))}

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
                        className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Floating Label */}
            <div className="absolute -top-4 -right-4 px-3 py-1 bg-accent text-black text-[9px] font-black uppercase tracking-widest rounded shadow-xl z-20">
                Live Preview
            </div>
        </motion.div>
      </div>
    </section>
  );
}
