'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAllCreatures, deleteCreature, toggleFavorite, type CreatureRecord } from '@/lib/zoo-db';
import { Heart, Trash2, Sparkles } from 'lucide-react';

interface ZooGalleryProps {
  onCreatureSelect?: (creature: CreatureRecord) => void;
}

export function ZooGallery({ onCreatureSelect }: ZooGalleryProps) {
  const [creatures, setCreatures] = useState<CreatureRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'Common' | 'Mythic' | 'Glitch'>('all');

  useEffect(() => {
    loadCreatures();
  }, []);

  const loadCreatures = async () => {
    const all = await getAllCreatures();
    setCreatures(all);
  };

  const filteredCreatures = creatures.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return c.isFavorite;
    return c.stats.rarity === filter;
  });

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Release this creature back to the void?')) {
      await deleteCreature(id);
      loadCreatures();
    }
  };

  const handleFavorite = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(id);
    loadCreatures();
  };

  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-quantum-400" />
          Your Zoo ({creatures.length})
        </h2>
        
        <div className="flex gap-2">
          {(['all', 'favorites', 'Common', 'Mythic', 'Glitch'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                filter === f
                  ? 'bg-quantum-500 text-white'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {filteredCreatures.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No creatures found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
          {filteredCreatures.map((creature) => (
            <motion.div
              key={creature.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-quantum-400/50 cursor-pointer transition-colors"
              onClick={() => onCreatureSelect?.(creature)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white">{creature.name}</h3>
                  <p className="text-xs text-gray-400">{creature.species}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => handleFavorite(creature.id!, e)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      creature.isFavorite
                        ? 'bg-pink-500/20 text-pink-400'
                        : 'bg-white/10 text-gray-400 hover:text-pink-400'
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={creature.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(creature.id!, e)}
                    className="p-1.5 rounded-lg bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                {creature.color_palette.map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className={`
                  ${creature.stats.rarity === 'Common' ? 'text-gray-400' : ''}
                  ${creature.stats.rarity === 'Mythic' ? 'text-yellow-400' : ''}
                  ${creature.stats.rarity === 'Glitch' ? 'text-purple-400' : ''}
                `}>
                  {creature.stats.rarity}
                </span>
                <span className="text-gray-500">
                  Stability: {creature.stats.stability}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
