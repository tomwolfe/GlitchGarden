'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useStoryStore } from '@/store/useStoryStore';

interface WorkerPayload {
  sillyLevel: number;
  spookyLevel: number;
  sleepyLevel: number;
  canvasData: string | null;
}

interface WorkerMessage {
  type: 'progress' | 'complete' | 'error' | 'ready' | 'modelProgress';
  payload?: {
    progress?: number;
    status?: string;
    story?: string;
    image?: string;
    isGlitch?: boolean;
    error?: string;
  };
}

interface UseDreamWorkerReturn {
  handleDream: () => void;
  cancelGeneration: () => void;
  isWorkerReady: boolean;
}

/**
 * Custom hook for managing Web Worker lifecycle for dream generation.
 * 
 * Key features:
 * - Singleton worker instances that persist across generations
 * - Proper cancellation without destroying the worker
 * - Separation of worker logic from UI components
 */
export function useDreamWorker(): UseDreamWorkerReturn {
  const {
    sillyLevel,
    spookyLevel,
    sleepyLevel,
    canvasData,
    isMockMode,
    setIsGenerating,
    setGenerationProgress,
    setGenerationStatus,
    setCurrentStory,
    setCurrentImage,
    setGlitch,
    setCanCatch,
    cancelGeneration: storeCancelGeneration,
  } = useStoryStore();

  const mockWorkerRef = useRef<Worker | null>(null);
  const aiWorkerRef = useRef<Worker | null>(null);
  const isWorkerActiveRef = useRef(false);
  const isWorkerReadyRef = useRef(false);
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  // Initialize workers on mount
  useEffect(() => {
    // Initialize mock worker
    const mockWorker = new Worker(new URL('@/workers/mockWorker.ts', import.meta.url));
    mockWorkerRef.current = mockWorker;

    mockWorker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const { type, payload } = event.data;

      if (type === 'progress') {
        if (payload?.progress !== undefined) {
          setGenerationProgress(payload.progress);
        }
        if (payload?.status) {
          setGenerationStatus(payload.status);
        }
      }

      if (type === 'complete') {
        isWorkerActiveRef.current = false;
        setCurrentStory(payload?.story || null);
        setCurrentImage(payload?.image || null);
        setGlitch(payload?.isGlitch || false);
        setCanCatch(payload?.isGlitch || false);
        setIsGenerating(false);
      }

      if (type === 'error') {
        isWorkerActiveRef.current = false;
        if (payload?.error === 'Cancelled') {
          storeCancelGeneration();
          return;
        }
        console.error('Mock worker error:', payload?.error);
        setIsGenerating(false);
      }

      if (type === 'ready') {
        isWorkerReadyRef.current = true;
        setIsWorkerReady(true);
      }
    };

    // Initialize AI worker if not in mock mode
    if (!isMockMode) {
      const aiWorker = new Worker(new URL('@/workers/aiWorker.ts', import.meta.url), { type: 'module' });
      aiWorkerRef.current = aiWorker;

      aiWorker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const { type, payload } = event.data;

        if (type === 'progress' || type === 'modelProgress') {
          if (payload?.progress !== undefined) {
            setGenerationProgress(payload.progress);
          }
          if (payload?.status) {
            setGenerationStatus(payload.status);
          }
        }

        if (type === 'complete') {
          isWorkerActiveRef.current = false;
          setCurrentStory(payload?.story || null);
          setCurrentImage(payload?.image || null);
          setGlitch(payload?.isGlitch || false);
          setCanCatch(payload?.isGlitch || false);
          setIsGenerating(false);
        }

        if (type === 'ready') {
          isWorkerReadyRef.current = true;
          setIsWorkerReady(true);
          setGenerationStatus('AI models ready!');
        }

        if (type === 'error') {
          isWorkerActiveRef.current = false;
          if (payload?.error === 'Cancelled') {
            storeCancelGeneration();
            return;
          }
          console.error('AI worker error:', payload?.error);
          setIsGenerating(false);
          setGenerationStatus('Error: ' + (payload?.error || 'Unknown error'));
        }
      };

      // Initialize AI models
      aiWorker.postMessage({ type: 'init' });
    } else {
      // In mock mode, send init to mock worker
      mockWorker.postMessage({ type: 'init' });
    }

    // Cleanup on unmount - only terminate workers when component unmounts
    return () => {
      mockWorker.terminate();
      aiWorkerRef.current?.terminate();
    };
  }, [isMockMode, setCurrentStory, setCurrentImage, setGlitch, setCanCatch, setIsGenerating, setGenerationProgress, setGenerationStatus, storeCancelGeneration]);

  // Cancel ongoing generation without terminating worker
  const cancelGeneration = useCallback(() => {
    if (isWorkerActiveRef.current) {
      // Send cancel message to the active worker
      if (isMockMode && mockWorkerRef.current) {
        mockWorkerRef.current.postMessage({ type: 'cancel' });
      } else if (aiWorkerRef.current) {
        aiWorkerRef.current.postMessage({ type: 'cancel' });
      }
      isWorkerActiveRef.current = false;
    }
  }, [isMockMode]);

  // Handle dream generation
  const handleDream = useCallback(() => {
    // Cancel any ongoing generation first (without terminating worker)
    if (isWorkerActiveRef.current) {
      if (isMockMode && mockWorkerRef.current) {
        mockWorkerRef.current.postMessage({ type: 'cancel' });
      } else if (aiWorkerRef.current) {
        aiWorkerRef.current.postMessage({ type: 'cancel' });
      }
      // Wait a brief moment for cancellation to process
      isWorkerActiveRef.current = false;
    }

    // CRITICAL FIX: Do NOT terminate workers here!
    // The workers maintain the loaded AI model in memory.
    // Terminating would force a full reload of the ~600MB model on next generation.

    // Start the new generation
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Starting dream sequence...');
    setGlitch(false);
    setCanCatch(false);
    isWorkerActiveRef.current = true;

    const payload: WorkerPayload = {
      sillyLevel,
      spookyLevel,
      sleepyLevel,
      canvasData,
    };

    if (isMockMode && mockWorkerRef.current) {
      mockWorkerRef.current.postMessage({ type: 'generate', payload });
    } else if (aiWorkerRef.current) {
      aiWorkerRef.current.postMessage({ type: 'generate', payload });
    }
  }, [
    sillyLevel,
    spookyLevel,
    sleepyLevel,
    canvasData,
    isMockMode,
    setIsGenerating,
    setGenerationProgress,
    setGenerationStatus,
    setGlitch,
    setCanCatch,
  ]);

  return {
    handleDream,
    cancelGeneration,
    isWorkerReady,
  };
}
