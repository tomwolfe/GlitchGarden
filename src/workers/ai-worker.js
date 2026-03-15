import { env, pipeline } from '@xenova/transformers';

// Skip local check and use CDN for models (handled by transformers.js)
env.allowLocalModels = false;
env.useBrowserCache = true;

class TextGenerationPipeline {
  static task = 'text-generation';
  static model = 'Xenova/SmolLM-135M-Instruct';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

self.onmessage = async (event) => {
  const { type, data } = event.data;

  if (type === 'load') {
    try {
      await TextGenerationPipeline.getInstance((x) => {
        self.postMessage({ type: 'progress', data: x });
      });
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ type: 'error', data: error.message });
    }
  }

  if (type === 'generate') {
    try {
      const generator = await TextGenerationPipeline.getInstance();
      
      const { prompt } = data;
      
      const output = await generator(prompt, {
        max_new_tokens: 256,
        temperature: 0.7,
        do_sample: true,
        top_k: 50,
        return_full_text: false,
      });

      self.postMessage({ type: 'result', data: output[0].generated_text });
    } catch (error) {
      self.postMessage({ type: 'error', data: error.message });
    }
  }
};
