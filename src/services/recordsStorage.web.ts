import type { AnimalRecord, DraftAnimal } from '@/@types/animal';

const DATABASE = 'olhar-selvagem';
const STORE = 'animals';

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('Este navegador não oferece armazenamento local.'));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function durableImageUri(uri: string): Promise<string> {
  if (uri.startsWith('data:')) return uri;
  const response = await fetch(uri);
  if (!response.ok) throw new Error('Não foi possível preparar a foto para salvar.');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function loadRecords(): Promise<AnimalRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result as AnimalRecord[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

export async function saveRecord(draft: DraftAnimal): Promise<AnimalRecord> {
  const imageUri = await durableImageUri(draft.imageUri);
  const record: AnimalRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    imageUri,
    latitude: draft.latitude,
    longitude: draft.longitude,
    createdAt: new Date().toISOString(),
  };
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).add(record);
    transaction.oncomplete = () => { db.close(); resolve(record); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}
