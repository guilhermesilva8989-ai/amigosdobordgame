import type { AuthSession } from '../types/auth';

const SESSION_KEY = 'amigos-board-admin-session';

export function saveAuthSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  const storedSession = sessionStorage.getItem(SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    const session = JSON.parse(storedSession) as AuthSession;

    if (
      typeof session.accessToken !== 'string' ||
      typeof session.admin?.id !== 'string' ||
      typeof session.admin?.email !== 'string'
    ) {
      clearAuthSession();
      return null;
    }

    return session;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
