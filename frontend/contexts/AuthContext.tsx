import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '~backend/client';
import { jwtDecode } from 'jwt-decode';

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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const decodeToken = (tokenStr: string): User | null => {
    try {
      const decoded: any = jwtDecode(tokenStr);
      return {
        userID: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      };
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      const decodedUser = decodeToken(storedToken);
      if (decodedUser) {
        setUser(decodedUser);
        setToken(storedToken);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await backend.auth.login({ email, password });
    const { token: newToken } = response;
    
    localStorage.setItem('authToken', newToken);
    const decodedUser = decodeToken(newToken);
    
    if (decodedUser) {
      setUser(decodedUser);
      setToken(newToken);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    navigate('/login');
  }, [navigate]);

  const value = {
    isAuthenticated: !!token,
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
