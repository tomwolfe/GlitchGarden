'use client';

import React from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { useDreamWorker } from '@/hooks/useDreamWorker';
import { StoryPotions } from '@/components/StoryPotions';
import { MagicCanvas } from '@/components/MagicCanvas';
import { DreamButton } from '@/components/DreamButton';
import { StoryOutput } from '@/components/StoryOutput';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function Home() {
  const {
    isGenerating,
    generationProgress,
    generationStatus,
  } = useStoryStore();

  const { handleDream } = useDreamWorker();

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
