import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, loginUser, logoutUser, registerUser } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetchCurrentUser();
        setUser(response.user);
      } catch (_error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      async register(payload) {
        const response = await registerUser(payload);
        setUser(response.user);
        return response.user;
      },
      async login(payload) {
        const response = await loginUser(payload);
        setUser(response.user);
        return response.user;
      },
      async logout() {
        await logoutUser();
        setUser(null);
      },
      setUser,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
