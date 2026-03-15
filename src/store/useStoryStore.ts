import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  saveCreatureImage,
  deleteCreatureImage,
  clearAllImages,
} from '@/utils/db';

export interface Creature {
  id: string;
  name: string;
  hasImage: boolean;
  sillyLevel: number;
  spookyLevel: number;
  sleepyLevel: number;
  canvasData?: string;
  caughtAt: number;
  isGlitch: boolean;
}

interface StoryState {
  // Potion levels (0-100)
  sillyLevel: number;
  spookyLevel: number;
  sleepyLevel: number;
  
  // Canvas
  canvasData: string | null;
  
  // Generation state
  currentStory: string | null;
  currentImage: string | null;
  isGenerating: boolean;
  generationProgress: number;
  generationStatus: string;
  
  // Glitch state
  isGlitch: boolean;
  glitchMessage: string | null;
  canCatch: boolean;
  
  // Zoo inventory
  zoo: Creature[];
  
  // Settings
  isMockMode: boolean;
  
  // Actions
  setSillyLevel: (level: number) => void;
  setSpookyLevel: (level: number) => void;
  setSleepyLevel: (level: number) => void;
  setCanvasData: (data: string | null) => void;
  setCurrentStory: (story: string | null) => void;
  setCurrentImage: (image: string | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  setGenerationStatus: (status: string) => void;
  setGlitch: (isGlitch: boolean, message?: string | null) => void;
  setCanCatch: (canCatch: boolean) => void;
  catchCreature: () => void;
  clearCurrentGeneration: () => void;
  cancelGeneration: () => void;
  toggleMockMode: () => void;
  removeFromZoo: (id: string) => void;
  clearZoo: () => void;
}

const GLITCH_MESSAGES = [
  "Wait, did I just give that duck three legs?!",
  "Oops! The pixels got all mixed up!",
  "Hehe, that one came out extra weird!",
  "Look at those wonky eyes! Perfect!",
  "The imagination machine hiccuped!",
  "That's not supposed to have wings there!",
  "A happy little accident!",
  "The dream got all twisty!",
];

const generateSillyName = (silly: number, spooky: number, sleepy: number): string => {
  const prefixes = ['Fluff', 'Wobble', 'Sparkle', 'Glimmer', 'Snuggle', 'Bumble', 'Twinkle', 'Giggle', 'Mystic', 'Shadow'];
  const middles = ['y', 'ums', 'lep', 'nob', 'wink', 'puff', 'gle', 'bot', 'zap', 'doodle'];
  const suffixes = ['pot', 'bear', 'bird', 'squish', 'pop', 'face', 'tail', 'foot', 'nose', 'wiggle'];
  
  const prefixIndex = Math.floor((silly / 100) * (prefixes.length - 1));
  const middleIndex = Math.floor((spooky / 100) * (middles.length - 1));
  const suffixIndex = Math.floor((sleepy / 100) * (suffixes.length - 1));
  
  return `${prefixes[prefixIndex]}${middles[middleIndex]}${suffixes[suffixIndex]}`;
};

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      // Initial state
      sillyLevel: 50,
      spookyLevel: 30,
      sleepyLevel: 40,
      canvasData: null,
      currentStory: null,
      currentImage: null,
      isGenerating: false,
      generationProgress: 0,
      generationStatus: '',
      isGlitch: false,
      glitchMessage: null,
      canCatch: false,
      zoo: [],
      isMockMode: true,
      
      // Actions
      setSillyLevel: (level) => set({ sillyLevel: Math.max(0, Math.min(100, level)) }),
      setSpookyLevel: (level) => set({ spookyLevel: Math.max(0, Math.min(100, level)) }),
      setSleepyLevel: (level) => set({ sleepyLevel: Math.max(0, Math.min(100, level)) }),
      setCanvasData: (data) => set({ canvasData: data }),
      setCurrentStory: (story) => set({ currentStory: story }),
      setCurrentImage: (image) => set({ currentImage: image }),
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      setGenerationProgress: (progress) => set({ generationProgress: progress }),
      setGenerationStatus: (status) => set({ generationStatus: status }),
      setGlitch: (isGlitch, message = null) => set({ 
        isGlitch, 
        glitchMessage: message ?? (isGlitch ? GLITCH_MESSAGES[Math.floor(Math.random() * GLITCH_MESSAGES.length)] : null)
      }),
      setCanCatch: (canCatch) => set({ canCatch }),
      
      catchCreature: async () => {
        const state = get();
        if (!state.currentImage) return;

        const newCreature: Creature = {
          id: `creature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: generateSillyName(state.sillyLevel, state.spookyLevel, state.sleepyLevel),
          hasImage: true,
          sillyLevel: state.sillyLevel,
          spookyLevel: state.spookyLevel,
          sleepyLevel: state.sleepyLevel,
          canvasData: state.canvasData || undefined,
          caughtAt: Date.now(),
          isGlitch: state.isGlitch,
        };

        // Save image to IndexedDB
        await saveCreatureImage(newCreature.id, state.currentImage);

        set((state) => ({
          zoo: [...state.zoo, newCreature],
          canCatch: false,
          isGlitch: false,
          glitchMessage: null,
        }));
      },
      
      clearCurrentGeneration: () => set({
        currentStory: null,
        currentImage: null,
        isGlitch: false,
        glitchMessage: null,
        canCatch: false,
      }),

      cancelGeneration: () => set({
        isGenerating: false,
        generationProgress: 0,
        generationStatus: 'Generation cancelled',
        currentStory: null,
        currentImage: null,
        isGlitch: false,
        glitchMessage: null,
        canCatch: false,
      }),

      toggleMockMode: () => set((state) => ({ isMockMode: !state.isMockMode })),
      
      removeFromZoo: async (id) => {
        await deleteCreatureImage(id);
        set((state) => ({
          zoo: state.zoo.filter((c) => c.id !== id),
        }));
      },

      clearZoo: async () => {
        await clearAllImages();
        set({ zoo: [] });
      },
    }),
    {
      name: 'latent-space-zoo-storage',
      partialize: (state) => ({
        zoo: state.zoo,
        isMockMode: state.isMockMode,
      }),
    }
  )
);
