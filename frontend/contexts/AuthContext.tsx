import { createContext, ReactNode } from 'react';

interface User {
  userID: string;
  email: string;
  name: string;
  role: 'admin' | 'operations' | 'crew';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // With the login flow removed, we provide a static, authenticated user context.
  // This mock user is an admin, allowing access to all parts of the app.
  const user: User = {
    userID: 'user_00237089130',
    email: 'camilla.pereira@sharebrasil.com',
    name: 'Camilla de Mello Pereira',
    role: 'admin',
  };

  const value = {
    isAuthenticated: true,
    user,
    token: null,
    isLoading: false,
    login: async () => {
      // No-op
    },
    logout: () => {
      // No-op
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
