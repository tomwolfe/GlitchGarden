'use client';

import React from 'react';

interface PixelNarratorProps {
  story: string;
  isGenerating?: boolean;
}

export default function PixelNarrator({ story, isGenerating = false }: PixelNarratorProps) {
  return (
    <section className="mb-6">
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 border-4 border-purple-300 shadow-lg">
        <div className="flex items-start gap-4">
          {/* Pixel Avatar */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-md border-4 border-white">
              <span className="text-3xl md:text-4xl">
                {isGenerating ? '🤔' : story ? '✨' : '👋'}
              </span>
            </div>
          </div>

          {/* Story Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-purple-800 mb-2">
              Pixel Says:
            </h3>
            
            <div className="bg-white/70 rounded-xl p-4 min-h-[80px]">
              {isGenerating ? (
                <div className="flex items-center gap-3 text-purple-600">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm md:text-base">Pixel is weaving a story...</span>
                </div>
              ) : story ? (
                <p className="text-purple-900 text-base md:text-lg leading-relaxed">
                  {story}
                </p>
              ) : (
                <p className="text-purple-500 text-sm md:text-base italic">
                  Adjust the mood sliders and brew a potion to hear Pixel&apos;s story!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-2 right-4 text-2xl opacity-20">
          ✨ 🦄 ⭐
        </div>
      </div>
    </section>
  );
}
