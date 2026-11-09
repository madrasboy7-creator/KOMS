import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentMaster, setCurrentMaster] = useState(null);
  const [allMasters, setAllMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadMasterProfile = async () => {
    try {
      const mastersRes = await api.getMasters();
      setAllMasters(mastersRes.masters || []);

      const savedMasterId = localStorage.getItem('koms_master_id') || '1';
      // Switch or load
      const switchRes = await api.switchMaster(savedMasterId);
      if (switchRes && switchRes.master) {
        localStorage.setItem('koms_token', switchRes.token);
        localStorage.setItem('koms_master_id', switchRes.master.id);
        setCurrentMaster(switchRes.master);
      }
    } catch (err) {
      console.error('Failed to initialize master profile:', err);
      // Fallback
      setCurrentMaster({
        id: 1,
        name: 'Sensei Rubeshwaren',
        email: 'rubeshwaren@koms.dojo',
        dojo_name: 'Ranga Nagar'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterProfile();
  }, []);

  const switchMasterAccount = async (targetMasterId) => {
    try {
      setLoading(true);
      const res = await api.switchMaster(targetMasterId);
      localStorage.setItem('koms_token', res.token);
      localStorage.setItem('koms_master_id', res.master.id);
      setCurrentMaster(res.master);
      addToast(`Switched active master to ${res.master.name}`, 'info');
    } catch (err) {
      addToast('Failed to switch master: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentMaster,
      allMasters,
      loading,
      switchMasterAccount,
      addToast,
      removeToast,
      toasts
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

