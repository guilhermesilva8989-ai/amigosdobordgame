import type {
  AuthSession,
  LoginCredentials,
} from '../types/auth';

const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

interface ErrorResponse {
  message?: string | string[];
}

export async function loginAdmin(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => ({}))) as ErrorResponse;

    const message = Array.isArray(error.message)
      ? error.message.join(' ')
      : error.message;

    throw new Error(
      message ?? 'Não foi possível realizar o login.',
    );
  }

  return response.json() as Promise<AuthSession>;
}

export async function getAuthenticatedAdmin(
  accessToken: string,
): Promise<AuthSession['admin']> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Sessão inválida ou expirada.');
  }

  return response.json() as Promise<AuthSession['admin']>;
}
