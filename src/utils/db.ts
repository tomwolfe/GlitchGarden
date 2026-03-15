import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface LatentSpaceZooDB extends DBSchema {
  creatures: {
    key: string;
    value: {
      id: string;
      imageData: string;
      timestamp: number;
    };
  };
}

const DB_NAME = 'latent-space-zoo-db';
const DB_VERSION = 1;
const STORE_NAME = 'creatures';

let dbPromise: Promise<IDBPDatabase<LatentSpaceZooDB>> | null = null;

function getDB(): Promise<IDBPDatabase<LatentSpaceZooDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LatentSpaceZooDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveCreatureImage(id: string, base64Data: string): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, {
    id,
    imageData: base64Data,
    timestamp: Date.now(),
  });
}

export async function getCreatureImage(id: string): Promise<string | undefined> {
  const db = await getDB();
  const result = await db.get(STORE_NAME, id);
  return result?.imageData;
}

export async function deleteCreatureImage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearAllImages(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).clear();
  await tx.done;
}
