import { createContext, useContext, useState, useEffect } from 'react';
import { authService, carOwnerService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('car_rental_current_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setLoading(false);
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const login = async (credentials, role) => {
    try {
      let res;
      if (role === 'CarOwner') {
        res = await authService.loginCarOwner(credentials);
      } else {
        res = await authService.loginCustomer(credentials);
      }
      
      const loggedInUser = res.user || {
        email: credentials.email,
        name: credentials.email.split('@')[0],
        role
      };
      
      setUser(loggedInUser);
      localStorage.setItem('car_rental_current_user', JSON.stringify(loggedInUser));
      showToast(`Welcome back, ${loggedInUser.name}!`);
      setIsAuthModalOpen(false);
      return loggedInUser;
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const register = async (userData, role) => {
    try {
      let res;
      if (role === 'CarOwner') {
        res = await authService.registerCarOwner(userData);
      } else {
        res = await authService.registerCustomer(userData);
      }
      
      const newUser = res.user || { ...userData, role };
      setUser(newUser);
      localStorage.setItem('car_rental_current_user', JSON.stringify(newUser));
      showToast(`Account created successfully as ${role === 'CarOwner' ? 'Car Owner' : 'Customer'}!`);
      setIsAuthModalOpen(false);
      return newUser;
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logout = async () => {
    if (user?.role === 'CarOwner') {
      await carOwnerService.logoutCarOwner();
    }
    setUser(null);
    localStorage.removeItem('car_rental_current_user');
    showToast('Logged out successfully');
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
