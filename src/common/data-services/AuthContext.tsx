import React, { createContext, useContext, useMemo, useState } from "react";

type AuthState = {
  idToken: string | null;
  setIdToken: (t: string | null) => void;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [idToken, setIdToken] = useState<string | null>(null);

  const logout = () => {
    setIdToken(null);
    // Optional: tell GIS not to auto-select the last account
    // @ts-expect-error global from GIS script (not required when using @react-oauth/google)
    window.google?.accounts?.id?.disableAutoSelect?.();
  };

  const value = useMemo(() => ({ idToken, setIdToken, logout }), [idToken]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");

  return v;
};
