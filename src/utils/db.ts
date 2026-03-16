import { openDB, DBSchema, IDBPDatabase } from 'idb';

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

interface LatentZooDB extends DBSchema {
  creatures: {
    key: string;
    value: Creature;
  };
  settings: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'LatentZooDB';
const DB_VERSION = 1;

export const initDB = async (): Promise<IDBPDatabase<LatentZooDB>> => {
  return openDB<LatentZooDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('creatures')) {
        db.createObjectStore('creatures', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
};

export const saveCreature = async (creature: Creature): Promise<void> => {
  const db = await initDB();
  await db.put('creatures', creature);
};

export const getAllCreatures = async (): Promise<Creature[]> => {
  const db = await initDB();
  return db.getAll('creatures');
};

export const deleteCreature = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete('creatures', id);
};

export const getSetting = async <T>(key: string): Promise<T | undefined> => {
  const db = await initDB();
  const setting = await db.get('settings', key) as { key: string; value: T } | undefined;
  return setting?.value;
};

export const setSetting = async (key: string, value: unknown): Promise<void> => {
  const db = await initDB();
  await db.put('settings', { key, value });
};

export const exportZooData = async (): Promise<string> => {
  const creatures = await getAllCreatures();
  const settings: Record<string, unknown> = {};
  const db = await initDB();
  const allSettings = await db.getAll('settings');

  for (const setting of allSettings) {
    const s = setting as { key: string; value: unknown };
    settings[s.key] = s.value;
  }

  return JSON.stringify({
    version: DB_VERSION,
    exportDate: Date.now(),
    creatures,
    settings,
  }, null, 2);
};

export const importZooData = async (jsonData: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonData) as { creatures?: unknown[]; settings?: Record<string, unknown> };
    if (!data.creatures || !Array.isArray(data.creatures)) {
      return false;
    }

    const db = await initDB();

    // Import creatures
    for (const creature of data.creatures) {
      await db.put('creatures', creature as Creature);
    }

    // Import settings if present
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await db.put('settings', { key, value });
      }
    }

    return true;
  } catch {
    return false;
  }
};
