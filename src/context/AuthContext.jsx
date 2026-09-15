import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('snapdent_token');
    if (token) {
      getProfile()
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('snapdent_token');
          localStorage.removeItem('snapdent_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('snapdent_token', token);
    localStorage.setItem('snapdent_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('snapdent_token');
    localStorage.removeItem('snapdent_user');
    localStorage.removeItem('snapdent_admin');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, isAdmin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
