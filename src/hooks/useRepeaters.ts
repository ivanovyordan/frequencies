import { useState, useEffect } from 'react';
import type { Repeater } from '../types/repeater';
import { fetchRepeaters } from '../services/api';

interface UseRepeatersResult {
  repeaters: Repeater[];
  loading: boolean;
  error: string | null;
}

export function useRepeaters(): UseRepeatersResult {
  const [repeaters, setRepeaters] = useState<Repeater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRepeaters()
      .then(setRepeaters)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Грешка при зареждане');
      })
      .finally(() => setLoading(false));
  }, []);

  return { repeaters, loading, error };
}
