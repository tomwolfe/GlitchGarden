'use client';

import React, { useEffect, useRef, useState } from 'react';
import { generateCreatureName } from '@/utils/safety-filter';

interface MoodValues {
  silly: number;
  spooky: number;
  sleepy: number;
  chaos: number;
}

interface CreatureCanvasProps {
  story: string;
  mood: MoodValues | null;
  onSave: (creature: {
    id: string;
    image: string;
    name: string;
    story: string;
    mood: MoodValues;
    date: number;
  }) => void;
  onRedraw: () => void;
}

export default function CreatureCanvas({ story, mood, onSave, onRedraw }: CreatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [creatureName, setCreatureName] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (story && mood) {
      const name = generateCreatureName(mood);
      setCreatureName(name);
      drawCreature(canvasRef.current, mood);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [story, mood]);

  const handleSave = () => {
    if (!canvasRef.current || !mood || !story) return;
    
    const imageData = canvasRef.current.toDataURL('image/webp', 0.8);
    onSave({
      id: `creature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      image: imageData,
      name: creatureName,
      story,
      mood,
      date: Date.now(),
    });
  };

  const hasContent = !!story && !!mood;

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border-4 border-pink-200 mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-pink-800 mb-2 text-center">
        🎨 Creature Canvas
      </h2>
      <p className="text-pink-600 text-center mb-6 text-sm md:text-base">
        Your creature appears here!
      </p>

      <div className="flex flex-col items-center">
        {/* Canvas */}
        <div className={`relative rounded-2xl overflow-hidden border-4 ${hasContent ? 'border-purple-400' : 'border-gray-200'} transition-all duration-500 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-purple-50 to-pink-50"
          />
          
          {!hasContent && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="text-center p-4">
                <span className="text-4xl md:text-5xl mb-2 block">🥚</span>
                <p className="text-purple-500 text-sm md:text-base">
                  Brew a potion to reveal your creature!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Creature Info */}
        {hasContent && (
          <div className="mt-6 text-center w-full max-w-md">
            <h3 className="text-xl md:text-2xl font-bold text-purple-800 mb-2">
              {creatureName}
            </h3>
            
            {/* Mood indicators */}
            <div className="flex justify-center gap-2 mb-4">
              <MoodBadge emoji="😄" value={mood.silly} color="bg-yellow-400" />
              <MoodBadge emoji="👻" value={mood.spooky} color="bg-purple-400" />
              <MoodBadge emoji="😴" value={mood.sleepy} color="bg-blue-400" />
              <MoodBadge emoji="🌈" value={mood.chaos} color="bg-gradient-to-r from-pink-400 to-orange-400" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={onRedraw}
                className="py-3 px-6 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-colors border-2 border-purple-300"
              >
                🔄 Redraw
              </button>
              <button
                onClick={handleSave}
                className="py-3 px-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 border-2 border-green-300"
              >
                📸 Catch!
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

interface MoodBadgeProps {
  emoji: string;
  value: number;
  color: string;
}

function MoodBadge({ emoji, value, color }: MoodBadgeProps) {
  return (
    <div className="relative">
      <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-lg shadow-md border-2 border-white`}>
        {emoji}
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
        {value}%
      </div>
    </div>
  );
}

function drawCreature(canvas: HTMLCanvasElement | null, mood: MoodValues) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Create gradient background based on mood
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  if (mood.sleepy > 50) {
    bgGradient.addColorStop(0, '#e0e7ff');
    bgGradient.addColorStop(1, '#dbeafe');
  } else if (mood.spooky > 50) {
    bgGradient.addColorStop(0, '#1e1b4b');
    bgGradient.addColorStop(1, '#312e81');
  } else if (mood.silly > 50) {
    bgGradient.addColorStop(0, '#fef3c7');
    bgGradient.addColorStop(1, '#fde68a');
  } else {
    bgGradient.addColorStop(0, '#f3e8ff');
    bgGradient.addColorStop(1, '#fce7f3');
  }
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Draw creature body
  const baseSize = Math.min(width, height) * 0.35;
  const chaosFactor = mood.chaos / 100;
  
  // Body color based on dominant mood
  let bodyColor: string;
  if (mood.silly > mood.spooky && mood.silly > mood.sleepy) {
    bodyColor = `hsl(${45 + chaosFactor * 30}, 90%, 60%)`;
  } else if (mood.spooky > mood.sleepy) {
    bodyColor = `hsl(${260 + chaosFactor * 40}, 70%, 50%)`;
  } else if (mood.sleepy > 50) {
    bodyColor = `hsl(${200 + chaosFactor * 30}, 80%, 65%)`;
  } else {
    bodyColor = `hsl(${320 + chaosFactor * 40}, 80%, 65%)`;
  }

  // Add glitch effect to color if chaos is high
  if (chaosFactor > 0.5) {
    const glitchOffset = Math.random() * 60 - 30;
    const hslMatch = bodyColor.match(/hsl\((\d+)/);
    if (hslMatch) {
      const hue = parseInt(hslMatch[1]) + glitchOffset;
      bodyColor = `hsl(${hue}, 80%, 60%)`;
    }
  }

  // Draw main body (blob shape)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  
  const points = 8;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobble = chaosFactor > 0.3 ? Math.sin(angle * 3 + Date.now() / 1000) * baseSize * 0.1 * chaosFactor : 0;
    const radius = baseSize + wobble;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.8;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();

  // Add gradient overlay
  const bodyGradient = ctx.createRadialGradient(centerX, centerY - baseSize * 0.3, 0, centerX, centerY, baseSize);
  bodyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  bodyGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  ctx.fillStyle = bodyGradient;
  ctx.fill();

  // Draw eyes based on mood
  const eyeSize = baseSize * 0.15;
  const eyeSpacing = baseSize * 0.35;
  
  // Eye color
  let eyeColor = '#1a1a2e';
  if (mood.silly > 70) eyeColor = '#fbbf24';
  if (mood.chaos > 70) eyeColor = `hsl(${Math.random() * 360}, 90%, 50%)`;

  // Left eye
  drawEye(ctx, centerX - eyeSpacing, centerY - baseSize * 0.1, eyeSize, eyeColor, mood);
  // Right eye
  drawEye(ctx, centerX + eyeSpacing, centerY - baseSize * 0.1, eyeSize, eyeColor, mood);

  // Draw mouth based on mood
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  
  if (mood.silly > 50) {
    // Wiggly smile
    ctx.beginPath();
    ctx.arc(centerX, centerY + baseSize * 0.2, baseSize * 0.2, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else if (mood.spooky > 50) {
    // Mysterious line
    ctx.beginPath();
    ctx.moveTo(centerX - baseSize * 0.15, centerY + baseSize * 0.25);
    ctx.lineTo(centerX + baseSize * 0.15, centerY + baseSize * 0.25);
    ctx.stroke();
  } else if (mood.sleepy > 50) {
    // Gentle curve
    ctx.beginPath();
    ctx.arc(centerX, centerY + baseSize * 0.3, baseSize * 0.15, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  } else {
    // Happy smile
    ctx.beginPath();
    ctx.arc(centerX, centerY + baseSize * 0.2, baseSize * 0.2, 0, Math.PI);
    ctx.stroke();
  }

  // Add chaos/glitch effects
  if (chaosFactor > 0.3) {
    addGlitchEffects(ctx, width, height, chaosFactor);
  }

  // Add sparkles for high silly
  if (mood.silly > 60) {
    addSparkles(ctx, width, height, mood.silly / 100);
  }
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  mood: MoodValues
) {
  // Eye white
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  
  if (mood.sleepy > 60) {
    // Sleepy half-closed eyes
    ctx.ellipse(x, y, size, size * 0.5, 0, 0, Math.PI * 2);
  } else if (mood.silly > 70) {
    // Googly eyes
    ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
  } else {
    ctx.arc(x, y, size, 0, Math.PI * 2);
  }
  ctx.fill();

  // Pupil
  ctx.fillStyle = color;
  ctx.beginPath();
  
  const pupilOffset = mood.chaos > 50 ? (Math.random() - 0.5) * size * 0.5 : 0;
  const pupilSize = size * 0.5;
  
  if (mood.silly > 70) {
    ctx.arc(x + pupilOffset, y + pupilOffset, pupilSize, 0, Math.PI * 2);
  } else {
    ctx.arc(x, y, pupilSize, 0, Math.PI * 2);
  }
  ctx.fill();

  // Eye shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function addGlitchEffects(ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const glitchBlocks = Math.floor(intensity * 10);
  
  for (let i = 0; i < glitchBlocks; i++) {
    const blockY = Math.floor(Math.random() * height / 4) * 4;
    const blockHeight = Math.floor(Math.random() * 20) + 5;
    const offset = Math.floor((Math.random() - 0.5) * intensity * 20);
    
    for (let y = blockY; y < Math.min(blockY + blockHeight, height); y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const sourceIdx = ((y) * width + ((x + offset + width) % width)) * 4;
        
        if (Math.random() < intensity * 0.3) {
          data[idx] = data[sourceIdx];
          data[idx + 1] = data[sourceIdx + 1];
          data[idx + 2] = data[sourceIdx + 2];
        }
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function addSparkles(ctx: CanvasRenderingContext2D, width: number, height: number, density: number) {
  const sparkleCount = Math.floor(density * 20);
  
  for (let i = 0; i < sparkleCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 4 + 2;
    
    ctx.fillStyle = `hsl(${Math.random() * 360}, 90%, 70%)`;
    ctx.beginPath();
    
    // Star shape
    for (let j = 0; j < 4; j++) {
      const angle = (j / 4) * Math.PI * 2 - Math.PI / 4;
      const sx = x + Math.cos(angle) * size;
      const sy = y + Math.sin(angle) * size;
      if (j === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
      
      const innerAngle = angle + Math.PI / 4;
      ctx.lineTo(x + Math.cos(innerAngle) * size * 0.5, y + Math.sin(innerAngle) * size * 0.5);
    }
    ctx.closePath();
    ctx.fill();
  }
}
