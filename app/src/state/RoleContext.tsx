import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';
import { Role } from '../api/types';

interface RoleContextValue {
  role: Role;
  ready: boolean;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('customer');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.getSession()
      .then((s) => setRoleState(s.role))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    api.setRole(next).catch(() => {});
  }, []);

  return <RoleContext.Provider value={{ role, ready, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
