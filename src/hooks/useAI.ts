import { useState, useEffect, useCallback, useRef } from 'react';

export function useAI() {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((value: any) => void) | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/ai-worker.js', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event) => {
      const { type, data } = event.data;

      if (type === 'progress') {
        if (data.status === 'progress') {
          setProgress(data.progress);
        }
      } else if (type === 'ready') {
        setIsReady(true);
      } else if (type === 'result') {
        if (resolveRef.current) {
          resolveRef.current(data);
          resolveRef.current = null;
        }
      } else if (type === 'error') {
        setError(data);
      }
    };

    worker.postMessage({ type: 'load' });
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const generate = useCallback(async (prompt: string): Promise<string | null> => {
    if (!workerRef.current || !isReady) return null;

    return new Promise((resolve) => {
      resolveRef.current = resolve;
      workerRef.current?.postMessage({
        type: 'generate',
        data: { prompt },
      });
    });
  }, [isReady]);

  return { isReady, progress, error, generate };
}
