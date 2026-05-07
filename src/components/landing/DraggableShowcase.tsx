"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface ShowcaseItem {
  src: string;
  title: string;
  tag: string;
}

interface DraggableShowcaseProps {
  items: ShowcaseItem[];
}

export function DraggableShowcase({ items }: DraggableShowcaseProps) {
  const [cards] = useState(
    items.map((item, i) => ({
      ...item,
      id: i,
      rotation: Math.random() * 20 - 10,
      xOffset: Math.random() * 100 - 50, // Wider spread
      yOffset: Math.random() * 60 - 30,
    }))
  );

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-accent/5 blur-[100px] rounded-full scale-50 pointer-events-none" />
      
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            drag
            dragConstraints={{ left: -400, right: 400, top: -250, bottom: 250 }}
            whileDrag={{ scale: 1.05, zIndex: 100 }}
            initial={{ 
              rotate: card.rotation,
              x: card.xOffset,
              y: card.yOffset,
              opacity: 0,
              scale: 0.8
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: { delay: index * 0.1 }
            }}
            className="absolute cursor-grab active:cursor-grabbing will-change-transform"
            style={{ zIndex: index }}
          >
            <div className="w-[200px] md:w-[240px] p-2.5 bg-[#141414] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md group overflow-hidden">
              {/* Image Container - pointer-events-none prevents image selection/drag ghosting */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-black/40 border border-white/5 pointer-events-none">
                <Image
                  src={card.src}
                  alt={card.title}
                  fill
                  draggable={false}
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 select-none"
                />
                
                {/* Tag Overlay */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 border border-white/10 rounded text-[7px] font-bold uppercase tracking-[0.2em] text-accent backdrop-blur-md">
                  {card.tag}
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="mt-3 pb-1 px-1 pointer-events-none">
                <h4 className="text-[11px] font-bold tracking-tight text-white/80 truncate">
                  {card.title}
                </h4>
                <div className="mt-1 flex items-center gap-1.5 opacity-30">
                  <div className="w-1 h-1 rounded-full bg-accent" />
                  <span className="text-[8px] uppercase font-bold tracking-widest text-white">
                    PIXEL.ART
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Instructional Label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 border border-white/5 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 pointer-events-none">
        Drag cards to explore
      </div>
    </div>
  );
}
