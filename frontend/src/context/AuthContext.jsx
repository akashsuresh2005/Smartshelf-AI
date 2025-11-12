import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function decodeExp(jwt) {
  try {
    const [, payload] = jwt.split('.');
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof exp === 'number' ? exp : 0;
  } catch {
    return 0;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Validate token on mount (and when it changes)
  useEffect(() => {
    const check = async () => {
      try {
        if (!token) return;

        const exp = decodeExp(token);            // seconds since epoch
        const now = Math.floor(Date.now() / 1000);
        if (!exp || exp <= now) {
          // expired → purge it
          localStorage.removeItem('token');
          setToken(null);
          return;
        }

        // (Optional) ping backend to verify
        // If you have /auth/me, you can uncomment:
        // await api.get('/auth/me');
      } catch {
        localStorage.removeItem('token');
        setToken(null);
      }
    };
    check().finally(() => setLoading(false));
  }, [token]);

  // Initial mount sets loading false if no token
  useEffect(() => {
    if (!token) setLoading(false);
  }, []); // run once

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const value = useMemo(
    () => ({ token, login, logout, isAuthenticated: !!token, loading }),
    [token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
