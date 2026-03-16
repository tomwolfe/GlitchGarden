'use client';

import React, { useState } from 'react';
import { exportZooData, importZooData, deleteCreature } from '@/utils/db';

interface Creature {
  id: string;
  image: string;
  name: string;
  story: string;
  mood: {
    silly: number;
    spooky: number;
    sleepy: number;
    chaos: number;
  };
  date: number;
}

interface ZooCollectionProps {
  creatures: Creature[];
  onDelete?: (id: string) => void;
}

export default function ZooCollection({ creatures, onDelete }: ZooCollectionProps) {
  const [showExportImport, setShowExportImport] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = async () => {
    try {
      const data = await exportZooData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `latent-zoo-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = await importZooData(text);
      
      if (success) {
        setImportSuccess(true);
        setImportError('');
        setTimeout(() => {
          setImportSuccess(false);
          window.location.reload();
        }, 2000);
      } else {
        setImportError('Invalid zoo data file');
      }
    } catch {
      setImportError('Failed to import file');
    }
    
    // Reset input
    event.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to release this creature back to the latent space?')) {
      await deleteCreature(id);
      onDelete?.(id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border-4 border-green-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-green-800">
            🏠 Your Zoo Collection
          </h2>
          <p className="text-green-600 text-sm md:text-base">
            {creatures.length} creature{creatures.length !== 1 ? 's' : ''} caught!
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowExportImport(!showExportImport)}
            className="py-2 px-4 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors border-2 border-blue-300 text-sm"
          >
            💾 Backup
          </button>
        </div>
      </div>

      {/* Export/Import Panel */}
      {showExportImport && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handleExport}
              disabled={creatures.length === 0}
              className="py-2 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              📤 Export Zoo
            </button>
            
            <label className="py-2 px-4 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors cursor-pointer">
              📥 Import Zoo
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            {importSuccess && (
              <span className="text-green-600 font-medium">✨ Import successful! Reloading...</span>
            )}
            {importError && (
              <span className="text-red-500 font-medium">⚠️ {importError}</span>
            )}
          </div>
        </div>
      )}

      {/* Creatures Grid */}
      {creatures.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🥚</span>
          <p className="text-green-600 text-lg">
            Your zoo is empty! Brew some potions to catch creatures.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creatures.map((creature) => (
            <CreatureCard
              key={creature.id}
              creature={creature}
              onDelete={() => handleDelete(creature.id)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface CreatureCardProps {
  creature: Creature;
  onDelete: () => void;
  formatDate: (timestamp: number) => string;
}

function CreatureCard({ creature, onDelete, formatDate }: CreatureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-4 border-2 border-green-200 shadow-md hover:shadow-lg transition-all">
      {/* Creature Image */}
      <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-purple-100 to-pink-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={creature.image}
          alt={creature.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Creature Info */}
      <h3 className="text-lg font-bold text-green-800 mb-1">
        {creature.name}
      </h3>
      
      <p className="text-xs text-green-600 mb-2">
        Caught on {formatDate(creature.date)}
      </p>

      {/* Mood indicators */}
      <div className="flex gap-1 mb-3">
        <MoodDot emoji="😄" value={creature.mood.silly} color="bg-yellow-400" />
        <MoodDot emoji="👻" value={creature.mood.spooky} color="bg-purple-400" />
        <MoodDot emoji="😴" value={creature.mood.sleepy} color="bg-blue-400" />
        <MoodDot emoji="🌈" value={creature.mood.chaos} color="bg-gradient-to-r from-pink-400 to-orange-400" />
      </div>

      {/* Story Preview */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-sm text-purple-700 bg-purple-50 rounded-lg p-2 mb-2 hover:bg-purple-100 transition-colors"
      >
        {isExpanded ? (
          <span className="line-clamp-none">{creature.story}</span>
        ) : (
          <span className="line-clamp-2">{creature.story}</span>
        )}
      </button>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="w-full py-2 px-3 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
      >
        🕊️ Release
      </button>
    </div>
  );
}

interface MoodDotProps {
  emoji: string;
  value: number;
  color: string;
}

function MoodDot({ emoji, value, color }: MoodDotProps) {
  return (
    <div className="relative group">
      <div className={`w-6 h-6 ${color} rounded-full flex items-center justify-center text-xs shadow border border-white`}>
        {emoji}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {value}%
      </div>
    </div>
  );
}
