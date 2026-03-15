/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI Worker - Real Local AI with Transformers.js
 * Uses @xenova/transformers for in-browser text generation
 *
 * This file requires `any` types due to complex union types in transformers.js
 */

import { pipeline, env } from '@xenova/transformers';
import {
  generateSvgBlob,
  CREATURE_NAMES,
  analyzeCanvasData,
  type WorkerPayload,
  type WorkerResponse,
  type CanvasAnalysis,
} from './shared';

type AIRequestType = 'init' | 'generate' | 'cancel' | 'clearCache';

interface AIRequest {
  type: AIRequestType;
  payload?: WorkerPayload;
}

// Singleton pattern for model loading
let textGenerator: Awaited<ReturnType<typeof pipeline>> | null = null;
let modelLoading = false;
let cancellationRequested = false;
let transformersLoaded = false;

// Type for transformers.js progress callback
interface TransformersProgress {
  status: string;
  loaded?: number;
  total?: number;
}

/**
 * Configure transformers.js environment
 */
function configureTransformers(): void {
  if (transformersLoaded) {
    return;
  }

  env.allowLocalModels = false;
  env.useBrowserCache = true;

  transformersLoaded = true;
}

/**
 * Load the text generation model
 */
async function loadModel(): Promise<Awaited<ReturnType<typeof pipeline>>> {
  if (textGenerator) {
    return textGenerator;
  }

  if (modelLoading) {
    // Wait for ongoing load
    while (modelLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (textGenerator) {
      return textGenerator;
    }
  }

  modelLoading = true;

  try {
    configureTransformers();

    self.postMessage({
      type: 'modelProgress',
      payload: {
        status: 'Loading AI model...',
        modelProgress: 0,
      },
    } satisfies WorkerResponse);

    // Model configuration - using SmolLM-135M for stability in browser
    // Use the ONNX community version which has the proper ONNX exported files
    const MODEL_ID = 'onnx-community/SmolLM-135M-Instruct-ONNX';

    textGenerator = await pipeline('text-generation', MODEL_ID, {
      progress_callback: (progress: TransformersProgress) => {
        if (progress.status === 'progress') {
          const percent = Math.round(
            ((progress.loaded ?? 0) / (progress.total ?? 1)) * 100
          );
          self.postMessage({
            type: 'modelProgress',
            payload: {
              status: `Downloading model: ${percent}%`,
              modelProgress: percent,
            },
          } satisfies WorkerResponse);
        } else if (progress.status === 'done') {
          self.postMessage({
            type: 'modelProgress',
            payload: {
              status: 'Model loaded!',
              modelProgress: 100,
            },
          } satisfies WorkerResponse);
        }
      },
    });

    modelLoading = false;
    return textGenerator;
  } catch (error) {
    modelLoading = false;
    throw error;
  }
}

/**
 * Build a prompt for the AI model based on potion levels and canvas data
 */
function buildPrompt(
  sillyLevel: number,
  spookyLevel: number,
  sleepyLevel: number,
  canvasAnalysis: CanvasAnalysis
): string {
  const creature =
    CREATURE_NAMES[Math.floor(Math.random() * CREATURE_NAMES.length)];

  // Build personality traits based on levels
  const traits: string[] = [];

  if (sillyLevel > 60) {
    traits.push('playful and silly');
  } else if (sillyLevel > 30) {
    traits.push('somewhat playful');
  }

  if (spookyLevel > 60) {
    traits.push('mysterious and slightly spooky');
  } else if (spookyLevel > 30) {
    traits.push('a bit mysterious');
  }

  if (sleepyLevel > 60) {
    traits.push('dreamy and sleepy');
  } else if (sleepyLevel > 30) {
    traits.push('calm and relaxed');
  }

  const personality =
    traits.length > 0 ? traits.join(', ') : 'ordinary';

  // Build the prompt for SmolLM-Instruct
  const prompt = `Write a short, magical story (2-3 sentences) for children about a ${personality} creature called a "${creature}". The user drew ${canvasAnalysis.description} which inspired this story. Make it fun and imaginative. Start with "Once upon a time" or similar magical opening.`;

  return prompt;
}

/**
 * Generate story text using the AI model with retry logic
 */
async function generateStoryWithAI(
  sillyLevel: number,
  spookyLevel: number,
  sleepyLevel: number,
  canvasData: string | null
): Promise<string> {
  const canvasAnalysis = analyzeCanvasData(canvasData);
  const prompt = buildPrompt(
    sillyLevel,
    spookyLevel,
    sleepyLevel,
    canvasAnalysis
  );

  // Report progress
  self.postMessage({
    type: 'progress',
    payload: {
      progress: 10,
      status: 'Consulting the AI oracle...',
    },
  } satisfies WorkerResponse);

  // Load model if needed
  const generator = await loadModel();

  // Check cancellation before proceeding
  if (cancellationRequested) {
    throw new Error('Generation cancelled');
  }

  self.postMessage({
    type: 'progress',
    payload: {
      progress: 30,
      status: 'Weaving dream threads with AI...',
    },
  } satisfies WorkerResponse);

  // Retry logic for handling RangeError and other transient failures
  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Generate text with cancellation check capability
      // Using safer parameters to avoid RangeError: offset is out of bounds
      // @ts-expect-error - transformers.js has complex union types that are incompatible
      const output = await generator(prompt, {
        max_new_tokens: 40, // Reduced for smaller model
        temperature: 0.7,
        top_p: 0.9,
        top_k: 30,
        do_sample: true,
        repetition_penalty: 1.2,
      });

      // Check cancellation after generation completes
      if (cancellationRequested) {
        throw new Error('Generation cancelled');
      }

      self.postMessage({
        type: 'progress',
        payload: {
          progress: 80,
          status: 'Polishing the magic words...',
        },
      } satisfies WorkerResponse);

      // Extract and clean the generated text
      // @ts-expect-error - transformers.js output type is complex union
      let story = output[0]?.generated_text ?? '';

      // Remove the prompt from the output (model includes the input)
      if (story.startsWith(prompt)) {
        story = story.slice(prompt.length);
      }

      // Clean up whitespace and ensure it starts properly
      story = story.trim();

      // If the story doesn't start with a capital letter or quote, add a magical opening
      if (!story.match(/^[A-Z"]/)) {
        story =
          'Once upon a time, ' +
          story.charAt(0).toLowerCase() +
          story.slice(1);
      }

      // Ensure it ends with punctuation
      if (!story.match(/[.!?]$/)) {
        story += '.';
      }

      return story;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Check if it's a RangeError (memory/buffer issue)
      if (lastError.name === 'RangeError' || lastError.message.includes('offset is out of bounds')) {
        console.warn(`AI model RangeError (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, lastError.message);

        if (attempt < MAX_RETRIES) {
          // Clear model cache and reload
          textGenerator = null;
          self.postMessage({
            type: 'progress',
            payload: {
              progress: 20,
              status: `Reinitializing AI model (attempt ${attempt + 2}/${MAX_RETRIES + 1})...`,
            },
          } satisfies WorkerResponse);

          // Wait a moment before retry
          await new Promise(resolve => setTimeout(resolve, 500));

          // Reload the model
          await loadModel();
          continue;
        }
      }

      // For non-RangeError or after max retries, rethrow
      throw lastError;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error('Generation failed after all retries');
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<AIRequest>) => {
  const { type, payload } = event.data;

  try {
    if (type === 'init') {
      // Pre-load transformers.js and model in the background
      try {
        configureTransformers();
        loadModel().catch((error: Error) => {
          self.postMessage({
            type: 'error',
            payload: {
              error: `Failed to load model: ${error.message || 'Unknown error'}`,
            },
          } satisfies WorkerResponse);
        });
      } catch (error) {
        self.postMessage({
          type: 'error',
          payload: {
            error: `Failed to initialize AI: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        } satisfies WorkerResponse);
      }

      self.postMessage({
        type: 'ready',
        payload: { status: 'AI Worker ready - loading models...' },
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
        // Generate story using AI
        const story = await generateStoryWithAI(
          sillyLevel,
          spookyLevel,
          sleepyLevel,
          canvasData ?? null
        );

        if (cancellationRequested) {
          throw new Error('Generation cancelled');
        }

        // Generate SVG image (procedural, but influenced by levels)
        const image = generateSvgBlob(sillyLevel, spookyLevel, sleepyLevel);

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
        if (error instanceof Error && error.message === 'Generation cancelled') {
          self.postMessage({
            type: 'error',
            payload: {
              error: 'Cancelled',
            },
          } satisfies WorkerResponse);
          return;
        }

        // Log the full error for debugging
        console.error('AI generation failed:', error);

        // If AI fails after retries, generate a fallback story procedurally
        const fallbackStories = [
          `Once upon a time, a magical creature wandered through a land of wonder. It discovered a hidden cave filled with sparkling crystals that sang lullabies under the moonlight.`,
          `In a faraway enchanted forest, a mysterious being made friends with the wind. Together, they danced through the trees, leaving trails of stardust behind.`,
          `Long ago, a dreamy creature climbed the highest mountain to catch a falling star. When it succeeded, the star granted it three wishes for kindness.`,
          `There once was a playful spirit who loved to paint rainbows across the sky. Every sunset was a masterpiece created with joy and imagination.`,
          `In the kingdom of dreams, a gentle soul discovered a secret garden where flowers bloomed with light instead of petals.`,
        ];

        const fallbackStory = fallbackStories[Math.floor(Math.random() * fallbackStories.length)];

        self.postMessage({
          type: 'complete',
          payload: {
            progress: 100,
            status: 'Dream complete! (fallback mode)',
            story: fallbackStory,
            image: generateSvgBlob(sillyLevel, spookyLevel, sleepyLevel),
            isGlitch: true, // Mark as glitch since AI failed
          },
        } satisfies WorkerResponse);
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
