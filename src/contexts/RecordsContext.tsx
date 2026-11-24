import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { notifyRecordSaved } from '@/services/notifications';
import type { AnimalRecord, DraftAnimal } from '@/@types/animal';
import { loadRecords, saveRecord, deleteRecord } from '@/services/recordsStorage';

interface RecordsContextValue {
  records: AnimalRecord[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addRecord: (draft: DraftAnimal) => Promise<AnimalRecord>;
  removeRecord: (id: string) => Promise<void>;
}

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<AnimalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRecords(await loadRecords());
      setError(null);
    } catch (cause) {
      console.warn('Falha ao carregar galeria:', cause);
      setError('Não foi possível abrir sua galeria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const addRecord = useCallback(async (draft: DraftAnimal) => {
    const record = await saveRecord(draft);
    setRecords((current) => [record, ...current]);
    setError(null);
    // A falha de uma notificação não desfaz um registro já salvo.
    void notifyRecordSaved(record.id);
    return record;
  }, []);

  const removeRecord = useCallback(async (id: string) => {
    await deleteRecord(id);
    setRecords((current) => current.filter((record) => record.id !== id));
    setError(null);
  }, []);

  const value = useMemo(() => ({ records, loading, error, reload, addRecord, removeRecord }), [records, loading, error, reload, addRecord, removeRecord]);
  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords() {
  const context = useContext(RecordsContext);
  if (!context) throw new Error('useRecords requer RecordsProvider.');
  return context;
}
