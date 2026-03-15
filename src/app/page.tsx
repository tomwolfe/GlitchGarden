'use client';

import React, { useState, useEffect } from 'react';
import { useAI } from '@/hooks/useAI';
import { useZooStore, Creature, CreatureDNA } from '@/lib/store';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { PotionSliders } from '@/components/PotionSliders';
import { RoughCreature } from '@/components/RoughCreature';
import { Pixel } from '@/components/Pixel';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, Download, Plus } from 'lucide-react';

export default function Home() {
  const { isReady, progress, generate } = useAI();
  const { zoo, addCreature, clearZoo } = useZooStore();
  
  const [potions, setPotions] = useState({ silly: 5, spooky: 5, sleepy: 5 });
  const [canvasBounds, setCanvasBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pixelStatus, setPixelStatus] = useState<'idle' | 'thinking' | 'shocked' | 'happy'>('idle');
  const [pixelMessage, setPixelMessage] = useState("Hi! I'm Pixel. Draw something and mix some potions to create a new friend!");

  const handleScribble = (bounds: { x: number; y: number; width: number; height: number }) => {
    setCanvasBounds(bounds);
    setPixelMessage("Ooh, nice bones! Now, what kind of creature should this be?");
  };

  const handlePotionChange = (key: 'silly' | 'spooky' | 'sleepy', value: number) => {
    setPotions((prev) => ({ ...prev, [key]: value }));
  };

  const evolve = async () => {
    if (!canvasBounds) return;
    setIsGenerating(true);
    setPixelStatus('thinking');
    setPixelMessage("Mixing the DNA... calculating the giggle-factor...");

    const prompt = `You are a playful AI narrator. Based on Silly:${potions.silly}, Spooky:${potions.spooky}, Sleepy:${potions.sleepy}, generate a creature. Output ONLY a JSON object with this schema: { "name": string, "story": string, "dna": { "bodyShape": "circle"|"blob"|"star", "eyes": number, "limbs": number, "color": string, "texture": "fuzzy"|"spiky"|"slimed" }, "isGlitch": boolean }. If Silly is > 8, set 'isGlitch' to true and give it impossible limbs.`;

    const result = (await generate(prompt)) as string;
    
    if (!result) {
      setIsGenerating(false);
      return;
    }

    try {
      // Find JSON in the output (sometimes LLM adds text around it)
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        
        const newCreature: Creature = {
          id: Math.random().toString(36).substr(2, 9),
          name: data.name,
          story: data.story,
          dna: data.dna,
          isGlitch: data.isGlitch || potions.silly > 8,
          timestamp: Date.now(),
          canvasBounds,
        };

        addCreature(newCreature);
        setPixelStatus(newCreature.isGlitch ? 'shocked' : 'happy');
        setPixelMessage(newCreature.isGlitch 
          ? `Whoa! My circuits sneezed! That ${newCreature.name} has ${newCreature.dna.limbs} limbs! Quick, catch it!`
          : `Meet ${newCreature.name}! ${newCreature.story}`);
      }
    } catch (e) {
      console.error("Failed to parse AI output", e);
      setPixelMessage("Oops! The potion bubbled over. Try again?");
    } finally {
      setIsGenerating(false);
      if (pixelStatus !== 'shocked') setTimeout(() => setPixelStatus('idle'), 5000);
    }
  };

  const exportZoo = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(zoo));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "my-latent-zoo.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 mx-auto bg-blue-500 rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <Sparkles className="text-white w-16 h-16" />
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-800">Pixel is packing his bags...</h1>
            <p className="text-slate-600 font-medium">We're downloading the brain (50MB). Hang tight!</p>
            <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <motion.div
                className="absolute top-0 left-0 h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-sm text-slate-400 italic">"AI uses math to imagine colors!"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 flex items-center gap-2">
              The Latent Space Zoo <Sparkles className="text-yellow-500" />
            </h1>
            <p className="text-slate-500 font-medium">Local AI Creature Lab</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportZoo}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold shadow-sm transition-all border-2 border-slate-200"
            >
              <Download size={20} /> Export
            </button>
            <button
              onClick={clearZoo}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold shadow-sm transition-all border-2 border-red-100"
            >
              <Trash2 size={20} /> Reset
            </button>
          </div>
        </div>

        {/* Lab Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Creator Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-white space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                    1. Draw the Bones
                  </h2>
                  <DrawingCanvas onScribbleComplete={handleScribble} />
                </div>
                <div className="flex-1 space-y-6 w-full">
                  <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                    2. Mix Potions
                  </h2>
                  <PotionSliders values={potions} onChange={handlePotionChange} />
                  <button
                    disabled={!canvasBounds || isGenerating}
                    onClick={evolve}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-black text-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isGenerating ? "Evolving..." : "EVOLVE! 🧪"}
                  </button>
                </div>
              </div>
              
              <Pixel status={pixelStatus} message={pixelMessage} />
            </div>
          </div>

          {/* Zoo Column */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              My Zoo ({zoo.length})
            </h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {zoo.map((creature) => (
                  <motion.div
                    key={creature.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-white p-4 rounded-2xl shadow-md border-2 border-white hover:border-blue-200 transition-all group"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                        <RoughCreature
                          dna={creature.dna}
                          isGlitch={creature.isGlitch}
                          width={100}
                          height={100}
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-slate-800 text-lg">{creature.name}</h3>
                        <p className="text-xs text-slate-500 leading-tight line-clamp-3">
                          {creature.story}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {zoo.length === 0 && (
                <div className="text-center py-12 bg-white/50 rounded-3xl border-4 border-dashed border-slate-200">
                  <Plus className="mx-auto text-slate-300 mb-2" size={48} />
                  <p className="text-slate-400 font-bold">Your zoo is empty!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
