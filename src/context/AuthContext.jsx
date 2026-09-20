import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('snapdent_token');
    const cachedUser = localStorage.getItem('snapdent_user');
    if (token) {
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {}
      }
      getProfile()
        .then((data) => {
          setUser(data.user);
          localStorage.setItem('snapdent_user', JSON.stringify(data.user));
        })
        .catch((err) => {
          if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
            localStorage.removeItem('snapdent_token');
            localStorage.removeItem('snapdent_user');
            localStorage.removeItem('snapdent_admin');
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('snapdent_token', token);
    localStorage.setItem('snapdent_user', JSON.stringify(userData));
    if (userData.role === 'admin') {
      localStorage.setItem('snapdent_admin', 'true');
    } else {
      localStorage.removeItem('snapdent_admin');
    }
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
  const isVendor = user?.role === 'vendor';

  const defaultVendorPerms = ['product:create', 'product:view', 'product:update'];

  const hasPermission = (perm) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const perms = user.permissions?.length > 0 ? user.permissions : (user.role === 'vendor' ? defaultVendorPerms : []);
    return perms.includes(perm);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, isAdmin, isVendor, hasPermission, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
