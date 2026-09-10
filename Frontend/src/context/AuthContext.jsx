import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('unistay_token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data.data.user);
        } catch (err) {
          console.error('Session check failed:', err);
          localStorage.removeItem('unistay_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('unistay_token', token);
    setUser(userData);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const logout = () => {
    localStorage.removeItem('unistay_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);