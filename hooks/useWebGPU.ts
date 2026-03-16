'use client';

import { useEffect, useState, useCallback } from 'react';

// WebGPU types (may not be available in all environments)
interface WebGPUAdapterInfo {
  vendor?: string;
  architecture?: string;
  device?: string;
  description?: string;
}

export interface WebGPUStatus {
  isSupported: boolean | null;
  isLowPowerMode: boolean;
  adapterInfo?: WebGPUAdapterInfo;
}

/**
 * Hook to detect WebGPU support and capabilities
 * Falls back to WASM if WebGPU is unavailable
 */
export function useWebGPUDetection(): WebGPUStatus {
  const [status, setStatus] = useState<WebGPUStatus>({
    isSupported: null,
    isLowPowerMode: false,
  });

  useEffect(() => {
    async function checkWebGPU() {
      // Check if WebGPU is supported
      if (!('gpu' in navigator)) {
        setStatus({
          isSupported: false,
          isLowPowerMode: true,
        });
        return;
      }

      try {
        // Request adapter to get detailed info
        const adapter = await (navigator as any).gpu.requestAdapter();
        
        if (!adapter) {
          setStatus({
            isSupported: false,
            isLowPowerMode: true,
          });
          return;
        }

        // Get adapter info
        const adapterInfo = await adapter.requestAdapterInfo() as WebGPUAdapterInfo;
        
        // Check if it's a software renderer (low power mode)
        const isSoftware = (adapterInfo.device?.toLowerCase().includes('software') ||
                          adapterInfo.architecture?.toLowerCase().includes('software') ||
                          adapterInfo.vendor?.toLowerCase().includes('llvmpipe')) ?? false;

        setStatus({
          isSupported: true,
          isLowPowerMode: isSoftware,
          adapterInfo,
        });
      } catch (error) {
        console.error('WebGPU detection error:', error);
        setStatus({
          isSupported: false,
          isLowPowerMode: true,
        });
      }
    }

    checkWebGPU();
  }, []);

  return status;
}

/**
 * Hook to manage the bio-worker lifecycle
 */
export function useBioWorker() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ message: string; progress: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize worker
  useEffect(() => {
    const bioWorker = new Worker(new URL('@/lib/bio-worker.ts', import.meta.url), {
      type: 'module',
    });

    bioWorker.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'READY':
          setIsReady(true);
          setError(null);
          break;
        case 'PROGRESS':
          setProgress(payload);
          break;
        case 'GENERATING':
          setIsGenerating(true);
          setProgress({ message: payload.message, progress: 0 });
          break;
        case 'RESULT':
          setIsGenerating(false);
          setProgress(null);
          break;
        case 'ERROR':
          setIsGenerating(false);
          setProgress(null);
          setError(payload.message);
          break;
      }
    };

    bioWorker.onerror = (error) => {
      console.error('Worker error:', error);
      setError(`Worker error: ${error.message}`);
    };

    // Initialize the model
    bioWorker.postMessage({ type: 'INITIALIZE' });

    setWorker(bioWorker);

    return () => {
      bioWorker.terminate();
    };
  }, []);

  const generateCreature = useCallback(
    (dna: { chaos: number; sparkle: number; ancient: number; size: number }) => {
      return new Promise((resolve, reject) => {
        if (!worker) {
          reject(new Error('Worker not initialized'));
          return;
        }

        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'RESULT') {
            worker.removeEventListener('message', handleMessage);
            resolve(event.data.payload.creature);
          } else if (event.data.type === 'ERROR') {
            worker.removeEventListener('message', handleMessage);
            reject(new Error(event.data.payload.message));
          }
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({
          type: 'GENERATE',
          payload: { dna },
        });
      });
    },
    [worker]
  );

  return {
    worker,
    isReady,
    isGenerating,
    progress,
    error,
    generateCreature,
  };
}
