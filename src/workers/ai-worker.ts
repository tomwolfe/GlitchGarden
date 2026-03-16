import { pipeline, env } from '@xenova/transformers';

// Force browser-based models from HF CDN
env.allowLocalModels = false;
env.useBrowserCache = true;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let textGenerator: any = null;
let isInitialized = false;

interface WorkerMessage {
  type: string;
  payload?: {
    silly: number;
    spooky: number;
    sleepy: number;
    chaos: number;
  };
}

interface ProgressEvent {
  status: string;
  loaded: number;
  total: number;
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  if (type === 'INIT') {
    try {
      self.postMessage({ type: 'LOADING', message: 'Waking up Pixel...' });

      textGenerator = await pipeline(
        'text2text-generation',
        'Xenova/LaMini-Flan-T578M',
        {
          quantized: true,
          progress_callback: (progress: ProgressEvent) => {
            if (progress.status === 'progress') {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              self.postMessage({
                type: 'LOADING_PROGRESS',
                percent,
                message: `Downloading model: ${percent}%`
              });
            }
          }
        }
      );

      isInitialized = true;
      self.postMessage({ type: 'READY', message: 'Pixel is ready!' });
    } catch (err) {
      const error = err as Error;
      self.postMessage({
        type: 'ERROR',
        message: `Failed to load model: ${error.message}`
      });
    }
  }

  if (type === 'GENERATE_STORY') {
    if (!isInitialized || !textGenerator) {
      self.postMessage({ type: 'ERROR', message: 'Model not initialized' });
      return;
    }

    const { silly, spooky, sleepy, chaos } = payload!;

    // Build prompt from slider values
    const moodDesc: string[] = [];
    if (silly > 50) moodDesc.push('funny and silly');
    if (spooky > 50) moodDesc.push('mysterious and spooky');
    if (sleepy > 50) moodDesc.push('calm and sleepy');
    if (chaos > 50) moodDesc.push('weird and glitchy');

    // Add creature type based on mood combination
    let creatureType = 'magical creature';
    if (silly > 70) creatureType = 'wiggly, giggly creature';
    if (spooky > 70) creatureType = 'shadowy, mysterious being';
    if (sleepy > 70) creatureType = 'fluffy, drowsy animal';
    if (chaos > 70) creatureType = 'glitchy, shimmering entity';

    const moodText = moodDesc.length > 0 ? moodDesc.join(', ') : 'magical';
    const prompt = `Write a 15 word children's story about a ${creatureType} that is ${moodText}. Make it fun for kids.`;

    try {
      const output = await textGenerator(prompt, {
        max_new_tokens: 30,
        temperature: Math.max(0.5, chaos / 50), // Higher chaos = more variation
        top_p: 0.9,
      });

      const rawText = output[0]?.generated_text || 'A magical creature appears!';

      // Run safety filter
      const filtered = runSafetyCheck(rawText);
      const isSafe = filtered !== null;

      self.postMessage({
        type: 'STORY_RESULT',
        text: filtered,
        safe: isSafe,
        mood: { silly, spooky, sleepy, chaos }
      });
    } catch (err) {
      const error = err as Error;
      self.postMessage({
        type: 'ERROR',
        message: `Generation failed: ${error.message}`
      });
    }
  }
};

function runSafetyCheck(text: string): string {
  // Simple local keyword filter for COPPA compliance
  const blocked = [
    'bad', 'mean', 'scary', 'hurt', 'kill', 'die', 'death',
    'blood', 'weapon', 'fight', 'evil', 'dark', 'nightmare'
  ];

  const lower = text.toLowerCase();

  if (blocked.some(word => lower.includes(word))) {
    return "A magical creature appears in the story!";
  }

  // Ensure the text is child-friendly
  if (text.length < 5) {
    return "A wonderful creature emerges with a sparkle!";
  }

  return text;
}
