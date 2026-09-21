import { useCallback, useEffect, useState } from 'react';
import { getPublicDashboard } from '../services/dashboard-api';
import type { DashboardResponse } from '../types/dashboard';

interface UseDashboardResult {
  dashboard: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboard(): UseDashboardResult {
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setError(null);

        const response = await getPublicDashboard(signal);

        if (!signal?.aborted) {
          setDashboard(response);
        }
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === 'AbortError'
        ) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Não foi possível carregar os dados.',
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const controller = new AbortController();

    const initialLoad = window.setTimeout(() => {
      void loadDashboard(controller.signal);
    }, 0);

    const interval = window.setInterval(() => {
      void loadDashboard();
    }, 60_000);

    return () => {
      controller.abort();
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadDashboard]);

  return {
    dashboard,
    loading,
    error,
    refresh,
  };
}
