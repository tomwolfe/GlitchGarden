/**
 * AI Worker - Real Local AI with Transformers.js
 * Uses @huggingface/transformers for in-browser text generation
 *
 * Note: Transformers.js is loaded from CDN at runtime to avoid Next.js bundling issues.
 * See: https://huggingface.co/docs/transformers.js/guides/nextjs
 */

import { generateSvgBlob, CREATURE_NAMES } from './shared';

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

// Singleton pattern for model loading
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let textGenerator: any = null;
let modelLoading = false;
let cancellationRequested = false;
let transformersLoaded = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipeline: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let env: any = null;

/**
 * Load transformers.js from CDN using dynamic import
 * This avoids webpack bundling issues with Next.js
 * Tries multiple CDNs for reliability
 */
async function loadTransformers(): Promise<void> {
  if (transformersLoaded) {
    return;
  }

  try {
    // List of CDN URLs to try in order of preference
    const cdnUrls = [
      'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/dist/transformers.min.js',
      'https://unpkg.com/@huggingface/transformers@3.0.0/dist/transformers.min.js',
      'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/dist/transformers.js',
    ];

    let lastError: unknown = null;
    let loaded = false;

    // Try dynamic import first (works better with modern workers)
    for (const url of cdnUrls) {
      try {
        // Use dynamic import instead of importScripts for better compatibility
        // @ts-expect-error - dynamic import in worker
        await import(url);
        loaded = true;
        break;
      } catch (e) {
        lastError = e;
        console.warn(`Failed to load transformers.js from ${url}, trying next CDN...`);
      }
    }

    // Fallback to importScripts if dynamic import fails
    if (!loaded) {
      for (const url of cdnUrls) {
        try {
          // @ts-expect-error - importScripts is available in web workers
          importScripts(url);
          loaded = true;
          break;
        } catch (e) {
          lastError = e;
          console.warn(`Failed to load transformers.js via importScripts from ${url}, trying next CDN...`);
        }
      }
    }

    if (!loaded) {
      throw lastError || new Error('Failed to load transformers.js from all CDNs');
    }

    // @ts-expect-error - transformers is loaded into global scope by the CDN script
    const { pipeline: pipe, env: environment } = self.transformers;

    pipeline = pipe;
    env = environment;

    // Configure environment for browser caching
    if (env) {
      env.allowLocalModels = false;
      env.useBrowserCache = true;
    }

    transformersLoaded = true;
  } catch (error) {
    console.error('Failed to load transformers.js:', error);
    throw new Error(`Failed to load AI library. Please ensure you have a stable internet connection. If the problem persists, try using mock mode.`);
  }
}

/**
 * Load the text generation model
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadModel(): Promise<any> {
  if (textGenerator) {
    return textGenerator;
  }

  if (modelLoading) {
    // Wait for ongoing load
    while (modelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return textGenerator;
  }

  modelLoading = true;

  try {
    await loadTransformers();

    self.postMessage({
      type: 'modelProgress',
      payload: {
        status: 'Loading AI model...',
        modelProgress: 0,
      },
    } as AIResponse);

    // Model configuration - using TinyLlama for speed
    const MODEL_ID = 'Xenova/TinyLlama-1.1B-Chat-v1.0';

    textGenerator = await pipeline('text-generation', MODEL_ID, {
      progress_callback: (progress: { status: string; loaded: number; total: number }) => {
        if (progress.status === 'progress') {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          self.postMessage({
            type: 'modelProgress',
            payload: {
              status: `Downloading model: ${percent}%`,
              modelProgress: percent,
            },
          } as AIResponse);
        } else if (progress.status === 'done') {
          self.postMessage({
            type: 'modelProgress',
            payload: {
              status: 'Model loaded!',
              modelProgress: 100,
            },
          } as AIResponse);
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
 * Analyze canvas data to extract complexity metrics
 */
function analyzeCanvasData(canvasData: string | null): { complexity: number; description: string } {
  if (!canvasData) {
    return { complexity: 0, description: 'no drawing' };
  }

  try {
    // Decode base64 to get image data
    const base64Data = canvasData.split(',')[1];
    if (!base64Data) {
      return { complexity: 0, description: 'an empty canvas' };
    }

    // Create a simple complexity metric based on data length
    // Longer base64 = more pixels drawn = more complex drawing
    const dataLength = base64Data.length;
    
    // Normalize complexity to 0-100 scale
    // Typical empty canvas is ~1000-2000 chars, full drawing can be 10000+
    const minData = 1000;
    const maxData = 15000;
    const complexity = Math.min(100, Math.max(0, ((dataLength - minData) / (maxData - minData)) * 100));

    let description = 'a simple drawing';
    if (complexity > 80) {
      description = 'a very complex and detailed drawing';
    } else if (complexity > 50) {
      description = 'a moderately detailed drawing';
    } else if (complexity > 20) {
      description = 'a simple sketch';
    }

    return { complexity: Math.round(complexity), description };
  } catch {
    return { complexity: 0, description: 'no drawing' };
  }
}

/**
 * Build a prompt for the AI model based on potion levels and canvas data
 */
function buildPrompt(
  sillyLevel: number,
  spookyLevel: number,
  sleepyLevel: number,
  canvasAnalysis: { complexity: number; description: string }
): string {
  const creature = CREATURE_NAMES[Math.floor(Math.random() * CREATURE_NAMES.length)];

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

  const personality = traits.length > 0 ? traits.join(', ') : 'ordinary';

  // Build the prompt
  const prompt = `You are a whimsical children's story writer. Write a short, magical story (2-3 sentences) about a ${personality} creature called a "${creature}". The user drew ${canvasAnalysis.description} which inspired this story. Make it fun, imaginative, and suitable for children. Start with "Once upon a time" or similar magical opening.`;

  return prompt;
}

/**
 * Generate story text using the AI model
 */
async function generateStoryWithAI(
  sillyLevel: number,
  spookyLevel: number,
  sleepyLevel: number,
  canvasData: string | null
): Promise<string> {
  const canvasAnalysis = analyzeCanvasData(canvasData);
  const prompt = buildPrompt(sillyLevel, spookyLevel, sleepyLevel, canvasAnalysis);

  // Report progress
  self.postMessage({
    type: 'progress',
    payload: {
      progress: 10,
      status: 'Consulting the AI oracle...',
    },
  } as AIResponse);

  // Load model if needed
  const generator = await loadModel();

  if (cancellationRequested) {
    throw new Error('Generation cancelled');
  }

  self.postMessage({
    type: 'progress',
    payload: {
      progress: 30,
      status: 'Weaving dream threads with AI...',
    },
  } as AIResponse);

  // Generate text
  const output = await generator(prompt, {
    max_new_tokens: 60,
    temperature: 0.7 + (sillyLevel / 100) * 0.3,
    top_p: 0.9,
    do_sample: true,
  });

  if (cancellationRequested) {
    throw new Error('Generation cancelled');
  }

  self.postMessage({
    type: 'progress',
    payload: {
      progress: 80,
      status: 'Polishing the magic words...',
    },
  } as AIResponse);

  // Extract and clean the generated text
  let story = output[0]?.generated_text || '';
  
  // Remove the prompt from the output (model includes the input)
  if (story.startsWith(prompt)) {
    story = story.slice(prompt.length);
  }
  
  // Clean up whitespace and ensure it starts properly
  story = story.trim();
  
  // If the story doesn't start with a capital letter or quote, add a magical opening
  if (!story.match(/^[A-Z"]/)) {
    story = 'Once upon a time, ' + story.charAt(0).toLowerCase() + story.slice(1);
  }

  // Ensure it ends with punctuation
  if (!story.match(/[.!?]$/)) {
    story += '.';
  }

  return story;
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<AIRequest>) => {
  const { type, payload } = event.data;

  try {
    if (type === 'init') {
      // Pre-load transformers.js and model in the background
      loadTransformers().then(() => {
        loadModel().catch(error => {
          self.postMessage({
            type: 'error',
            payload: {
              error: `Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          } as AIResponse);
        });
      }).catch(error => {
        self.postMessage({
          type: 'error',
          payload: {
            error: `Failed to initialize AI: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        } as AIResponse);
      });

      self.postMessage({
        type: 'ready',
        payload: { status: 'AI Worker ready - loading models...' },
      } as AIResponse);
    }

    if (type === 'cancel') {
      cancellationRequested = true;
      self.postMessage({
        type: 'progress',
        payload: {
          status: 'Generation cancelled',
          progress: 0,
        },
      } as AIResponse);
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
        const story = await generateStoryWithAI(sillyLevel, spookyLevel, sleepyLevel, canvasData || null);

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
        } as AIResponse);
      } catch (error) {
        if (error instanceof Error && error.message === 'Generation cancelled') {
          self.postMessage({
            type: 'error',
            payload: {
              error: 'Cancelled',
            },
          } as AIResponse);
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
    } as AIResponse);
  }
};

export {};
