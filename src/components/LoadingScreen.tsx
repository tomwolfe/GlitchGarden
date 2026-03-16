'use client';

import React from 'react';

interface LoadingScreenProps {
  progress?: number;
  message?: string;
}

export default function LoadingScreen({ progress = 0, message = 'Waking up Pixel...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-pink-900 flex flex-col items-center justify-center z-50">
      {/* Pixel Character - Sleeping Animation */}
      <div className="relative mb-8">
        <div className="w-32 h-32 md:w-48 md:h-48 relative animate-pulse">
          {/* Pixel art creature using CSS grid */}
          <div className="grid grid-cols-8 gap-0.5 md:gap-1">
            {generatePixelPattern().map((color, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 md:w-5 md:h-5 rounded-sm ${color}`}
              />
            ))}
          </div>
        </div>
        {/* Zzz animation */}
        <div className="absolute -top-4 right-0 animate-bounce">
          <span className="text-2xl md:text-3xl text-yellow-300 font-bold">Zzz...</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center px-4">
        The Latent Space Zoo
      </h1>

      {/* Loading message */}
      <p className="text-lg md:text-xl text-pink-200 mb-6 text-center px-4">
        {message}
      </p>

      {/* Progress bar */}
      <div className="w-64 md:w-96 bg-white/20 rounded-full h-4 md:h-6 overflow-hidden px-1">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress percentage */}
      {progress > 0 && (
        <p className="text-white/80 mt-2 text-sm md:text-base">
          {Math.round(progress)}%
        </p>
      )}

      {/* Hint text */}
      <p className="text-white/60 mt-8 text-xs md:text-sm text-center px-4 max-w-md">
        🌟 All AI runs locally on your device - no data leaves your browser!
      </p>
    </div>
  );
}

function generatePixelPattern(): string[] {
  // A cute sleeping creature pattern (8x8 grid)
  return [
    'bg-transparent', 'bg-purple-400', 'bg-purple-400', 'bg-purple-400', 'bg-purple-400', 'bg-purple-400', 'bg-purple-400', 'bg-transparent',
    'bg-purple-400', 'bg-purple-300', 'bg-purple-300', 'bg-purple-300', 'bg-purple-300', 'bg-purple-300', 'bg-purple-400', 'bg-transparent',
    'bg-purple-400', 'bg-purple-300', 'bg-yellow-200', 'bg-yellow-200', 'bg-purple-300', 'bg-purple-300', 'bg-purple-400', 'bg-transparent',
    'bg-purple-400', 'bg-purple-300', 'bg-yellow-200', 'bg-yellow-200', 'bg-purple-300', 'bg-purple-300', 'bg-purple-400', 'bg-transparent',
    'bg-purple-400', 'bg-pink-300', 'bg-pink-300', 'bg-pink-300', 'bg-pink-300', 'bg-pink-300', 'bg-purple-400', 'bg-transparent',
    'bg-purple-400', 'bg-purple-300', 'bg-purple-300', 'bg-purple-300', 'bg-purple-300', 'bg-purple-300', 'bg-purple-400', 'bg-transparent',
    'bg-transparent', 'bg-purple-400', 'bg-purple-400', 'bg-purple-400', 'bg-purple-400', 'bg-purple-400', 'bg-transparent', 'bg-transparent',
    'bg-transparent', 'bg-transparent', 'bg-pink-400', 'bg-pink-400', 'bg-pink-400', 'bg-transparent', 'bg-transparent', 'bg-transparent',
  ];
}
