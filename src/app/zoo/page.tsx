'use client';

import React from 'react';
import { useStoryStore } from '@/store/useStoryStore';

const ZooCard: React.FC<{
  id: string;
  name: string;
  imageBase64: string;
  sillyLevel: number;
  spookyLevel: number;
  sleepyLevel: number;
  isGlitch: boolean;
  caughtAt: number;
  onRemove: (id: string) => void;
}> = ({ id, name, imageBase64, sillyLevel, spookyLevel, sleepyLevel, isGlitch, caughtAt, onRemove }) => {
  const date = new Date(caughtAt);
  const dateStr = date.toLocaleDateString();

  return (
    <div className="zoo-card group">
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        {imageBase64.includes('<svg') ? (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: imageBase64 }}
          />
        ) : (
          <img
            src={imageBase64}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 truncate">
          {isGlitch && '✨ '}{name}
        </h3>
        
        {/* Potion levels */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-silly-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-silly-500 h-full rounded-full" 
              style={{ width: `${sillyLevel}%` }}
            />
          </div>
          <div className="flex-1 bg-spooky-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-spooky-500 h-full rounded-full" 
              style={{ width: `${spookyLevel}%` }}
            />
          </div>
          <div className="flex-1 bg-sleepy-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-sleepy-500 h-full rounded-full" 
              style={{ width: `${sleepyLevel}%` }}
            />
          </div>
        </div>

        {/* Date and actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{dateStr}</span>
          <button
            onClick={() => onRemove(id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            aria-label={`Remove ${name} from zoo`}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ZooPage() {
  const { zoo, removeFromZoo, clearZoo } = useStoryStore();

  return (
    <main className="min-h-screen bg-gradient-to-br from-sleepy-100 via-silly-100 to-spooky-100">
      {/* Header */}
      <header className="bg-pixel-bg text-pixel-text py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            🦋 My Latent Space Zoo
          </h1>
          <nav className="flex gap-4">
            <a
              href="/"
              className="btn-chunky btn-chunky-secondary text-sm py-2 px-4"
            >
              🏠 Home
            </a>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Stats and Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {zoo.length} {zoo.length === 1 ? 'Creature' : 'Creatures'} Caught!
            </h2>
            <p className="text-gray-600">
              {zoo.filter(c => c.isGlitch).length} glitch {zoo.filter(c => c.isGlitch).length === 1 ? 'creature' : 'creatures'}
            </p>
          </div>
          
          {zoo.length > 0 && (
            <button
              onClick={clearZoo}
              className="btn-chunky btn-chunky-danger text-sm"
            >
              🗑️ Release All
            </button>
          )}
        </div>

        {/* Zoo Grid */}
        {zoo.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-4 border-gray-200">
            <div className="text-6xl mb-4">🦕</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Your zoo is empty!
            </h3>
            <p className="text-gray-600 mb-6">
              Go create some stories and catch glitch creatures to fill your zoo!
            </p>
            <a href="/" className="btn-chunky btn-chunky-primary">
              🌙 Start Dreaming
            </a>
          </div>
        ) : (
          <div className="zoo-grid">
            {zoo.map((creature) => (
              <ZooCard
                key={creature.id}
                {...creature}
                onRemove={removeFromZoo}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
