import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AppNotification } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  availableUsers: User[];
  notifications: AppNotification[];
  unreadNotifsCount: number;
  loading: boolean;
  switchUser: (userId: string) => Promise<void>;
  login: (email: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial users
  useEffect(() => {
    const init = async () => {
      try {
        const users = await api.getUsers();
        setAvailableUsers(users);

        // Check localStorage for saved user id or select first available user
        const savedId = localStorage.getItem('findit_user_id');
        const active = savedId ? users.find(u => u.id === savedId) : (users.length > 0 ? users[0] : null);
        setCurrentUser(active || null);

        if (active) {
          const notifs = await api.getNotifications(active.id);
          setNotifications(notifs.notifications || []);
          setUnreadNotifsCount(notifs.unreadCount || 0);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const refreshUserData = async () => {
    if (!currentUser) return;
    try {
      const users = await api.getUsers();
      setAvailableUsers(users);
      const updated = users.find(u => u.id === currentUser.id);
      if (updated) setCurrentUser(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await api.getNotifications(currentUser.id);
      setNotifications(res.notifications || []);
      setUnreadNotifsCount(res.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const switchUser = async (userId: string) => {
    const target = availableUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('findit_user_id', target.id);
      const notifs = await api.getNotifications(target.id);
      setNotifications(notifs.notifications || []);
      setUnreadNotifsCount(notifs.unreadCount || 0);
    }
  };

  const login = async (email: string) => {
    const res = await api.login(email);
    setCurrentUser(res.user);
    localStorage.setItem('findit_user_id', res.user.id);
    await refreshNotifications();
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    setCurrentUser(res.user);
    localStorage.setItem('findit_user_id', res.user.id);
    const users = await api.getUsers();
    setAvailableUsers(users);
  };

  const logout = () => {
    // For demo convenience, fallback to student or clear
    localStorage.removeItem('findit_user_id');
    setCurrentUser(null);
  };

  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadNotifsCount(c => Math.max(0, c - 1));
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser) return;
    await api.markAllNotificationsRead(currentUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadNotifsCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers,
        notifications,
        unreadNotifsCount,
        loading,
        switchUser,
        login,
        register,
        logout,
        refreshUserData,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
