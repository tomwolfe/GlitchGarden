/**
 * AI Worker - Placeholder for Transformers.js Integration
 *
 * Currently uses shared generation for build compatibility.
 * To enable real AI:
 * 1. The dynamic import approach is already implemented but transformers.js
 *    has compatibility issues with Next.js bundling due to import.meta.url usage.
 * 2. For production use with Transformers.js, consider:
 *    - Using a separate Vite build for workers
 *    - Hosting workers on a different domain
 *    - Using the transformers.js CDN directly in the worker
 */

import { generateSvgBlob, generateStory } from './shared';

type AIRequestType = 'init' | 'generate' | 'cancel' | 'clearCache';

interface AIRequest {
  type: AIRequestType;
  payload?: {
    sillyLevel: number;
    spookyLevel: number;
    sleepyLevel: number;
    canvasData?: string | null;
    prompt?: string;
  };
}

interface AIResponse {
  type: 'progress' | 'complete' | 'error' | 'ready' | 'modelProgress';
  payload?: {
    progress?: number;
    status?: string;
    story?: string;
    image?: string;
    isGlitch?: boolean;
    error?: string;
    model?: string;
    modelProgress?: number;
  };
}

// Simulate progress updates during story generation
async function simulateGeneration(
  sillyLevel: number,
  spookyLevel: number,
  sleepyLevel: number
): Promise<{ story: string; image: string }> {
  const totalSteps = 50;

  for (let i = 0; i <= totalSteps; i += 5) {
    await new Promise(resolve => setTimeout(resolve, 100));

    let status = '';
    if (i < 10) status = 'Warming up the imagination...';
    else if (i < 25) status = 'Mixing potion ingredients...';
    else if (i < 40) status = 'Weaving dream threads...';
    else if (i < 50) status = 'Adding sparkles and stardust...';
    else status = 'Polishing the magic...';

    self.postMessage({
      type: 'progress',
      payload: {
        progress: i,
        status,
      },
    } as AIResponse);
  }

  const story = generateStory(sillyLevel, spookyLevel, sleepyLevel);
  const image = generateSvgBlob(sillyLevel, spookyLevel, sleepyLevel);

  return { story, image };
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<AIRequest>) => {
  const { type, payload } = event.data;

  try {
    if (type === 'init') {
      self.postMessage({
        type: 'ready',
        payload: { status: 'AI Worker ready (using shared generation)!' },
      } as AIResponse);
    }

    if (type === 'generate') {
      if (!payload) {
        throw new Error('Missing payload for generate request');
      }

      const { sillyLevel, spookyLevel, sleepyLevel } = payload;

      // Generate the content
      const { story, image } = await simulateGeneration(sillyLevel, spookyLevel, sleepyLevel);

      // 30% chance of glitch
      const isGlitch = Math.random() < 0.3;

      self.postMessage({
        type: 'complete',
        payload: {
          progress: 100,
          status: 'Dream complete!',
          story,
          image,
          isGlitch,
        },
      } as AIResponse);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    } as AIResponse);
  }
};

export {};
