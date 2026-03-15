'use client';

import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { CreatureDNA } from '@/lib/store';

interface RoughCreatureProps {
  dna: CreatureDNA;
  isGlitch?: boolean;
  width: number;
  height: number;
  className?: string;
}

export const RoughCreature: React.FC<RoughCreatureProps> = ({
  dna,
  isGlitch = false,
  width,
  height,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rc = rough.canvas(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.6;

    const options = {
      fill: dna.color,
      fillStyle: dna.texture === 'fuzzy' ? 'zigzag' : dna.texture === 'spiky' ? 'hachure' : 'solid',
      roughness: isGlitch ? 2.5 : 1.5,
      strokeWidth: 2,
    };

    // Draw Body
    if (dna.bodyShape === 'circle') {
      rc.circle(centerX, centerY, size, options);
    } else if (dna.bodyShape === 'blob') {
      const points: [number, number][] = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = size / 2 + (Math.random() - 0.5) * (size / 3);
        points.push([centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r]);
      }
      rc.polygon(points, options);
    } else if (dna.bodyShape === 'star') {
      const points: [number, number][] = [];
      const outerR = size / 2;
      const innerR = size / 4;
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const r = i % 2 === 0 ? outerR : innerR;
        points.push([centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r]);
      }
      rc.polygon(points, options);
    }

    // Draw Eyes
    for (let i = 0; i < dna.eyes; i++) {
      const eyeX = centerX + (i - (dna.eyes - 1) / 2) * (size / 4);
      const eyeY = centerY - size / 6;
      rc.circle(eyeX, eyeY, size / 10, { fill: 'white', fillStyle: 'solid' });
      rc.circle(eyeX, eyeY, size / 20, { fill: 'black', fillStyle: 'solid' });
    }

    // Draw Limbs
    for (let i = 0; i < dna.limbs; i++) {
      const angle = (i / dna.limbs) * Math.PI * 2 + Math.PI / 4;
      const startX = centerX + Math.cos(angle) * (size / 3);
      const startY = centerY + Math.sin(angle) * (size / 3);
      const endX = centerX + Math.cos(angle) * (size / 1.5);
      const endY = centerY + Math.sin(angle) * (size / 1.5);
      rc.line(startX, startY, endX, endY, { strokeWidth: 3 });
    }

  }, [dna, isGlitch, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`${className} ${isGlitch ? 'animate-pulse' : ''}`}
      style={isGlitch ? { filter: 'hue-rotate(90deg) contrast(1.2)' } : {}}
    />
  );
};
