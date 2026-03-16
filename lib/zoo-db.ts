import Dexie, { Table } from 'dexie';

export interface CreatureRecord {
  id?: number;
  species: string;
  trait: string;
  color_palette: string[];
  behavior: 'hyper' | 'docile' | 'glitchy';
  stats: {
    stability: number;
    rarity: 'Common' | 'Mythic' | 'Glitch';
  };
  svg_config: {
    nodes: number;
    spikiness: number;
    wobble: number;
  };
  dna: {
    chaos: number;
    sparkle: number;
    ancient: number;
    size: number;
  };
  createdAt: Date;
  name: string;
  isFavorite: boolean;
}

/**
 * Dexie database for storing the Latent Space Zoo
 */
class ZooDatabase extends Dexie {
  creatures!: Table<CreatureRecord, number>;

  constructor() {
    super('LatentSpaceZoo');
    
    this.version(1).stores({
      creatures: '++id, species, rarity, createdAt, isFavorite, name',
    });
  }
}

export const db = new ZooDatabase();

/**
 * Add a new creature to the zoo
 */
export async function addCreature(
  creature: Omit<CreatureRecord, 'id' | 'createdAt' | 'isFavorite' | 'name'>,
  dna: { chaos: number; sparkle: number; ancient: number; size: number }
): Promise<number> {
  const id = await db.creatures.add({
    ...creature,
    dna,
    createdAt: new Date(),
    isFavorite: false,
    name: `${creature.species} #${(await db.creatures.count()) + 1}`,
  });
  return id as number;
}

/**
 * Get all creatures from the zoo
 */
export async function getAllCreatures(): Promise<CreatureRecord[]> {
  return await db.creatures.orderBy('createdAt').reverse().toArray();
}

/**
 * Get creatures by rarity
 */
export async function getCreaturesByRarity(
  rarity: 'Common' | 'Mythic' | 'Glitch'
): Promise<CreatureRecord[]> {
  return await db.creatures.where('rarity').equals(rarity).toArray();
}

/**
 * Get favorite creatures
 */
export async function getFavoriteCreatures(): Promise<CreatureRecord[]> {
  return await db.creatures.where('isFavorite').equals(1).toArray();
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(id: number): Promise<void> {
  const creature = await db.creatures.get(id);
  if (creature) {
    await db.creatures.update(id, { isFavorite: !creature.isFavorite });
  }
}

/**
 * Rename a creature
 */
export async function renameCreature(id: number, name: string): Promise<void> {
  await db.creatures.update(id, { name });
}

/**
 * Delete a creature
 */
export async function deleteCreature(id: number): Promise<void> {
  await db.creatures.delete(id);
}

/**
 * Get zoo statistics
 */
export async function getZooStats(): Promise<{
  total: number;
  common: number;
  mythic: number;
  glitch: number;
  favorites: number;
}> {
  const creatures = await db.creatures.toArray();
  return {
    total: creatures.length,
    common: creatures.filter((c) => c.stats.rarity === 'Common').length,
    mythic: creatures.filter((c) => c.stats.rarity === 'Mythic').length,
    glitch: creatures.filter((c) => c.stats.rarity === 'Glitch').length,
    favorites: creatures.filter((c) => c.isFavorite).length,
  };
}

/**
 * Search creatures by name or species
 */
export async function searchCreatures(query: string): Promise<CreatureRecord[]> {
  const lowerQuery = query.toLowerCase();
  const creatures = await db.creatures.toArray();
  return creatures.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.species.toLowerCase().includes(lowerQuery) ||
      c.trait.toLowerCase().includes(lowerQuery)
  );
}
