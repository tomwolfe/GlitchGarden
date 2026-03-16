'use client';

import { useEffect, useState, useCallback } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import StoryPotion, { type MoodValues } from '@/components/StoryPotion';
import PixelNarrator from '@/components/PixelNarrator';
import CreatureCanvas from '@/components/CreatureCanvas';
import ZooCollection from '@/components/ZooCollection';
import { getAllCreatures, saveCreature as saveCreatureToDB } from '@/utils/db';

interface Creature {
  id: string;
  image: string;
  name: string;
  story: string;
  mood: MoodValues;
  date: number;
}

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Waking up Pixel...');
  const [worker, setWorker] = useState<Worker | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [coolDown, setCoolDown] = useState(false);
  const [story, setStory] = useState('');
  const [currentMood, setCurrentMood] = useState<MoodValues | null>(null);
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [error, setError] = useState<string | null>(null);

  const remainingGenerations = Math.max(0, 3 - generationCount);

  useEffect(() => {
    // Initialize AI Worker
    const aiWorker = new Worker(new URL('@/workers/ai-worker.ts', import.meta.url));
    setWorker(aiWorker);

    aiWorker.onmessage = (e) => {
      const { type, message, percent, text, safe, mood } = e.data;
      
      if (type === 'LOADING') {
        setLoadingMessage(message);
      }
      if (type === 'LOADING_PROGRESS') {
        setLoadingProgress(percent);
        setLoadingMessage(message);
      }
      if (type === 'READY') {
        setLoaded(true);
        setLoadingMessage(message);
      }
      if (type === 'STORY_RESULT' && safe) {
        setStory(text);
        setCurrentMood(mood);
        setError(null);
      }
      if (type === 'ERROR') {
        setError(message);
        setLoaded(true); // Still show the app even if model fails
      }
    };

    aiWorker.postMessage({ type: 'INIT' });

    // Load saved creatures
    loadCreatures();

    return () => aiWorker.terminate();
  }, []);

  const loadCreatures = async () => {
    try {
      const savedCreatures = await getAllCreatures();
      setCreatures(savedCreatures);
    } catch (err) {
      console.error('Failed to load creatures:', err);
    }
  };

  const handleGenerate = useCallback((moodValues: MoodValues) => {
    if (coolDown || remainingGenerations <= 0) {
      setCoolDown(true);
      setTimeout(() => {
        setCoolDown(false);
        setGenerationCount(0);
      }, 30000);
      return;
    }

    if (worker) {
      worker.postMessage({ type: 'GENERATE_STORY', payload: moodValues });
      setGenerationCount(prev => prev + 1);
    }
  }, [worker, coolDown, remainingGenerations]);

  const handleSaveCreature = useCallback(async (creature: Creature) => {
    try {
      await saveCreatureToDB(creature);
      setCreatures(prev => [creature, ...prev]);
      setStory('');
      setCurrentMood(null);
    } catch (err) {
      console.error('Failed to save creature:', err);
    }
  }, []);

  const handleRedraw = useCallback(() => {
    if (currentMood && worker) {
      worker.postMessage({ type: 'GENERATE_STORY', payload: currentMood });
      setGenerationCount(prev => prev + 1);
    }
  }, [currentMood, worker]);

  const handleDeleteCreature = useCallback((id: string) => {
    setCreatures(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-100 to-blue-100">
      {!loaded && (
        <LoadingScreen progress={loadingProgress} message={loadingMessage} />
      )}
      
      {loaded && (
        <div className="container mx-auto p-4 max-w-5xl">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-2">
              The Latent Space Zoo
            </h1>
            <p className="text-purple-600 text-sm md:text-base">
              🌟 Catch glitch creatures from the AI latent space! 🌟
            </p>
          </header>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-700 text-center">
              <p className="font-semibold">⚠️ Pixel is confused!</p>
              <p className="text-sm">{error}</p>
              <p className="text-xs mt-2">Try refreshing the page, or continue playing with limited features.</p>
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-6">
            <PixelNarrator story={story} isGenerating={!story && generationCount > 0 && !coolDown} />
            
            <StoryPotion
              onGenerate={handleGenerate}
              disabled={!worker || coolDown || (!error && generationCount > 0 && !story)}
              remainingGenerations={remainingGenerations}
            />
            
            <CreatureCanvas
              story={story}
              mood={currentMood}
              onSave={handleSaveCreature}
              onRedraw={handleRedraw}
            />
            
            <ZooCollection
              creatures={creatures}
              onDelete={handleDeleteCreature}
            />
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center text-purple-600 text-sm">
            <p>🔒 Privacy-first: All AI runs locally on your device</p>
            <p className="text-xs mt-1">No data leaves your browser • COPPA compliant • Works offline</p>
          </footer>
        </div>
      )}
    </main>
  );
}
