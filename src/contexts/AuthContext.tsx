import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const SESSION_KEY = '@olhar-selvagem/user';
const API_URL = process.env.EXPO_PUBLIC_LOGIN_API_URL || 'https://login-api-j9cl.onrender.com/fatec/login/v1/auth';

export interface AuthUser {
  username: string;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(SESSION_KEY)
      .then((stored) => {
        if (!active || !stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (isAuthUser(parsed)) setUser({ username: parsed.username, roles: parsed.roles ?? [] });
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    let response: Response;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      response = await fetch(API_URL, {
        signal: controller.signal,
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('Usuário ou senha inválidos. Verifique os dados e tente novamente.');
    }
    if (!response.ok) {
      throw new Error('Não foi possível realizar o login agora. Tente novamente em instantes.');
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error('O servidor retornou uma resposta de login inválida.');
    }
    if (!isAuthUser(data)) {
      throw new Error('O servidor retornou uma resposta de login inválida.');
    }

    // O cookie de autenticação é recebido e enviado pelo armazenamento de cookies do fetch.
    // Apenas os dados públicos do usuário ficam no armazenamento local para restaurar a tela.
    const nextUser = { username: data.username, roles: data.roles ?? [] };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const signInDemo = useCallback(async () => {
    const demoUser: AuthUser = { username: 'Demonstração', roles: [] };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signInDemo, signOut }), [user, loading, signIn, signInDemo, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false;
  const user = value as Record<string, unknown>;
  return typeof user.username === 'string' && user.username.length > 0 &&
    (user.roles === undefined || (Array.isArray(user.roles) && user.roles.every((role) => typeof role === 'string')));
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requer AuthProvider.');
  return context;
}
