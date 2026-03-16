/**
 * Bio Worker - Web Worker Singleton for AI Creature Generation
 * Handles SmolLM model loading and inference using @xenova/transformers
 */

import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use local cache
env.allowLocalModels = false;
env.useBrowserCache = true;

// The internal system prompt for "The Latent Oracle"
const SYSTEM_PROMPT = `You are a biological data-stream. Output ONLY a valid JSON object. Do not talk.
Schema: { 
  "species": string, 
  "trait": string, 
  "color_palette": ["#hex", "#hex", "#hex"], 
  "behavior": "hyper" | "docile" | "glitchy", 
  "stats": { "stability": 1-100, "rarity": "Common" | "Mythic" | "Glitch" },
  "svg_config": { "nodes": number, "spikiness": 0-1, "wobble": 0-1 } 
}`;

type WorkerMessage = {
  type: 'INITIALIZE' | 'GENERATE' | 'STATUS';
  payload?: {
    dna?: {
      chaos: number;
      sparkle: number;
      ancient: number;
      size: number;
    };
  };
};

type WorkerResponse = {
  type: 'READY' | 'GENERATING' | 'RESULT' | 'ERROR' | 'PROGRESS';
  payload?: any;
};

let generator: any = null;
let isInitialized = false;

/**
 * Generate creature data based on DNA sliders
 * Uses the LLM to create unique creature specifications
 */
async function generateCreature(dna: {
  chaos: number;
  sparkle: number;
  ancient: number;
  size: number;
}): Promise<any> {
  if (!generator) {
    throw new Error('Model not initialized');
  }

  // Create a prompt that incorporates the DNA values
  const dnaInfluence = `
DNA Parameters:
- Chaos Level: ${dna.chaos}% (affects spikiness and behavior randomness)
- Sparkle: ${dna.sparkle}% (affects color vibrancy and rarity)
- Ancient: ${dna.ancient}% (affects stability and species type)
- Size: ${dna.size}% (affects node count and visual complexity)

Generate a unique creature based on these parameters. Remember to output ONLY valid JSON.`;

  const prompt = `${SYSTEM_PROMPT}\n\n${dnaInfluence}\n\nCreature JSON:`;

  try {
    const output = await generator(prompt, {
      max_new_tokens: 256,
      temperature: 0.7 + (dna.chaos / 100) * 0.5,
      top_p: 0.9,
      do_sample: true,
    });

    // Extract JSON from the output
    const generatedText = output[0]?.generated_text || '';
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const creatureData = JSON.parse(jsonMatch[0]);
        return validateCreatureData(creatureData, dna);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    }
    
    // Fallback: generate procedural data if LLM fails
    return generateProceduralCreature(dna);
  } catch (error) {
    console.error('Generation error:', error);
    return generateProceduralCreature(dna);
  }
}

/**
 * Validate and normalize creature data from LLM
 */
function validateCreatureData(data: any, dna: any): any {
  const behaviors: ('hyper' | 'docile' | 'glitchy')[] = ['hyper', 'docile', 'glitchy'];
  const rarities: ('Common' | 'Mythic' | 'Glitch')[] = ['Common', 'Mythic', 'Glitch'];
  
  return {
    species: data.species || 'Unknown Entity',
    trait: data.trait || 'Mysterious',
    color_palette: Array.isArray(data.color_palette) && data.color_palette.length === 3
      ? data.color_palette
      : generateColorPalette(dna.sparkle),
    behavior: behaviors.includes(data.behavior) ? data.behavior : 'docile',
    stats: {
      stability: Math.min(100, Math.max(1, data.stats?.stability || Math.floor(100 - dna.chaos))),
      rarity: rarities.includes(data.stats?.rarity) 
        ? data.stats.rarity 
        : dna.sparkle > 80 ? 'Mythic' : dna.chaos > 80 ? 'Glitch' : 'Common',
    },
    svg_config: {
      nodes: data.svg_config?.nodes || Math.floor(6 + (dna.size / 100) * 12),
      spikiness: Math.min(1, Math.max(0, data.svg_config?.spikiness || dna.chaos / 100)),
      wobble: Math.min(1, Math.max(0, data.svg_config?.wobble || dna.ancient / 100)),
    },
  };
}

/**
 * Fallback procedural generation if LLM fails
 */
function generateProceduralCreature(dna: {
  chaos: number;
  sparkle: number;
  ancient: number;
  size: number;
}): any {
  const speciesList = [
    'Quantum Wisp', 'Nebula Drake', 'Void Crawler', 'Photon Serpent',
    'Crystal Moth', 'Plasma Jellyfish', 'Data Phoenix', 'Echo Bat',
    'Flux Fox', 'Prism Spider', 'Gravity Ray', 'Temporal Eel',
  ];
  
  const traitList = [
    'Phase-shifting', 'Bioluminescent', 'Crystalline', 'Ethereal',
    'Fractal', 'Holographic', 'Magnetic', 'Radioactive',
  ];
  
  const behaviors: ('hyper' | 'docile' | 'glitchy')[] = ['hyper', 'docile', 'glitchy'];
  const rarities: ('Common' | 'Mythic' | 'Glitch')[] = ['Common', 'Mythic', 'Glitch'];
  
  return {
    species: speciesList[Math.floor(Math.random() * speciesList.length)],
    trait: traitList[Math.floor(Math.random() * traitList.length)],
    color_palette: generateColorPalette(dna.sparkle),
    behavior: dna.chaos > 70 ? 'glitchy' : dna.ancient > 70 ? 'docile' : 'hyper',
    stats: {
      stability: Math.floor(100 - dna.chaos + (dna.ancient / 4)),
      rarity: dna.sparkle > 85 ? 'Mythic' : dna.chaos > 85 ? 'Glitch' : 'Common',
    },
    svg_config: {
      nodes: Math.floor(6 + (dna.size / 100) * 12),
      spikiness: dna.chaos / 100,
      wobble: dna.ancient / 100,
    },
  };
}

/**
 * Generate a color palette based on sparkle level
 */
function generateColorPalette(sparkle: number): string[] {
  const palettes: string[][] = [
    // Deep space
    ['#1a1a2e', '#16213e', '#0f3460'],
    // Neon cyber
    ['#ff00ff', '#00ffff', '#7b2cbf'],
    // Organic
    ['#2d6a4f', '#40916c', '#74c69d'],
    // Fire
    ['#ff4500', '#ff6347', '#ffa500'],
    // Ice
    ['#00b4d8', '#90e0ef', '#caf0f8'],
    // Void
    ['#0d0d0d', '#1a1a2e', '#4a1c6e'],
  ];
  
  // Higher sparkle = more vibrant colors
  if (sparkle > 80) {
    return palettes[1]; // Neon cyber
  }
  if (sparkle > 60) {
    return palettes[Math.floor(Math.random() * 3) + 2];
  }
  return palettes[Math.floor(Math.random() * palettes.length)];
}

/**
 * Initialize the SmolLM model
 */
async function initializeModel(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    self.postMessage({
      type: 'PROGRESS',
      payload: { message: 'Loading SmolLM-135M-Instruct model...', progress: 0 },
    } as WorkerResponse);

    generator = await pipeline('text-generation', 'onnx-community/SmolLM-135M-Instruct-ONNX', {
      quantized: true,
      progress_callback: (progress: any) => {
        if (progress.status === 'progress') {
          self.postMessage({
            type: 'PROGRESS',
            payload: {
              message: `Loading model... ${Math.round(progress.progress * 100)}%`,
              progress: progress.progress,
            },
          } as WorkerResponse);
        }
      },
    });

    isInitialized = true;
    
    self.postMessage({
      type: 'READY',
      payload: { message: 'Latent Oracle initialized and ready' },
    } as WorkerResponse);
  } catch (error) {
    console.error('Failed to initialize model:', error);
    self.postMessage({
      type: 'ERROR',
      payload: { message: `Failed to load model: ${error}` },
    } as WorkerResponse);
  }
}

// Message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'INITIALIZE':
      await initializeModel();
      break;
      
    case 'GENERATE':
      if (!isInitialized) {
        self.postMessage({
          type: 'ERROR',
          payload: { message: 'Model not initialized. Please wait for initialization.' },
        } as WorkerResponse);
        return;
      }
      
      self.postMessage({
        type: 'GENERATING',
        payload: { message: 'Incubating creature...' },
      } as WorkerResponse);
      
      try {
        const creature = await generateCreature(payload?.dna || {
          chaos: 50,
          sparkle: 50,
          ancient: 50,
          size: 50,
        });
        
        self.postMessage({
          type: 'RESULT',
          payload: { creature },
        } as WorkerResponse);
      } catch (error) {
        self.postMessage({
          type: 'ERROR',
          payload: { message: `Generation failed: ${error}` },
        } as WorkerResponse);
      }
      break;
      
    case 'STATUS':
      self.postMessage({
        type: 'READY',
        payload: { 
          message: isInitialized ? 'Model ready' : 'Model not initialized',
          isInitialized,
        },
      } as WorkerResponse);
      break;
  }
};

// Export for TypeScript
export {};
