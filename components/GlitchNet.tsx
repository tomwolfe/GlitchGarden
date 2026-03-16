'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface GlitchParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface GlitchNetProps {
  isActive: boolean;
  onStabilize: () => void;
  creatureColors: string[];
}

/**
 * Glitch-Net Mechanic - User must click 3 floating particles to stabilize the creature
 */
export function GlitchNet({ isActive, onStabilize, creatureColors }: GlitchNetProps) {
  const [particles, setParticles] = useState<GlitchParticle[]>([]);
  const [clickedParticles, setClickedParticles] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isActive) {
      // Generate 3 random particle positions
      const newParticles: GlitchParticle[] = [...Array(3)].map((_, i) => ({
        id: i,
        x: 15 + Math.random() * 70, // 15% to 85% to avoid edges
        y: 15 + Math.random() * 70,
        color: creatureColors[i % creatureColors.length] || '#0ea5e9',
        size: 20 + Math.random() * 20,
      }));
      setParticles(newParticles);
      setClickedParticles(new Set());
    }
  }, [isActive, creatureColors]);

  const handleParticleClick = (id: number) => {
    if (clickedParticles.has(id)) return;

    const newClicked = new Set(clickedParticles);
    newClicked.add(id);
    setClickedParticles(newClicked);

    if (newClicked.size === 3) {
      // All particles clicked - stabilize!
      setTimeout(() => {
        onStabilize();
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 z-20 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Glitch overlay effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.1) 0px,
                rgba(0, 0, 0, 0.1) 1px,
                transparent 1px,
                transparent 4px
              )`,
              animation: 'glitch 0.3s ease-in-out infinite',
            }}
          />

          {/* Instruction text */}
          <motion.div
            className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            <h3 className="text-xl font-bold text-white glitch-text" data-text="STABILIZE THE CREATURE">
              STABILIZE THE CREATURE
            </h3>
            <p className="text-sm text-gray-300 mt-1">
              Click the {3 - clickedParticles.size} remaining glitch particle{3 - clickedParticles.size !== 1 ? 's' : ''}
            </p>
          </motion.div>

          {/* Progress indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-4 h-4 rounded-full border-2 ${
                  clickedParticles.has(i)
                    ? 'bg-green-500 border-green-500'
                    : 'border-white/50'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: clickedParticles.has(i) ? 1.2 : 1 }}
              />
            ))}
          </div>

          {/* Floating glitch particles */}
          {particles.map((particle, index) => {
            const isClicked = clickedParticles.has(particle.id);
            return (
              <motion.div
                key={particle.id}
                className="absolute cursor-pointer glitch-particle"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  background: isClicked
                    ? 'linear-gradient(45deg, #00ff00, #00aa00)'
                    : `linear-gradient(45deg, ${particle.color}, ${particle.color}88)`,
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: isClicked ? 0 : 1,
                  rotate: isClicked ? 180 : 0,
                  x: isClicked ? [0, 100, 100] : [0, Math.sin(index) * 20, 0],
                  y: isClicked ? [0, -100, -100] : [0, Math.cos(index) * 20, 0],
                }}
                transition={{ duration: 0.3 }}
                onClick={() => handleParticleClick(particle.id)}
                whileHover={!isClicked ? { scale: 1.2 } : {}}
                whileTap={!isClicked ? { scale: 0.9 } : {}}
              >
                {!isClicked && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${particle.color}44 0%, transparent 70%)`,
                    }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}

          {/* Stabilization flash effect */}
          <AnimatePresence>
            {clickedParticles.size === 3 && (
              <motion.div
                className="absolute inset-0 bg-white pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
