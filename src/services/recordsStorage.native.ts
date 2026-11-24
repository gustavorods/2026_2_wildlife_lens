import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import type { AnimalRecord, DraftAnimal } from '@/@types/animal';

const KEY = '@olhar-selvagem/records/v1';

let database: Promise<SQLite.SQLiteDatabase> | undefined;

function openDatabase() {
  if (!database) database = initializeDatabase().catch((error) => {
    database = undefined;
    throw error;
  });
  return database;
}

async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync('olhar-selvagem.db');
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS animals (
        id TEXT PRIMARY KEY NOT NULL,
        imageUri TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const legacy: unknown = JSON.parse(raw);
      if (!Array.isArray(legacy) || !legacy.every(isRecord)) throw new Error('Os registros salvos estão inválidos.');
      await db.withTransactionAsync(async () => {
        for (const record of legacy) {
          await db.runAsync('INSERT OR IGNORE INTO animals (id, imageUri, latitude, longitude, createdAt) VALUES (?, ?, ?, ?, ?)',
            record.id, record.imageUri, record.latitude, record.longitude, record.createdAt);
        }
      });
      // Só remove o índice antigo depois que todos os registros foram persistidos.
      await AsyncStorage.removeItem(KEY);
    }
    return db;
  } catch (error) {
    await db.closeAsync();
    throw error;
  }
}

function isRecord(value: unknown): value is AnimalRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === 'string' && typeof record.imageUri === 'string' &&
    typeof record.createdAt === 'string' && typeof record.latitude === 'number' &&
    Number.isFinite(record.latitude) && typeof record.longitude === 'number' && Number.isFinite(record.longitude);
}

export async function loadRecords(): Promise<AnimalRecord[]> {
  const db = await openDatabase();
  return db.getAllAsync<AnimalRecord>('SELECT * FROM animals ORDER BY createdAt DESC');
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await openDatabase();
  const record = await db.getFirstAsync<AnimalRecord>('SELECT * FROM animals WHERE id = ?', id);
  if (!record) return;
  await db.runAsync('DELETE FROM animals WHERE id = ?', id);
  // Só apaga arquivos da pasta gerenciada pelo app, nunca a imagem original da galeria.
  const directory = FileSystem.documentDirectory && `${FileSystem.documentDirectory}animals/`;
  if (directory && record.imageUri.startsWith(directory)) {
    try {
      await FileSystem.deleteAsync(record.imageUri, { idempotent: true });
    } catch (error) {
      // O registro já foi excluído; uma falha na limpeza não deve reaparecer como falha de exclusão.
      console.warn('Registro apagado, mas não foi possível limpar o arquivo da foto:', error);
    }
  }
}

export async function saveRecord(draft: DraftAnimal): Promise<AnimalRecord> {
  const db = await openDatabase();
  if (!FileSystem.documentDirectory) throw new Error('Armazenamento local indisponível.');
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const directory = `${FileSystem.documentDirectory}animals/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const extension = draft.imageUri.split('?')[0].match(/\.(jpe?g|png|webp|heic)$/i)?.[1]?.toLowerCase() ?? 'jpg';
  const imageUri = `${directory}${id}.${extension}`;
  await FileSystem.copyAsync({ from: draft.imageUri, to: imageUri });
  const record: AnimalRecord = { id, imageUri, latitude: draft.latitude, longitude: draft.longitude, createdAt: new Date().toISOString() };
  try {
    await db.runAsync('INSERT INTO animals (id, imageUri, latitude, longitude, createdAt) VALUES (?, ?, ?, ?, ?)',
      record.id, record.imageUri, record.latitude, record.longitude, record.createdAt);
    return record;
  } catch (error) {
    await FileSystem.deleteAsync(imageUri, { idempotent: true });
    throw error;
  }
}
