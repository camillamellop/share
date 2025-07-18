import backend from '~backend/client';

export function useBackend() {
  // With the login flow removed, the backend auth handler no longer requires a token.
  // We can use the backend client directly without authentication headers.
  return backend;
}
