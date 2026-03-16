'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DNASlider, WebGPUStatus, IncubationButton } from '@/components/ui/DNAControls';
import { CreatureCanvas, type CreatureData } from '@/components/CreatureCanvas';
import { IncubationOverlay } from '@/components/IncubationOverlay';
import { GlitchNet } from '@/components/GlitchNet';
import { ZooGallery } from '@/components/ZooGallery';
import { useWebGPUDetection, useBioWorker } from '@/hooks/useWebGPU';
import { addCreature, type CreatureRecord } from '@/lib/zoo-db';
import { Sparkles, Zap, Skull, Maximize2, Heart, Trash2 } from 'lucide-react';

export default function Home() {
  // DNA state
  const [dna, setDna] = useState({
    chaos: 50,
    sparkle: 50,
    ancient: 50,
    size: 50,
  });

  // Creature state
  const [creature, setCreature] = useState<CreatureData | null>(null);
  const [isStabilized, setIsStabilized] = useState(false);
  const [showGlitchNet, setShowGlitchNet] = useState(false);

  // WebGPU and worker hooks
  const { isSupported, isLowPowerMode } = useWebGPUDetection();
  const { isReady, isGenerating, progress, error, generateCreature } = useBioWorker();

  // Handle creature generation
  const handleGenerate = useCallback(async () => {
    try {
      const result = await generateCreature(dna) as CreatureData;
      setCreature(result);
      setIsStabilized(false);
      setShowGlitchNet(true);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  }, [dna, generateCreature]);

  // Handle stabilization after clicking all particles
  const handleStabilize = useCallback(() => {
    setShowGlitchNet(false);
    setIsStabilized(true);
  }, []);

  // Handle saving to zoo
  const handleSaveToZoo = useCallback(async () => {
    if (!creature) return;
    try {
      const creatureRecord = {
        ...creature,
        dna,
      };
      await addCreature(creatureRecord, dna);
      setSavedToZoo(true);
      // Refresh gallery
      setTimeout(() => window.dispatchEvent(new CustomEvent('zoo-updated')), 100);
    } catch (err) {
      console.error('Failed to save creature:', err);
    }
  }, [creature, dna]);

  const [savedToZoo, setSavedToZoo] = useState(false);
  const [selectedCreature, setSelectedCreature] = useState<CreatureRecord | null>(null);

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.h1
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-quantum-400 via-purple-400 to-pink-400 bg-clip-text text-transparent glitch-text"
              data-text="THE LATENT SPACE ZOO"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              THE LATENT SPACE ZOO
            </motion.h1>
            <p className="text-gray-400 mt-2">
              Generate AI creatures from the quantum void
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <WebGPUStatus isSupported={isSupported} isLowPowerMode={isLowPowerMode} />
            
            {isReady && (
              <motion.div
                className="px-3 py-1.5 rounded-full bg-green-500/20 border border-green-400/30 text-xs text-green-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                Oracle Ready
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - DNA Controls */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-quantum-400" />
              DNA Sequencer
            </h2>
            
            <div className="space-y-4">
              <DNASlider
                label="Chaos"
                value={dna.chaos}
                onChange={(v) => setDna({ ...dna, chaos: v })}
                icon={<Zap className="w-5 h-5 text-white" />}
                color="bg-pink-500"
                description="Affects spikiness & behavior"
              />
              <DNASlider
                label="Sparkle"
                value={dna.sparkle}
                onChange={(v) => setDna({ ...dna, sparkle: v })}
                icon={<Sparkles className="w-5 h-5 text-white" />}
                color="bg-cyan-500"
                description="Affects color vibrancy & rarity"
              />
              <DNASlider
                label="Ancient"
                value={dna.ancient}
                onChange={(v) => setDna({ ...dna, ancient: v })}
                icon={<Skull className="w-5 h-5 text-white" />}
                color="bg-purple-500"
                description="Affects stability & wobble"
              />
              <DNASlider
                label="Size"
                value={dna.size}
                onChange={(v) => setDna({ ...dna, size: v })}
                icon={<Maximize2 className="w-5 h-5 text-white" />}
                color="bg-green-500"
                description="Affects node count & complexity"
              />
            </div>

            <div className="mt-6 flex justify-center">
              <IncubationButton
                onClick={handleGenerate}
                disabled={!isReady}
                isGenerating={isGenerating}
              />
            </div>

            {error && (
              <motion.div
                className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            {!isReady && !isGenerating && (
              <motion.div
                className="mt-4 text-center text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Loading the Latent Oracle... (First load may take 1-2 minutes)
              </motion.div>
            )}
          </div>

          {/* Creature Info Card */}
          {creature && isStabilized && (
            <motion.div
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-bold text-white mb-3">Creature Data</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Species:</span>
                  <span className="text-quantum-300">{creature.species}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trait:</span>
                  <span className="text-quantum-300">{creature.trait}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Behavior:</span>
                  <span className={`
                    ${creature.behavior === 'hyper' ? 'text-red-400' : ''}
                    ${creature.behavior === 'docile' ? 'text-green-400' : ''}
                    ${creature.behavior === 'glitchy' ? 'text-purple-400' : ''}
                  `}>
                    {creature.behavior}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stability:</span>
                  <span className="text-quantum-300">{creature.stats.stability}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rarity:</span>
                  <span className={`
                    ${creature.stats.rarity === 'Common' ? 'text-gray-400' : ''}
                    ${creature.stats.rarity === 'Mythic' ? 'text-yellow-400' : ''}
                    ${creature.stats.rarity === 'Glitch' ? 'text-purple-400' : ''}
                  `}>
                    {creature.stats.rarity}
                  </span>
                </div>
                
                {/* Color palette preview */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                  {creature.color_palette.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg border border-white/20"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <motion.button
                  onClick={handleSaveToZoo}
                  className="flex-1 px-4 py-2 rounded-lg bg-quantum-500 hover:bg-quantum-400 text-white font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Heart className="w-4 h-4" />
                  Add to Zoo
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Right Column - Creature Display */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="sticky top-8">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Creature Canvas */}
              <CreatureCanvas
                creature={creature}
                isStabilized={isStabilized}
                width={400}
                height={400}
              />

              {/* Glitch-Net Overlay */}
              {showGlitchNet && creature && (
                <GlitchNet
                  isActive={showGlitchNet}
                  onStabilize={handleStabilize}
                  creatureColors={creature.color_palette}
                />
              )}

              {/* Empty State */}
              {!creature && !isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="text-center text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-quantum-400/50" />
                    </div>
                    <p className="text-lg">Adjust the DNA sliders</p>
                    <p className="text-sm">and generate your creature</p>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Stabilization hint */}
            {showGlitchNet && (
              <motion.p
                className="text-center text-sm text-gray-400 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Click the floating particles to stabilize the creature
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Zoo Gallery Section */}
      <motion.div
        className="max-w-7xl mx-auto mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <ZooGallery onCreatureSelect={setSelectedCreature} />
      </motion.div>

      {/* Incubation Overlay */}
      <IncubationOverlay isGenerating={isGenerating} progress={progress} />
    </main>
  );
}
