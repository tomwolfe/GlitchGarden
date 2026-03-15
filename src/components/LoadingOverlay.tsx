'use client';

import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  progress: number;
  status: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  progress, 
  status 
}) => {
  if (!isVisible) return null;

  const loadingMessages = [
    "Pixel is dreaming...",
    "Downloading imagination...",
    "Mixing stardust...",
    "Warming up the creativity engine...",
    "Feeding the neural network cookies...",
    "Spinning yarns and pixels...",
  ];

  const randomMessage = loadingMessages[Math.floor(Date.now() / 2000) % loadingMessages.length];

  return (
    <div className="loading-overlay">
      {/* Animated Pixel */}
      <div className="mb-8">
        <svg 
          viewBox="0 0 32 32" 
          className="w-24 h-24 md:w-32 md:h-32 animate-dream"
          style={{ imageRendering: 'pixelated' }}
        >
          <rect x="8" y="8" width="16" height="16" fill="#10B981" />
          <rect x="10" y="12" width="4" height="4" fill="#1F2937" />
          <rect x="20" y="12" width="4" height="4" fill="#1F2937" />
          <rect x="12" y="20" width="8" height="2" fill="#1F2937" />
          <rect x="6" y="16" width="2" height="2" fill="#FCA5A5" opacity="0.6" />
          <rect x="24" y="16" width="2" height="2" fill="#FCA5A5" opacity="0.6" />
        </svg>
      </div>

      {/* Loading Text */}
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
        {randomMessage}
      </h2>

      {/* Progress Bar */}
      <div className="w-64 md:w-96 bg-gray-700 rounded-full h-6 overflow-hidden border-4 border-gray-600">
        <div
          className="h-full bg-gradient-to-r from-silly-300 via-spooky-300 to-sleepy-300 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Text */}
      <div className="mt-4 text-center">
        <p className="text-xl font-semibold mb-2">{Math.round(progress)}%</p>
        <p className="text-gray-400 text-sm md:text-base">{status}</p>
      </div>

      {/* Decorative Stars */}
      <div className="absolute top-20 left-10 text-4xl animate-float" style={{ animationDelay: '0s' }}>✨</div>
      <div className="absolute top-32 right-20 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>⭐</div>
      <div className="absolute bottom-32 left-20 text-3xl animate-float" style={{ animationDelay: '1s' }}>💫</div>
      <div className="absolute bottom-20 right-10 text-4xl animate-float" style={{ animationDelay: '1.5s' }}>✨</div>
    </div>
  );
};
