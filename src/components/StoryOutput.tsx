'use client';

import React, { useEffect, useRef } from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { Pixel } from './Pixel';

export const StoryOutput: React.FC = () => {
  const {
    currentStory,
    currentImage,
    isGlitch,
    glitchMessage,
    canCatch,
    catchCreature,
    clearCurrentGeneration,
  } = useStoryStore();

  const catchButtonRef = useRef<HTMLButtonElement>(null);
  const storyRegionRef = useRef<HTMLDivElement>(null);

  // Auto-focus the catch button when a creature appears
  useEffect(() => {
    if (canCatch && catchButtonRef.current) {
      catchButtonRef.current.focus();
    }
  }, [canCatch]);

  // Announce when a new story is generated
  useEffect(() => {
    if (currentStory && storyRegionRef.current) {
      // Screen readers will announce the aria-live region update
    }
  }, [currentStory]);

  const getPixelMood = (): 'happy' | 'excited' | 'glitch' | 'thinking' => {
    if (isGlitch) return 'glitch';
    if (canCatch) return 'excited';
    if (!currentStory) return 'thinking';
    return 'happy';
  };

  const pixelMessage = isGlitch ? glitchMessage : null;

  return (
    <div className="flex flex-col h-full">
      {/* Pixel Character */}
      <div className="flex justify-center mb-6">
        <Pixel
          mood={getPixelMood()}
          message={pixelMessage}
          isSpeaking={!!pixelMessage}
        />
      </div>

      {/* Output Area - Using aria-live for screen reader announcements */}
      <div 
        ref={storyRegionRef}
        className="flex-1 bg-white rounded-3xl shadow-lg p-6 border-4 border-gray-200 overflow-auto"
        aria-live="polite"
        aria-label="Story output area"
        role="region"
      >
        {!currentStory && !currentImage ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="text-6xl mb-4" aria-hidden="true">📖</div>
            <p className="text-xl font-semibold text-center">
              Mix your potions and draw something,<br/>
              then click &quot;Dream&quot; to create a story!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Story Text */}
            {currentStory && (
              <div className="bg-sleepy-100 rounded-2xl p-4 border-4 border-sleepy-300">
                <h3 className="text-lg font-bold text-sleepy-700 mb-2">📜 Your Story</h3>
                <p className="text-gray-800 text-lg leading-relaxed">{currentStory}</p>
              </div>
            )}

            {/* Generated Image */}
            {currentImage && (
              <div className="relative">
                <div className="bg-gray-100 rounded-2xl p-2 border-4 border-gray-300">
                  <div className="relative">
                    {currentImage.includes('<svg') ? (
                      <div
                        className="w-full aspect-square"
                        dangerouslySetInnerHTML={{ __html: currentImage }}
                        role="img"
                        aria-label="Generated creature illustration"
                      />
                    ) : (
                      <img
                        src={currentImage}
                        alt="Generated creature"
                        className="w-full aspect-square object-cover rounded-xl"
                      />
                    )}

                    {/* Catch Button Overlay */}
                    {canCatch && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                        <button
                          ref={catchButtonRef}
                          onClick={catchCreature}
                          className="btn-chunky btn-chunky-danger catch-glow text-xl px-8 py-4 animate-pulse"
                          aria-label="Catch this creature and add it to your zoo"
                        >
                          🦋 CATCH IT!
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Glitch indicator */}
                {isGlitch && !canCatch && (
                  <p className="text-center text-spooky-700 font-bold mt-2 animate-glitch">
                    ✨ A glitch creature! ✨
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={clearCurrentGeneration}
                className="btn-chunky btn-chunky-secondary flex-1"
                aria-label="Generate a new dream"
              >
                🔄 New Dream
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
