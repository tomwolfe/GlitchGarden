'use client';

import React, { useState } from 'react';

export interface MoodValues {
  silly: number;
  spooky: number;
  sleepy: number;
  chaos: number;
}

interface StoryPotionProps {
  onGenerate: (mood: MoodValues) => void;
  disabled: boolean;
  remainingGenerations: number;
}

export default function StoryPotion({ onGenerate, disabled, remainingGenerations }: StoryPotionProps) {
  const [mood, setMood] = useState<MoodValues>({
    silly: 50,
    spooky: 50,
    sleepy: 50,
    chaos: 30,
  });

  const handleSliderChange = (slider: keyof MoodValues, value: number) => {
    setMood(prev => ({ ...prev, [slider]: value }));
  };

  const handleGenerate = () => {
    if (!disabled && remainingGenerations > 0) {
      onGenerate(mood);
    }
  };

  const isLowOnGenerations = remainingGenerations === 1;
  const isOutOfGenerations = remainingGenerations === 0;

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border-4 border-purple-200">
      <h2 className="text-2xl md:text-3xl font-bold text-purple-800 mb-2 text-center">
        🧪 Story Potion
      </h2>
      <p className="text-purple-600 text-center mb-6 text-sm md:text-base">
        Mix the moods to create your creature story!
      </p>

      {/* Mood Sliders */}
      <div className="space-y-6">
        {/* Silly Slider */}
        <Slider
          label="Silly"
          emoji="😄"
          value={mood.silly}
          onChange={(v) => handleSliderChange('silly', v)}
          colorFrom="from-yellow-300"
          colorTo="to-yellow-500"
          disabled={disabled}
        />

        {/* Spooky Slider */}
        <Slider
          label="Spooky"
          emoji="👻"
          value={mood.spooky}
          onChange={(v) => handleSliderChange('spooky', v)}
          colorFrom="from-purple-300"
          colorTo="to-purple-600"
          disabled={disabled}
        />

        {/* Sleepy Slider */}
        <Slider
          label="Sleepy"
          emoji="😴"
          value={mood.sleepy}
          onChange={(v) => handleSliderChange('sleepy', v)}
          colorFrom="from-blue-300"
          colorTo="to-blue-500"
          disabled={disabled}
        />

        {/* Chaos Slider */}
        <Slider
          label="Chaos Level"
          emoji="🌈"
          value={mood.chaos}
          onChange={(v) => handleSliderChange('chaos', v)}
          colorFrom="from-pink-400"
          colorTo="to-orange-400"
          isRainbow
          disabled={disabled}
        />
      </div>

      {/* Generate Button */}
      <div className="mt-8">
        <button
          onClick={handleGenerate}
          disabled={disabled || isOutOfGenerations}
          className={`
            w-full py-4 px-6 rounded-2xl text-xl font-bold
            transition-all duration-300 transform
            ${disabled || isOutOfGenerations
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 hover:shadow-lg active:scale-95'
            }
          `}
        >
          {isOutOfGenerations ? (
            <span>Pixel needs a nap! 😴</span>
          ) : disabled ? (
            <span>Generating... ✨</span>
          ) : (
            <span>✨ Brew Potion! ✨</span>
          )}
        </button>

        {/* Generation counter */}
        <div className="mt-4 text-center">
          <p className={`text-sm ${isLowOnGenerations ? 'text-orange-500 font-semibold' : 'text-purple-600'}`}>
            {isOutOfGenerations ? (
              <span>⏳ Pixel is resting... (30 seconds)</span>
            ) : (
              <span>
                Generations left: <strong>{remainingGenerations}</strong> / 3
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Current mood preview */}
      <div className="mt-6 p-4 bg-purple-50 rounded-xl">
        <p className="text-xs text-purple-600 text-center">
          <strong>Mood Mix:</strong>{' '}
          {getMoodDescription(mood)}
        </p>
      </div>
    </section>
  );
}

interface SliderProps {
  label: string;
  emoji: string;
  value: number;
  onChange: (value: number) => void;
  colorFrom: string;
  colorTo: string;
  isRainbow?: boolean;
  disabled: boolean;
}

function Slider({
  label,
  emoji,
  value,
  onChange,
  colorFrom,
  colorTo,
  isRainbow = false,
  disabled,
}: SliderProps) {
  const sliderStyle = isRainbow
    ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400'
    : `bg-gradient-to-r ${colorFrom} ${colorTo}`;

  return (
    <div className={`transition-opacity ${disabled ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-lg font-semibold text-purple-800 flex items-center gap-2">
          <span>{emoji}</span>
          <span>{label}</span>
        </label>
        <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
          {value}%
        </span>
      </div>
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full ${sliderStyle} transition-all duration-150`}
          style={{ width: `${value}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

function getMoodDescription(mood: MoodValues): string {
  const descriptions: string[] = [];
  
  if (mood.silly > 60) descriptions.push('giggly');
  if (mood.spooky > 60) descriptions.push('mysterious');
  if (mood.sleepy > 60) descriptions.push('dreamy');
  if (mood.chaos > 60) descriptions.push('glitchy');
  
  if (descriptions.length === 0) {
    return 'balanced and calm';
  }
  
  return descriptions.join(', ');
}
