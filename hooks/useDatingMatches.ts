import { useState, useEffect, useCallback } from 'react';
import { datingApi } from '@/http/datingApi';
import { DatingMatch } from '@/types';

interface UseDatingMatchesOptions {
  autoLoad?: boolean;
}

interface UseDatingMatchesReturn {
  matches: DatingMatch[];
  loading: boolean;
  error: string | null;
  loadMatches: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useDatingMatches = (options: UseDatingMatchesOptions = {}): UseDatingMatchesReturn => {
  const { autoLoad = true } = options;

  const [matches, setMatches] = useState<DatingMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await datingApi.getMatchSuggestions();
      if (response && response.list) {
        setMatches(response.list);
      } else {
        setError('Failed to load matches');
      }
    } catch (err) {
      setError('Error loading matches. Please try again.');
      console.error('Error in loadMatches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadMatches();
  }, [loadMatches]);

  // Auto-load matches on mount
  useEffect(() => {
    if (autoLoad) {
      loadMatches();
    }
  }, [autoLoad, loadMatches]);

  return {
    matches,
    loading,
    error,
    loadMatches,
    refresh
  };
}; 