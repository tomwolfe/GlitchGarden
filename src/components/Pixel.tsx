'use client';

import React from 'react';

interface PixelProps {
  mood: 'happy' | 'excited' | 'glitch' | 'thinking';
  message?: string | null;
  isSpeaking: boolean;
}

export const Pixel: React.FC<PixelProps> = ({ mood, message, isSpeaking }) => {
  // Pixel art sprite as SVG based on mood
  const getPixelSprite = () => {
    const baseColor = mood === 'glitch' ? '#A855F7' : '#10B981';
    const eyeColor = mood === 'glitch' ? '#FEF08A' : '#1F2937';
    const mouthColor = '#1F2937';

    return (
      <svg viewBox="0 0 32 32" className="pixel-sprite" style={{ imageRendering: 'pixelated' }}>
        {/* Body */}
        <rect x="8" y="8" width="16" height="16" fill={baseColor} />
        
        {/* Eyes based on mood */}
        {mood === 'glitch' ? (
          <>
            <rect x="10" y="12" width="4" height="4" fill={eyeColor} />
            <rect x="20" y="14" width="4" height="4" fill={eyeColor} />
          </>
        ) : mood === 'excited' ? (
          <>
            <rect x="10" y="12" width="4" height="4" fill={eyeColor} />
            <rect x="20" y="12" width="4" height="4" fill={eyeColor} />
            {/* Sparkles */}
            <rect x="6" y="6" width="2" height="2" fill="#FEF08A" />
            <rect x="26" y="8" width="2" height="2" fill="#FEF08A" />
          </>
        ) : mood === 'thinking' ? (
          <>
            <rect x="10" y="12" width="4" height="2" fill={eyeColor} />
            <rect x="20" y="12" width="4" height="2" fill={eyeColor} />
            {/* Thought bubble */}
            <circle cx="26" cy="6" r="2" fill="#9CA3AF" />
            <circle cx="28" cy="4" r="1.5" fill="#9CA3AF" />
          </>
        ) : (
          <>
            <rect x="10" y="12" width="4" height="4" fill={eyeColor} />
            <rect x="20" y="12" width="4" height="4" fill={eyeColor} />
          </>
        )}

        {/* Mouth based on mood */}
        {mood === 'glitch' ? (
          <rect x="12" y="20" width="8" height="2" fill={mouthColor} />
        ) : mood === 'excited' ? (
          <>
            <rect x="11" y="20" width="2" height="4" fill={mouthColor} />
            <rect x="19" y="20" width="2" height="4" fill={mouthColor} />
          </>
        ) : mood === 'thinking' ? (
          <rect x="13" y="21" width="6" height="2" fill={mouthColor} />
        ) : (
          <rect x="12" y="20" width="8" height="2" fill={mouthColor} />
        )}

        {/* Cheeks for happy mood */}
        {mood === 'happy' && (
          <>
            <rect x="6" y="16" width="2" height="2" fill="#FCA5A5" opacity="0.6" />
            <rect x="24" y="16" width="2" height="2" fill="#FCA5A5" opacity="0.6" />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`pixel-container ${mood === 'glitch' ? 'animate-glitch' : ''}`}>
        {getPixelSprite()}
      </div>
      
      {message && isSpeaking && (
        <div className="speech-bubble mt-4 max-w-xs md:max-w-md text-center animate-dream">
          <p className={`text-sm md:text-base font-semibold ${mood === 'glitch' ? 'text-spooky-700 glitch-text' : 'text-gray-700'}`}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
};
