'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PixelProps {
  status: 'idle' | 'thinking' | 'shocked' | 'happy';
  message: string;
}

export const Pixel: React.FC<PixelProps> = ({ status, message }) => {
  const getAnimation = () => {
    switch (status) {
      case 'thinking': return { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] };
      case 'shocked': return { scale: [1, 1.3, 1], y: [0, -20, 0] };
      case 'happy': return { y: [0, -10, 0, -10, 0] };
      default: return { y: [0, -5, 0] };
    }
  };

  return (
    <div className="flex items-center space-x-4 max-w-md">
      <motion.div
        animate={getAnimation()}
        transition={{ repeat: Infinity, duration: status === 'idle' ? 3 : 1 }}
        className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
      >
        {/* Pixel's Eyes */}
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-white rounded-full">
           <div className="w-1 h-1 bg-black rounded-full absolute top-1 left-1" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full">
           <div className="w-1 h-1 bg-black rounded-full absolute top-1 left-1" />
        </div>
        {/* Pixel's Mouth */}
        <div className={`absolute bottom-1/4 left-1/2 -translate-x-1/2 w-4 h-1 bg-white rounded-full ${status === 'shocked' ? 'h-4 w-4' : ''}`} />
      </motion.div>
      <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-blue-100 relative">
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-blue-100 rotate-45" />
        <p className="text-gray-700 font-medium leading-tight">{message}</p>
      </div>
    </div>
  );
};
