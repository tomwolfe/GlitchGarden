/**
 * Mock AI Worker
 * Simulates AI generation with pre-written whimsical content
 * Used for UI testing before connecting real WebGPU models
 */

import {
  generateSvgBlob,
  generateStory,
  getCanvasComplexity,
  type WorkerPayload,
  type WorkerResponse,
} from './shared';

type MockRequestType = 'generate' | 'init' | 'cancel';

interface MockRequest {
  type: MockRequestType;
  payload?: WorkerPayload;
}

let cancellationRequested = false;

// Simulate async generation with progress updates
async function simulateGeneration(
  sillyLevel: number,
  spookyLevel: number,
  sleepyLevel: number,
  canvasData: string | null = null
): Promise<{ story: string; image: string }> {
  const canvasComplexity = getCanvasComplexity(canvasData);
  const totalSteps = 50;

  for (let i = 0; i <= totalSteps; i += 5) {
    // Check for cancellation at each step
    if (cancellationRequested) {
      throw new Error('Generation cancelled');
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

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
    } satisfies WorkerResponse);
  }

  const story = generateStory(sillyLevel, spookyLevel, sleepyLevel);
  const image = generateSvgBlob(
    sillyLevel,
    spookyLevel,
    sleepyLevel,
    canvasComplexity
  );

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
      } satisfies WorkerResponse);
    }

    if (type === 'cancel') {
      cancellationRequested = true;
      self.postMessage({
        type: 'progress',
        payload: {
          status: 'Generation cancelled',
          progress: 0,
        },
      } satisfies WorkerResponse);
      return;
    }

    if (type === 'generate') {
      // Reset cancellation flag
      cancellationRequested = false;

      if (!payload) {
        throw new Error('Missing payload for generate request');
      }

      const { sillyLevel, spookyLevel, sleepyLevel, canvasData } = payload;

      try {
        // Generate the content
        const { story, image } = await simulateGeneration(
          sillyLevel,
          spookyLevel,
          sleepyLevel,
          canvasData ?? null
        );

        // Check cancellation after generation
        if (cancellationRequested) {
          throw new Error('Generation cancelled');
        }

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
        } satisfies WorkerResponse);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === 'Generation cancelled'
        ) {
          self.postMessage({
            type: 'error',
            payload: {
              error: 'Cancelled',
            },
          } satisfies WorkerResponse);
          return;
        }
        throw error;
      }
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    } satisfies WorkerResponse);
  }
};

export {};
