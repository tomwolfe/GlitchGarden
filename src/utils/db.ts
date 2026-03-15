import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface LatentSpaceZooDB extends DBSchema {
  creatures: {
    key: string;
    value: {
      id: string;
      imageData: Blob | string; // Support both Blob (for images) and string (for SVG)
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

/**
 * Convert a base64 or SVG string to a Blob
 */
function dataUrlToBlob(dataUrl: string): Blob {
  // Handle SVG data
  if (dataUrl.includes('<svg')) {
    return new Blob([dataUrl], { type: 'image/svg+xml' });
  }
  
  // Handle base64 data URLs (e.g., "data:image/png;base64,...")
  const [header, data] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  
  const binaryString = atob(data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: mime });
}

/**
 * Convert a Blob back to a data URL for rendering
 */
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function saveCreatureImage(id: string, imageData: string): Promise<void> {
  const db = await getDB();
  
  // Convert string (base64 or SVG) to Blob for efficient storage
  const blob = dataUrlToBlob(imageData);
  
  await db.put(STORE_NAME, {
    id,
    imageData: blob,
    timestamp: Date.now(),
  });
}

export async function getCreatureImage(id: string): Promise<string | undefined> {
  const db = await getDB();
  const result = await db.get(STORE_NAME, id);
  
  if (!result) {
    return undefined;
  }
  
  // Convert Blob back to data URL for rendering
  if (result.imageData instanceof Blob) {
    return await blobToDataUrl(result.imageData);
  }
  
  // Fallback for legacy string data
  return result.imageData;
}

export async function getCreatureImageAsBlob(id: string): Promise<Blob | undefined> {
  const db = await getDB();
  const result = await db.get(STORE_NAME, id);
  return result?.imageData instanceof Blob ? result.imageData : undefined;
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
