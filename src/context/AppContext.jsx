import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Active Portal: 'farmer' | 'mandi' | 'admin'
  const [activePortal, setActivePortal] = useState('farmer');

  // Auth States
  const [farmerUser, setFarmerUser] = useState(() => {
    const saved = localStorage.getItem('agri_farmer');
    return saved ? JSON.parse(saved) : null;
  });

  const [mandiUser, setMandiUser] = useState(() => {
    const saved = localStorage.getItem('agri_mandi');
    return saved ? JSON.parse(saved) : null;
  });

  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('agri_admin');
    return saved ? JSON.parse(saved) : null;
  });

  // Language state for Farmer Portal: 'EN' | 'TE' | 'HI'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('agri_lang') || 'EN';
  });

  // Translation helper function
  const t = (key) => {
    const langDict = translations[language] || translations.EN;
    return langDict[key] || translations.EN[key] || key;
  };

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('agri_lang', langCode);
  };

  // Real-time synchronization state
  const [realtimeNotification, setRealtimeNotification] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;
    let isComponentMounted = true;

    const connectWebSocket = () => {
      if (!isComponentMounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:5000/ws`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (!isComponentMounted) {
          ws.close();
          return;
        }
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        if (!isComponentMounted) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.event && payload.event !== 'CONNECTED') {
            setRealtimeNotification(payload);
            triggerRefresh(); // Trigger re-fetching live lists in active views

            // Auto dismiss notification banner after 5 seconds
            setTimeout(() => {
              if (isComponentMounted) {
                setRealtimeNotification(null);
              }
            }, 5000);
          }
        } catch (e) {
          console.error("WebSocket message parse error:", e);
        }
      };

      ws.onclose = () => {
        if (!isComponentMounted) return;
        setWsConnected(false);
        // Try reconnect in 3s
        reconnectTimer = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        // Ignored
      };
    };

    connectWebSocket();

    return () => {
      isComponentMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => {
            ws.close();
          };
        }
      }
    };
  }, []);

  // Auth Handlers
  const loginFarmer = (farmerObj) => {
    setFarmerUser(farmerObj);
    localStorage.setItem('agri_farmer', JSON.stringify(farmerObj));
    const savedLang = localStorage.getItem('agri_lang');
    if (!savedLang && farmerObj.language) {
      changeLanguage(farmerObj.language);
    }
  };

  const logoutFarmer = () => {
    setFarmerUser(null);
    localStorage.removeItem('agri_farmer');
  };

  const loginMandi = (mandiObj) => {
    setMandiUser(mandiObj);
    localStorage.setItem('agri_mandi', JSON.stringify(mandiObj));
  };

  const logoutMandi = () => {
    setMandiUser(null);
    localStorage.removeItem('agri_mandi');
  };

  const loginAdmin = (adminObj) => {
    setAdminUser(adminObj);
    localStorage.setItem('agri_admin', JSON.stringify(adminObj));
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('agri_admin');
  };

  return (
    <AppContext.Provider value={{
      activePortal,
      setActivePortal,
      farmerUser,
      mandiUser,
      adminUser,
      loginFarmer,
      logoutFarmer,
      loginMandi,
      logoutMandi,
      loginAdmin,
      logoutAdmin,
      language,
      changeLanguage,
      t,
      wsConnected,
      realtimeNotification,
      refreshTrigger,
      triggerRefresh
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
