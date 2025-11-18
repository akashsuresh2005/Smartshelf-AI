// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/api.js';
import logActivity from '../utils/logActivity.js';
import { ensureSubscribed } from '../utils/pushClient.js';

const AuthContext = createContext(null);

function decodeJwtPayload(jwt) {
  try {
    const [, payload] = jwt.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const safeGetToken = () => {
    try {
      return typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('token') : null;
    } catch {
      return null;
    }
  };

  const [token, setToken] = useState(() => safeGetToken());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const t = safeGetToken();
    return t ? decodeJwtPayload(t) : null;
  });

  useEffect(() => {
    const check = async () => {
      try {
        if (!token) {
          setUser(null);
          return;
        }
        const payload = decodeJwtPayload(token);
        const now = Math.floor(Date.now() / 1000);
        if (!payload.exp || payload.exp <= now) {
          try { localStorage.removeItem('token'); } catch (e) {}
          setToken(null);
          setUser(null);
          return;
        }
        setUser(payload);
      } catch {
        try { localStorage.removeItem('token'); } catch (e) {}
        setToken(null);
        setUser(null);
      }
    };
    check().finally(() => setLoading(false));
  }, [token]);

  const refreshUser = async () => {
    try {
      const data = await api.get('/users/me');
      if (data) {
        setUser(data);
        return data;
      }
      return null;
    } catch (err) {
      if (err?.response?.status === 401) {
        try { localStorage.removeItem('token'); } catch {}
        setToken(null);
        setUser(null);
      }
      return null;
    }
  };

  const login = async (newToken) => {
    try {
      if (newToken) {
        try { localStorage.setItem('token', newToken); } catch (e) { console.warn('localStorage write failed', e); }
        setToken(newToken);
      }
      const payload = decodeJwtPayload(newToken || '');
      setUser(payload);

      try {
        await logActivity({
          userId: payload.id,
          userName: payload.name || payload.email,
          type: 'auth:login',
          message: `User logged in (${payload.email})`
        });
      } catch {}

      try {
        await ensureSubscribed();
        console.log('[Auth] ensureSubscribed succeeded');
      } catch (e) {
        console.warn('[Auth] ensureSubscribed failed', e);
      }
    } catch (e) {
      console.warn('[Auth] login error', e);
    }
  };

  const logout = async () => {
    const payload = user || decodeJwtPayload(safeGetToken() || '');
    try {
      if (payload && payload.id) {
        await logActivity({
          userId: payload.id,
          userName: payload.name || payload.email,
          type: 'auth:logout',
          message: `User logged out (${payload.email})`
        });
      }
    } catch {}
    try { localStorage.removeItem('token'); } catch {}
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') window.location.replace('/login');
  };

  const value = useMemo(
    () => ({ token, login, logout, isAuthenticated: !!token, loading, user, refreshUser, setUser }),
    [token, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

