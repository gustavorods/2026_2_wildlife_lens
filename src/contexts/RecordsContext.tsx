import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AnimalRecord, DraftAnimal } from '@/@types/animal';
import { loadRecords, saveRecord } from '@/services/recordsStorage';

interface RecordsContextValue {
  records: AnimalRecord[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addRecord: (draft: DraftAnimal) => Promise<AnimalRecord>;
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
    } catch {
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
    return record;
  }, []);

  const value = useMemo(() => ({ records, loading, error, reload, addRecord }), [records, loading, error, reload, addRecord]);
  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords() {
  const context = useContext(RecordsContext);
  if (!context) throw new Error('useRecords requer RecordsProvider.');
  return context;
}
