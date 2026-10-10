import React, { createContext, useContext, useEffect, useState } from "react";
import { api, loadToken, setToken } from "./api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (await loadToken()) setUser((await api.get("/auth/me")).user);
      } catch {
        await setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const finish = async ({ token, user }) => { await setToken(token); setUser(user); };
  const value = {
    user, loading,
    login: async (email, password) => finish(await api.post("/auth/login", { email, password })),
    register: async (form) => finish(await api.post("/auth/register", form)),
    logout: async () => { await setToken(null); setUser(null); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
