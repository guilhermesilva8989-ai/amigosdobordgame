import {
  clearAuthSession,
  getAuthSession,
} from './auth-session';
import type {
  AdminParticipant,
  CreateParticipantInput,
  UpdateParticipantInput,
} from '../types/admin';

const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

interface ApiErrorResponse {
  message?: string | string[];
}

async function authorizedRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const session = getAuthSession();

  if (!session) {
    throw new Error('Sessão não encontrada. Faça login novamente.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
      ...(options.body
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    clearAuthSession();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => ({}))) as ApiErrorResponse;

    const message = Array.isArray(error.message)
      ? error.message.join(' ')
      : error.message;

    throw new Error(
      message ?? `Não foi possível concluir a operação.`,
    );
  }

  return response.json() as Promise<T>;
}

export function listAdminParticipants() {
  return authorizedRequest<AdminParticipant[]>(
    '/admin/participants',
  );
}

export function createAdminParticipant(
  input: CreateParticipantInput,
) {
  return authorizedRequest<AdminParticipant>(
    '/admin/participants',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function updateAdminParticipant(
  participantId: string,
  input: UpdateParticipantInput,
) {
  return authorizedRequest<AdminParticipant>(
    `/admin/participants/${participantId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
}
