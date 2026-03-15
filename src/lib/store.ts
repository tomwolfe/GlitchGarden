import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CreatureDNA {
  bodyShape: 'circle' | 'blob' | 'star';
  eyes: number;
  limbs: number;
  color: string;
  texture: 'fuzzy' | 'spiky' | 'slimed';
}

export interface Creature {
  id: string;
  name: string;
  story: string;
  dna: CreatureDNA;
  isGlitch: boolean;
  timestamp: number;
  canvasBounds: { x: number; y: number; width: number; height: number };
}

interface ZooState {
  zoo: Creature[];
  addCreature: (creature: Creature) => void;
  removeCreature: (id: string) => void;
  clearZoo: () => void;
}

export const useZooStore = create<ZooState>()(
  persist(
    (set) => ({
      zoo: [],
      addCreature: (creature) =>
        set((state) => ({ zoo: [creature, ...state.zoo] })),
      removeCreature: (id) =>
        set((state) => ({ zoo: state.zoo.filter((c) => c.id !== id) })),
      clearZoo: () => set({ zoo: [] }),
    }),
    {
      name: 'latent-space-zoo-storage',
    }
  )
);
