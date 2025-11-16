import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/api.js';
import logActivity from '../utils/logActivity.js';
import { ensureSubscribed } from '../utils/pushClient.js'; // <- added

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
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
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
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          return;
        }
        setUser(payload);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    };
    check().finally(() => setLoading(false));
  }, [token]);

  // refreshUser: re-fetch server-side user doc and update context (use after profile/settings change)
  const refreshUser = async () => {
    try {
      const { data } = await api.get('/users/me'); // /api/users/me
      if (data) {
        setUser(data);
        return data;
      }
      return null;
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
      return null;
    }
  };

  // login: store token, set user, and log activity
  const login = async (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const payload = decodeJwtPayload(newToken);
    setUser(payload);

    try {
      await logActivity({
        userId: payload.id,
        userName: payload.name || payload.email,
        type: 'auth:login',
        message: `User logged in (${payload.email})`
      });
    } catch {}

    // ensure subscription is created and POSTed while user is authenticated
    // non-blocking: if it fails we log and continue (won't break login)
    try {
      await ensureSubscribed();
      console.log('[Auth] ensureSubscribed succeeded');
    } catch (e) {
      console.warn('[Auth] ensureSubscribed failed', e);
    }
  };

  // logout: clear token, log activity and redirect
  const logout = async () => {
    const payload = user || decodeJwtPayload(localStorage.getItem('token') || '');
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
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.replace('/login');
  };

  const value = useMemo(
    () => ({ token, login, logout, isAuthenticated: !!token, loading, user, refreshUser, setUser }),
    [token, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
