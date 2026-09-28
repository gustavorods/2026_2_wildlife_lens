import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import type { AnimalRecord, DraftAnimal } from '@/@types/animal';

const KEY = '@olhar-selvagem/records/v1';

export async function loadRecords(): Promise<AnimalRecord[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  const records: unknown = JSON.parse(raw);
  if (!Array.isArray(records)) throw new Error('Os registros salvos estão inválidos.');
  return records as AnimalRecord[];
}

export async function saveRecord(draft: DraftAnimal): Promise<AnimalRecord> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const directory = `${FileSystem.documentDirectory}animals/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const extension = draft.imageUri.split('?')[0].match(/\.(jpe?g|png|webp|heic)$/i)?.[1]?.toLowerCase() ?? 'jpg';
  const imageUri = `${directory}${id}.${extension}`;
  await FileSystem.copyAsync({ from: draft.imageUri, to: imageUri });
  const record: AnimalRecord = { id, imageUri, latitude: draft.latitude, longitude: draft.longitude, createdAt: new Date().toISOString() };
  try {
    const previous = await loadRecords();
    await AsyncStorage.setItem(KEY, JSON.stringify([record, ...previous]));
    return record;
  } catch (error) {
    await FileSystem.deleteAsync(imageUri, { idempotent: true });
    throw error;
  }
}
