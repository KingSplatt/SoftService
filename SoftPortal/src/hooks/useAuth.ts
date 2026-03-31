import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  nombre_usuario: string;
  id_rol: number;
  rol_nombre?: string;
}

interface RegisterPayload {
  nombreUsuario: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const API_BASE_URL = 'http://localhost:8080/api';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialUser(): User | null {
  const savedUser = localStorage.getItem('user');
  return savedUser ? (JSON.parse(savedUser) as User) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('token') !== null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales invalidas');
      }

      const data = await response.json();

      localStorage.setItem('token', data.token || 'session-token');
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesion';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async ({ nombreUsuario, email, password }: RegisterPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombreUsuario, email, password }),
      });

      if (!response.ok) {
        throw new Error('No se pudo registrar el usuario');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const isAdmin = user?.rol_nombre?.toLowerCase() === 'admin' || user?.id_rol === 1;

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      isLoading,
      error,
      clearError,
    }),
    [clearError, error, isAdmin, isAuthenticated, isLoading, login, logout, register, user],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
