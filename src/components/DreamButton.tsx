'use client';

import React from 'react';
import { useStoryStore } from '@/store/useStoryStore';

interface DreamButtonProps {
  onDream: () => void;
}

export const DreamButton: React.FC<DreamButtonProps> = ({ onDream }) => {
  const { isGenerating, isMockMode, toggleMockMode } = useStoryStore();

  return (
    <div className="space-y-4">
      <button
        onClick={onDream}
        disabled={isGenerating}
        className="btn-chunky btn-chunky-primary w-full text-xl py-6 shadow-lg hover:shadow-xl"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-3">
            <span className="animate-spin">✨</span>
            Dreaming...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-3">
            🌙 Dream!
          </span>
        )}
      </button>

      {/* Mock Mode Toggle */}
      <div className="flex items-center justify-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isMockMode}
            onChange={toggleMockMode}
            className="w-5 h-5 rounded border-2 border-gray-300 text-sleepy-500 focus:ring-sleepy-300"
          />
          <span className="text-sm text-gray-600 font-medium">
            🧪 Mock Mode (Fast)
          </span>
        </label>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Mock Mode uses pretend AI for instant results.<br/>
        Turn it off for real AI (slower, downloads models).
      </p>
    </div>
  );
};
