import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCitizenToken, setCitizenToken,
  getAdminToken, setAdminToken,
  getCitizenUser, setCitizenUser,
  getAdminUser, setAdminUser,
  api
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [citizenToken, setCitizenTokenState] = useState(getCitizenToken());
  const [citizenUser, setCitizenUserState] = useState(getCitizenUser());

  const [adminToken, setAdminTokenState] = useState(getAdminToken());
  const [adminUser, setAdminUserState] = useState(getAdminUser());

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial verification of stored sessions
    setLoading(false);
  }, []);

  const loginCitizen = (token, user) => {
    setCitizenToken(token);
    setCitizenUser(user);
    setCitizenTokenState(token);
    setCitizenUserState(user);
  };

  const logoutCitizen = async () => {
    try {
      await api.citizenLogout();
    } catch (e) {
      // ignore
    }
    setCitizenToken(null);
    setCitizenUser(null);
    setCitizenTokenState(null);
    setCitizenUserState(null);
  };

  const loginAdmin = (token, admin) => {
    setAdminToken(token);
    setAdminUser(admin);
    setAdminTokenState(token);
    setAdminUserState(admin);
  };

  const logoutAdmin = async () => {
    try {
      await api.adminLogout();
    } catch (e) {
      // ignore
    }
    setAdminToken(null);
    setAdminUser(null);
    setAdminTokenState(null);
    setAdminUserState(null);
  };

  const updateCitizenData = (user) => {
    setCitizenUser(user);
    setCitizenUserState(user);
  };

  const updateAdminData = (admin) => {
    setAdminUser(admin);
    setAdminUserState(admin);
  };

  const value = {
    citizenUser,
    citizenToken,
    isCitizenAuthenticated: !!citizenToken,
    loginCitizen,
    logoutCitizen,
    updateCitizenData,

    adminUser,
    adminToken,
    isAdminAuthenticated: !!adminToken,
    loginAdmin,
    logoutAdmin,
    updateAdminData,

    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
