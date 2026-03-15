'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { StoryPotions } from '@/components/StoryPotions';
import { MagicCanvas } from '@/components/MagicCanvas';
import { DreamButton } from '@/components/DreamButton';
import { StoryOutput } from '@/components/StoryOutput';
import { LoadingOverlay } from '@/components/LoadingOverlay';

type WorkerType = Worker | null;

export default function Home() {
  const {
    sillyLevel,
    spookyLevel,
    sleepyLevel,
    canvasData,
    isGenerating,
    generationProgress,
    generationStatus,
    setIsGenerating,
    setGenerationProgress,
    setGenerationStatus,
    setCurrentStory,
    setCurrentImage,
    setGlitch,
    setCanCatch,
    isMockMode,
    cancelGeneration,
  } = useStoryStore();

  const mockWorkerRef = useRef<WorkerType>(null);
  const aiWorkerRef = useRef<WorkerType>(null);
  const isWorkerActiveRef = useRef(false);

  // Initialize workers
  useEffect(() => {
    // Initialize mock worker
    const mockWorker = new Worker(new URL('@/workers/mockWorker.ts', import.meta.url));
    mockWorkerRef.current = mockWorker;
    isWorkerActiveRef.current = false;

    mockWorker.onmessage = (event) => {
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
        // Handle cancellation silently
        if (payload?.error === 'Cancelled') {
          cancelGeneration();
          return;
        }
        console.error('Mock worker error:', payload?.error);
        setIsGenerating(false);
      }
    };

    // Initialize AI worker if not in mock mode
    if (!isMockMode) {
      const aiWorker = new Worker(new URL('@/workers/aiWorker.ts', import.meta.url), { type: 'module' });
      aiWorkerRef.current = aiWorker;

      aiWorker.onmessage = (event) => {
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
          setGenerationStatus('AI models ready!');
        }

        if (type === 'error') {
          isWorkerActiveRef.current = false;
          // Handle cancellation silently
          if (payload?.error === 'Cancelled') {
            cancelGeneration();
            return;
          }
          console.error('AI worker error:', payload?.error);
          setIsGenerating(false);
          setGenerationStatus('Error: ' + (payload?.error || 'Unknown error'));
        }
      };

      // Initialize AI models
      aiWorker.postMessage({ type: 'init' });
    }

    return () => {
      mockWorker.terminate();
      aiWorkerRef.current?.terminate();
    };
  }, [isMockMode, setCurrentStory, setCurrentImage, setGlitch, setCanCatch, setIsGenerating, setGenerationProgress, setGenerationStatus, cancelGeneration]);

  // Handle dream generation
  const handleDream = useCallback(() => {
    // Cancel any ongoing generation first
    if (isWorkerActiveRef.current) {
      // Send cancel message to the active worker
      if (isMockMode && mockWorkerRef.current) {
        mockWorkerRef.current.postMessage({ type: 'cancel' });
      } else if (aiWorkerRef.current) {
        aiWorkerRef.current.postMessage({ type: 'cancel' });
      }
      // Wait a brief moment for cancellation to process
      isWorkerActiveRef.current = false;
    }

    // Terminate and recreate workers to ensure clean state
    mockWorkerRef.current?.terminate();
    aiWorkerRef.current?.terminate();

    // Create fresh workers
    const mockWorker = new Worker(new URL('@/workers/mockWorker.ts', import.meta.url));
    mockWorkerRef.current = mockWorker;

    mockWorker.onmessage = (event) => {
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
          cancelGeneration();
          return;
        }
        console.error('Mock worker error:', payload?.error);
        setIsGenerating(false);
      }
    };

    if (!isMockMode) {
      const aiWorker = new Worker(new URL('@/workers/aiWorker.ts', import.meta.url), { type: 'module' });
      aiWorkerRef.current = aiWorker;

      aiWorker.onmessage = (event) => {
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
          setGenerationStatus('AI models ready!');
        }

        if (type === 'error') {
          isWorkerActiveRef.current = false;
          if (payload?.error === 'Cancelled') {
            cancelGeneration();
            return;
          }
          console.error('AI worker error:', payload?.error);
          setIsGenerating(false);
          setGenerationStatus('Error: ' + (payload?.error || 'Unknown error'));
        }
      };

      aiWorker.postMessage({ type: 'init' });
    }

    // Now start the new generation
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Starting dream sequence...');
    setGlitch(false);
    setCanCatch(false);
    isWorkerActiveRef.current = true;

    const payload = {
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
    setCurrentStory,
    setCurrentImage,
    cancelGeneration,
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sleepy-100 via-silly-100 to-spooky-100">
      {/* Header */}
      <header className="bg-pixel-bg text-pixel-text py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            🦄 The Latent Space Zoo
          </h1>
          <nav className="flex gap-4">
            <a
              href="/zoo"
              className="btn-chunky btn-chunky-secondary text-sm py-2 px-4"
            >
              🦋 My Zoo
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Panel - Inputs */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 border-4 border-gray-200">
              <StoryPotions />
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 border-4 border-gray-200">
              <MagicCanvas />
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 border-4 border-gray-200">
              <DreamButton onDream={handleDream} />
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="bg-white rounded-3xl shadow-lg p-6 border-4 border-gray-200 min-h-[600px]">
            <StoryOutput />
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={isGenerating}
        progress={generationProgress}
        status={generationStatus}
      />
    </main>
  );
}
