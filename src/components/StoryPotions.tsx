'use client';

import React from 'react';
import { useStoryStore } from '@/store/useStoryStore';

interface SliderProps {
  label: string;
  emoji: string;
  color: 'silly' | 'spooky' | 'sleepy';
  value: number;
  onChange: (value: number) => void;
}

const PotionSlider: React.FC<SliderProps> = ({ label, emoji, color, value, onChange }) => {
  const colorClasses = {
    silly: {
      bg: 'bg-silly-100',
      track: 'slider-silly',
      thumb: 'bg-silly-500',
      text: 'text-silly-700',
      border: 'border-silly-300',
    },
    spooky: {
      bg: 'bg-spooky-100',
      track: 'slider-spooky',
      thumb: 'bg-spooky-500',
      text: 'text-spooky-700',
      border: 'border-spooky-300',
    },
    sleepy: {
      bg: 'bg-sleepy-100',
      track: 'slider-sleepy',
      thumb: 'bg-sleepy-500',
      text: 'text-sleepy-700',
      border: 'border-sleepy-300',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-2xl p-4 border-4 ${colors.border}`}>
      <div className="flex items-center justify-between mb-2">
        <label className={`font-bold ${colors.text} text-lg`}>
          <span className="text-2xl mr-2">{emoji}</span>
          {label}
        </label>
        <span className={`font-bold ${colors.text} text-xl min-w-[3ch] text-center`}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`slider-chunky ${colors.track}`}
        aria-label={`${label} level`}
      />
      <div className="flex justify-between mt-1 text-xs font-semibold text-gray-500">
        <span>Less</span>
        <span>More</span>
      </div>
    </div>
  );
};

export const StoryPotions: React.FC = () => {
  const { sillyLevel, spookyLevel, sleepyLevel, setSillyLevel, setSpookyLevel, setSleepyLevel } = useStoryStore();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🧪 Story Potions</h2>
      <PotionSlider
        label="Silly"
        emoji="🤪"
        color="silly"
        value={sillyLevel}
        onChange={setSillyLevel}
      />
      <PotionSlider
        label="Spooky"
        emoji="👻"
        color="spooky"
        value={spookyLevel}
        onChange={setSpookyLevel}
      />
      <PotionSlider
        label="Sleepy"
        emoji="😴"
        color="sleepy"
        value={sleepyLevel}
        onChange={setSleepyLevel}
      />
    </div>
  );
};
