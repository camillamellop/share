import { useAuth } from './useAuth';
import backend from '~backend/client';

export function useBackend() {
  const { token } = useAuth();
  if (!token) return backend;
  return backend.with({ auth: { authorization: `Bearer ${token}` } });
}
