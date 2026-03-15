'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { useStoryStore, type StrokePath, type StrokePoint } from '@/store/useStoryStore';

export const MagicCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<StrokePoint[]>([]);

  const { 
    canvasStrokes,
    setCanvasData, 
    addCanvasStroke,
    clearCanvasStrokes,
    sillyLevel, 
    spookyLevel, 
    sleepyLevel 
  } = useStoryStore();

  // Get stroke color based on dominant potion level
  const getStrokeColor = useCallback(() => {
    const levels = [
      { name: 'silly', value: sillyLevel, color: '#FDE047' },
      { name: 'spooky', value: spookyLevel, color: '#C084FC' },
      { name: 'sleepy', value: sleepyLevel, color: '#93C5FD' },
    ];
    levels.sort((a, b) => b.value - a.value);
    return levels[0].color;
  }, [sillyLevel, spookyLevel, sleepyLevel]);

  // Render all strokes to canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all saved strokes
    canvasStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    // Draw current stroke in progress
    if (currentStroke.current.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = getStrokeColor();
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(currentStroke.current[0].x, currentStroke.current[0].y);
      for (let i = 1; i < currentStroke.current.length; i++) {
        ctx.lineTo(currentStroke.current[i].x, currentStroke.current[i].y);
      }
      ctx.stroke();
    }
  }, [canvasStrokes, getStrokeColor]);

  // Initialize canvas and handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas styling
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = getStrokeColor();

    // Resize canvas to match container
    function resizeCanvas() {
      if (!container || !canvas || !ctx) return;
      const rect = container.getBoundingClientRect();
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.strokeStyle = getStrokeColor();

      // Re-render all strokes at new size (vector strokes scale automatically)
      renderCanvas();
    }

    // Initial resize
    resizeCanvas();

    // Listen for resize events
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [getStrokeColor, renderCanvas, canvasStrokes]);

  // Update stroke color when potion levels change
  useEffect(() => {
    renderCanvas();
  }, [getStrokeColor, renderCanvas]);

  const getPos = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, []);

  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    isDrawing.current = true;
    const pos = getPos(e);
    currentStroke.current = [pos];
  }, [getPos]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current) return;

    // Prevent scrolling on touch devices
    if ('touches' in e) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentPos = getPos(e);
    currentStroke.current.push(currentPos);

    // Render immediately for smooth drawing
    renderCanvas();
  }, [getPos, renderCanvas]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing.current) return;

    isDrawing.current = false;

    // Save the stroke if it has enough points
    if (currentStroke.current.length >= 2) {
      const stroke: StrokePath = {
        points: [...currentStroke.current],
        color: getStrokeColor(),
      };
      addCanvasStroke(stroke);
      
      // Update canvasData as Base64 for backward compatibility with workers
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        setCanvasData(dataUrl);
      }
    }

    currentStroke.current = [];
  }, [getStrokeColor, addCanvasStroke, setCanvasData]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearCanvasStrokes();
    setCanvasData(null);
    currentStroke.current = [];

    // Return focus to canvas after clearing
    canvas.focus();
  }, [clearCanvasStrokes, setCanvasData]);

  // Set up event listeners for canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use passive: false to allow preventDefault on touch events
    canvas.addEventListener('mousedown', startDrawing, { passive: true });
    canvas.addEventListener('mousemove', draw, { passive: false });
    canvas.addEventListener('mouseup', stopDrawing, { passive: true });
    canvas.addEventListener('mouseleave', stopDrawing, { passive: true });
    canvas.addEventListener('touchstart', startDrawing, { passive: true });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: true });

    // Keyboard support for drawing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== canvas) return;

      // Allow Enter or Space to clear canvas
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clearCanvas();
      }
    };

    canvas.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('keydown', handleKeyDown);
    };
  }, [startDrawing, draw, stopDrawing, clearCanvas]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">✨ Magic Canvas</h2>
        <button
          onClick={clearCanvas}
          className="btn-chunky btn-chunky-secondary text-sm py-2 px-4"
          aria-label="Clear canvas (or press Enter/Space when canvas is focused)"
          tabIndex={0}
        >
          🗑️ Clear
        </button>
      </div>
      <div ref={containerRef} className="canvas-container" style={{ aspectRatio: '1' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair touch-none"
          aria-label="Drawing canvas for story inspiration"
          tabIndex={0}
        />
      </div>
      <p className="text-sm text-gray-500 text-center">
        Draw something to inspire your story! 🎨
      </p>
    </div>
  );
};
