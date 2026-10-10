import * as SecureStore from "expo-secure-store";

const BASE = (process.env.EXPO_PUBLIC_API_URL || "https://api.msukasha.com").replace(/\/$/, "") + "/api";
let token = null;

export async function loadToken() {
  token = await SecureStore.getItemAsync("token");
  return token;
}
export async function setToken(t) {
  token = t;
  if (t) await SecureStore.setItemAsync("token", t);
  else await SecureStore.deleteItemAsync("token");
}

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Network error. Check your internet connection.");
  }
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const e = new Error(data?.details?.[0]?.message || data?.error || `Request failed (${res.status})`);
    e.status = res.status;
    throw e;
  }
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b || {}),
  put: (p, b) => request("PUT", p, b),
  patch: (p, b) => request("PATCH", p, b),
  del: (p) => request("DELETE", p),
};
