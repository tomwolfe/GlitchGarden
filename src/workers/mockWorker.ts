/**
 * Mock AI Worker
 * Simulates AI generation with pre-written whimsical content
 * Used for UI testing before connecting real WebGPU models
 */

import { generateSvgBlob, generateStory, STORY_TEMPLATES, CREATURE_NAMES } from './shared';

type MockRequestType = 'generate' | 'init' | 'cancel';

interface MockRequest {
  type: MockRequestType;
  payload?: {
    sillyLevel: number;
    spookyLevel: number;
    sleepyLevel: number;
    canvasData?: string | null;
  };
}

interface MockResponse {
  type: 'progress' | 'complete' | 'error' | 'ready';
  payload?: {
    progress?: number;
    status?: string;
    story?: string;
    image?: string;
    isGlitch?: boolean;
    error?: string;
  };
}

// Simulate async generation with progress updates
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
    } as MockResponse);
  }

  const story = generateStory(sillyLevel, spookyLevel, sleepyLevel);
  const image = generateSvgBlob(sillyLevel, spookyLevel, sleepyLevel);

  return { story, image };
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<MockRequest>) => {
  const { type, payload } = event.data;

  try {
    if (type === 'init') {
      self.postMessage({
        type: 'ready',
        payload: { status: 'Mock AI Worker ready!' },
      } as MockResponse);
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
      } as MockResponse);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    } as MockResponse);
  }
};

export {};
