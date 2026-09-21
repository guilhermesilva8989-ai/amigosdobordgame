import type { DashboardResponse } from '../types/dashboard';

const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export async function getPublicDashboard(
  signal?: AbortSignal,
): Promise<DashboardResponse> {
  const response = await fetch(`${API_URL}/public/dashboard`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar o painel: HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<DashboardResponse>;
}
