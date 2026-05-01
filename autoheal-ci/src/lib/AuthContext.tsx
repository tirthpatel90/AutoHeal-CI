'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: 'email' | 'github' | 'google';
  avatar_url: string | null;
  joined_at: string;
  connected_providers: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<void>;
  loginOAuth: (provider: 'github' | 'google') => Promise<void>;
  logout: () => void;
  updateProfile: (updates: { name?: string }) => void;
  deleteAccount: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'autoheal_user';

// ─── Simple persistent user DB (localStorage) ─────────────────────────────────
function getUsers(): Record<string, AuthUser & { password?: string }> {
  try { return JSON.parse(localStorage.getItem('autoheal_users') || '{}'); } catch { return {}; }
}
function saveUsers(db: Record<string, AuthUser & { password?: string }>) {
  localStorage.setItem('autoheal_users', JSON.stringify(db));
}
function generateId() {
  return 'usr_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setIsLoading(false);
  }, []);

  const persistUser = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  const clearError = useCallback(() => setError(null), []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    const db = getUsers();
    const existing = Object.values(db).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error('An account with this email already exists');

    const newUser: AuthUser = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase(),
      provider: 'email',
      avatar_url: null,
      joined_at: new Date().toISOString(),
      connected_providers: ['email'],
    };
    db[newUser.id] = { ...newUser, password };
    saveUsers(db);
    persistUser(newUser);
  }, []);

  const loginEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    const db = getUsers();
    const found = Object.values(db).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== password) {
      throw new Error('Invalid email or password');
    }
    const { password: _p, ...safeUser } = found;
    persistUser(safeUser as AuthUser);
  }, []);

  const loginOAuth = useCallback(async (provider: 'github' | 'google') => {
    setError(null);
    // Simulate OAuth — creates a demo account for this provider if not existing
    const demoEmail = `demo_${provider}@autoheal.dev`;
    const db = getUsers();
    const existing = Object.values(db).find(u => u.email === demoEmail);

    if (existing) {
      const { password: _p, ...safeUser } = existing;
      persistUser(safeUser as AuthUser);
      return;
    }

    const newUser: AuthUser = {
      id: generateId(),
      name: provider === 'github' ? 'GitHub User' : 'Google User',
      email: demoEmail,
      provider,
      avatar_url: null,
      joined_at: new Date().toISOString(),
      connected_providers: [provider],
    };
    db[newUser.id] = newUser;
    saveUsers(db);
    persistUser(newUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateProfile = useCallback((updates: { name?: string }) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Also update users DB
      const db = getUsers();
      if (db[prev.id]) { db[prev.id] = { ...db[prev.id], ...updates }; saveUsers(db); }
      return updated;
    });
  }, []);

  const deleteAccount = useCallback(() => {
    if (!user) return;
    const db = getUsers();
    delete db[user.id];
    saveUsers(db);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated: !!user,
      register, loginEmail, loginOAuth, logout,
      updateProfile, deleteAccount, error, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
