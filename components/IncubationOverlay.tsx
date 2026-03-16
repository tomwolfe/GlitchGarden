'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface IncubationOverlayProps {
  isGenerating: boolean;
  progress: { message: string; progress: number } | null;
}

/**
 * Generate binary string for the heart animation
 */
function generateBinaryHeart(): string[] {
  const heartPattern = [
    '  0110  0110  ',
    ' 1101111011 ',
    '110111110111',
    '110111110111',
    ' 1101111011 ',
    '  11011011  ',
    '   110111   ',
    '    1111    ',
    '     11     ',
  ];
  return heartPattern;
}

export function IncubationOverlay({ isGenerating, progress }: IncubationOverlayProps) {
  const binaryHeart = generateBinaryHeart();

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative flex flex-col items-center gap-8">
            {/* Binary Heart Animation */}
            <motion.div
              className="beat relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="binary-heart text-quantum-400 font-mono whitespace-pre select-none">
                {binaryHeart.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {line.split('').map((char, j) => (
                      <motion.span
                        key={j}
                        className={char === '1' ? 'text-quantum-300' : 'text-transparent'}
                        animate={{
                          opacity: char === '1' ? [0.5, 1, 0.5] : 0,
                          textShadow: char === '1' 
                            ? ['0 0 5px #0ea5e9', '0 0 15px #0ea5e9', '0 0 5px #0ea5e9'] 
                            : 'none',
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: j * 0.02,
                        }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.div>
                ))}
              </div>
              
              {/* Glow effect behind heart */}
              <motion.div
                className="absolute inset-0 blur-xl bg-quantum-500/30 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            {/* Progress Text */}
            <div className="text-center space-y-2">
              <motion.h2
                className="text-2xl font-bold text-white glitch-text"
                data-text="INCUBATING..."
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                INCUBATING...
              </motion.h2>
              
              {progress && (
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-sm text-gray-400">{progress.message}</p>
                  <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-quantum-500 via-purple-500 to-quantum-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(progress.progress || 0) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Floating DNA strands */}
            <div className="absolute -left-20 top-1/2 -translate-y-1/2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-8 bg-gradient-to-b from-quantum-400 to-transparent rounded-full"
                  initial={{ y: -100, opacity: 0 }}
                  animate={{
                    y: 100,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
            
            <div className="absolute -right-20 top-1/2 -translate-y-1/2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-8 bg-gradient-to-b from-purple-400 to-transparent rounded-full"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{
                    y: -100,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
