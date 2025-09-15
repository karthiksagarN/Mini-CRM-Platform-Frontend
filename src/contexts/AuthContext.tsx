// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../api/apiClient';

interface User {
  name?: string;
  email?: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginWithToken: (t: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('xeno_user') || 'null');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('xeno_token')
  );

  useEffect(() => {
    if (token) setAuthToken(token);
    else setAuthToken(null);
  }, [token]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data && e.data.type === 'XENO_AUTH' && e.data.token) {
        const t = e.data.token as string;
        localStorage.setItem('xeno_token', t);
        setToken(t);

        try {
          const payloadBase = t.split('.')[1];
          const json = JSON.parse(atob(payloadBase));
          const u: User = { name: json.name, email: json.email, id: json.sub };
          localStorage.setItem('xeno_user', JSON.stringify(u));
          setUser(u);
        } catch {
          /* ignore decode errors */
        }

        // Redirect after login
        window.location.replace('/');
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const loginWithToken = (t: string) => {
    localStorage.setItem('xeno_token', t);
    setToken(t);

    try {
      const payloadBase = t.split('.')[1];
      const json = JSON.parse(atob(payloadBase));
      const u: User = { name: json.name, email: json.email, id: json.sub };
      localStorage.setItem('xeno_user', JSON.stringify(u));
      setUser(u);
    } catch {
      /* ignore decode errors */
    }

    window.location.replace('/');
  };

  const logout = () => {
    localStorage.removeItem('xeno_token');
    localStorage.removeItem('xeno_user');
    setToken(null);
    setUser(null);
    setAuthToken(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
