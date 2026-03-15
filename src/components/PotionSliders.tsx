'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PotionSlidersProps {
  values: { silly: number; spooky: number; sleepy: number };
  onChange: (key: 'silly' | 'spooky' | 'sleepy', value: number) => void;
  className?: string;
}

export const PotionSliders: React.FC<PotionSlidersProps> = ({
  values,
  onChange,
  className,
}) => {
  const sliders = [
    { key: 'silly', label: '🤪 Silly', color: 'bg-yellow-400' },
    { key: 'spooky', label: '👻 Spooky', color: 'bg-purple-600' },
    { key: 'sleepy', label: '💤 Sleepy', color: 'bg-blue-400' },
  ] as const;

  return (
    <div className={`space-y-6 ${className}`}>
      {sliders.map((slider) => (
        <div key={slider.key} className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-lg font-bold text-gray-700">{slider.label}</span>
            <span className="text-sm font-mono bg-white px-2 py-0.5 rounded shadow-sm">
              {values[slider.key]}
            </span>
          </div>
          <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner border-2 border-white">
            <motion.div
              className={`absolute top-0 left-0 h-full ${slider.color}`}
              initial={false}
              animate={{ width: `${(values[slider.key] / 10) * 100}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={values[slider.key]}
              onChange={(e) => onChange(slider.key, parseInt(e.target.value))}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
