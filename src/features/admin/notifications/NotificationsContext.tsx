import React, { createContext, useContext } from 'react';
import { useNotifications } from './useNotifications';

type Value = ReturnType<typeof useNotifications>;

const Ctx = createContext<Value | null>(null);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useNotifications();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAdminNotifications = (): Value => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAdminNotifications must be used inside NotificationsProvider');
  return v;
};
