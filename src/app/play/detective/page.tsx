"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFlags, Flag } from "@/lib/useFlags";
import { useSparks } from "@/lib/useSparks";
import { motion } from "motion/react";
import { Link2, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Connection {
  id: string;
  from: string;
  to: string;
}

export default function PatternDetective() {
  const { allFlags } = useFlags();
  const { earnSparks } = useSparks();
  
  // Board state
  const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Setup initial random positions once
  useEffect(() => {
    if (allFlags.length > 0 && Object.keys(positions).length === 0 && boardRef.current) {
      const boardWidth = boardRef.current.clientWidth - 200; // rough width of a card
      const boardHeight = boardRef.current.clientHeight - 100;
      
      const newPos: Record<string, {x: number, y: number}> = {};
      allFlags.slice(0, 10).forEach((flag, i) => { // limit to 10 for sanity
        newPos[flag.id] = {
          x: Math.random() * boardWidth,
          y: Math.random() * boardHeight,
        };
      });
      setPositions(newPos);
    }
  }, [allFlags, positions]);

  const handleDrag = (id: string, info: any) => {
    setPositions(prev => ({
      ...prev,
      [id]: {
        x: prev[id].x + info.delta.x,
        y: prev[id].y + info.delta.y
      }
    }));
  };

  const handleFlagClick = (id: string) => {
    if (selectedFlag === null) {
      setSelectedFlag(id);
    } else {
      if (selectedFlag !== id) {
        // Create connection
        const exists = connections.find(c => 
          (c.from === selectedFlag && c.to === id) || 
          (c.from === id && c.to === selectedFlag)
        );
        
        if (!exists) {
          setConnections(prev => [...prev, {
            id: `${selectedFlag}-${id}`,
            from: selectedFlag,
            to: id
          }]);
          
          // Reward spark (max 5 per day conceptually, we'll just award 5 here)
          earnSparks('pattern_detective', 5);
        }
      }
      setSelectedFlag(null);
    }
  };

  if (allFlags.length < 2) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="w-12 h-12 text-ink/40 mb-4" />
        <h2 className="font-heading text-xl uppercase text-ink">Not Enough Evidence</h2>
        <p className="font-voice text-ink/60 italic max-w-md mx-auto mt-2">
          You need at least two logged red flags to start connecting patterns on the board.
        </p>
        <Link href="/flags" className="mt-6 border-2 border-ink px-6 py-2 font-mono text-xs uppercase hover:bg-ink/5">
          Log Red Flags
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px]">
      
      {/* Header overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto bg-bg border-2 border-ink p-4 shadow-[4px_4px_0px_0px] shadow-ink/20">
          <h2 className="font-heading text-xl uppercase tracking-wider text-ink flex items-center gap-2">
            <Link2 className="w-5 h-5" /> Pattern Detective
          </h2>
          <p className="font-sans text-xs text-ink/70 mt-1 max-w-xs">
            Drag flags. Click two flags to draw a string between connected behaviors.
          </p>
        </div>
        
        <div className="pointer-events-auto bg-accent text-bg px-4 py-2 border-2 border-ink shadow-[4px_4px_0px_0px] shadow-ink/20 font-mono text-xs font-bold uppercase flex flex-col items-end">
          <span>Connections: {connections.length}</span>
          <span className="flex items-center gap-1 opacity-80"><Sparkles className="w-3 h-3"/> +{connections.length * 5} Sparks</span>
        </div>
      </div>

      {/* The Board */}
      <div ref={boardRef} className="flex-1 w-full relative overflow-hidden">
        
        {/* SVG Strings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {connections.map(conn => {
            const p1 = positions[conn.from];
            const p2 = positions[conn.to];
            if (!p1 || !p2) return null;
            
            // Adjust coordinates to roughly center of the cards (100px width/height offset guess)
            const x1 = p1.x + 100;
            const y1 = p1.y + 40;
            const x2 = p2.x + 100;
            const y2 = p2.y + 40;
            
            return (
              <line
                key={conn.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="red"
                strokeWidth="3"
                strokeDasharray="4 4"
                className="opacity-60"
              />
            );
          })}
        </svg>

        {/* Flag Nodes */}
        {allFlags.slice(0, 10).map(flag => {
          const pos = positions[flag.id] || { x: 0, y: 0 };
          const isSelected = selectedFlag === flag.id;
          
          return (
            <motion.div
              key={flag.id}
              drag
              dragMomentum={false}
              onDrag={(_, info) => handleDrag(flag.id, info)}
              initial={false}
              animate={{ x: pos.x, y: pos.y }}
              onClick={() => handleFlagClick(flag.id)}
              className={cn(
                "absolute z-10 cursor-grab active:cursor-grabbing w-48 border-2 p-3 shadow-[4px_4px_0px_0px]",
                isSelected 
                  ? "border-accent bg-accent/10 shadow-accent/20 scale-105" 
                  : "border-ink bg-bg shadow-ink/20 hover:bg-ink/5"
              )}
            >
              {/* Pushpin visual */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-ink shadow-sm z-20" />
              
              <div className="font-mono text-[9px] uppercase tracking-widest text-ink/60 border-b-2 border-ink/10 pb-1 mb-2 truncate">
                {flag.category}
              </div>
              <p className="font-voice text-xs text-ink leading-snug line-clamp-4">
                {flag.content}
              </p>
            </motion.div>
          );
        })}
        
      </div>
    </div>
  );
}
