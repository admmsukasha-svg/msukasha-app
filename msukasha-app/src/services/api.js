import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';

/* ── Token Helpers ── */
export const getToken = async () => {
  try { return await AsyncStorage.getItem('ms_token') || ''; }
  catch { return ''; }
};
export const setToken = async (t) => AsyncStorage.setItem('ms_token', t);
export const removeToken = async () => AsyncStorage.removeItem('ms_token');

/* ── User Helpers ── */
export const getUser = async () => {
  try {
    const u = await AsyncStorage.getItem('ms_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};
export const setUser = async (u) => AsyncStorage.setItem('ms_user', JSON.stringify(u));
export const removeUser = async () => AsyncStorage.removeItem('ms_user');

/* ── Auth Headers ── */
const authHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/* ── Base Fetch ── */
const apiFetch = async (path, options = {}) => {
  try {
    const res = await fetch(API_URL + path, options);
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(res.ok ? 'Invalid server response.' : `Server error (${res.status}). Please try again.`);
    }
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (e) {
    if (e.message === 'Network request failed') {
      throw new Error('No internet connection. Please check your network and try again.');
    }
    throw e;
  }
};

/* ============================================================
   AUTH
   ============================================================ */
export const apiRegister = async ({ name, email, password, phone, city, role }) => {
  const data = await apiFetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone, city, role }),
  });
  await setToken(data.token);
  await setUser(data.user);
  return data;
};

export const apiLogin = async (email, password) => {
  const data = await apiFetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  await setToken(data.token);
  await setUser(data.user);
  return data;
};

export const apiLogout = async () => {
  await removeToken();
  await removeUser();
  await AsyncStorage.removeItem('ms_cart');
  await AsyncStorage.removeItem('ms_wishlist');
};

export const apiGetMe = async () => {
  const headers = await authHeaders();
  try {
    const data = await apiFetch('/api/me', { headers });
    await setUser(data.user);
    return data.user;
  } catch {
    await removeToken();
    await removeUser();
    return null;
  }
};

export const apiUpdateProfile = async (profileData) => {
  const headers = await authHeaders();
  const data = await apiFetch('/api/me', {
    method: 'PUT',
    headers,
    body: JSON.stringify(profileData),
  });
  await setUser(data.user);
  return data;
};

/* ============================================================
   PRODUCTS
   ============================================================ */
export const apiGetProducts = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return await apiFetch('/api/products?' + params);
};

export const apiGetProduct = async (id) => {
  return await apiFetch('/api/products/' + id);
};

/* ============================================================
   ADS (C2C)
   ============================================================ */
export const apiGetAds = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return await apiFetch('/api/ads?' + params);
};

export const apiPostAd = async (adData) => {
  return await apiFetch('/api/ads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adData),
  });
};

export const apiGetMyAds = async () => {
  const headers = await authHeaders();
  return await apiFetch('/api/ads/my', { headers });
};

/* ============================================================
   CART
   ============================================================ */
export const getCart = async () => {
  try {
    const c = await AsyncStorage.getItem('ms_cart');
    return c ? JSON.parse(c) : [];
  } catch { return []; }
};

export const saveCart = async (items) => {
  await AsyncStorage.setItem('ms_cart', JSON.stringify(items));
};

export const syncCartToDB = async () => {
  const token = await getToken();
  if (!token) return;
  const items = await getCart();
  try {
    const headers = await authHeaders();
    await apiFetch('/api/cart/sync', {
      method: 'POST',
      headers,
      body: JSON.stringify({ items }),
    });
  } catch (e) { console.warn('Cart sync:', e.message); }
};

export const syncCartFromDB = async (uid) => {
  const token = await getToken();
  if (!token) return;
  try {
    const headers = await authHeaders();
    const data = await apiFetch('/api/cart/' + uid, { headers });
    await saveCart(data.items || []);
  } catch (e) { console.warn('Cart load:', e.message); }
};

export const addToCart = async (product) => {
  const cart = await getCart();
  const ex   = cart.find(i => i.id === product.id);
  if (ex) ex.qty = (ex.qty || 1) + 1;
  else cart.push({ ...product, qty: 1 });
  await saveCart(cart);
  await syncCartToDB();
  return cart;
};

export const removeFromCart = async (id) => {
  const cart = (await getCart()).filter(i => i.id !== id);
  await saveCart(cart);
  await syncCartToDB();
  return cart;
};

/* ============================================================
   WISHLIST
   ============================================================ */
export const getWishlist = async () => {
  try {
    const w = await AsyncStorage.getItem('ms_wishlist');
    return w ? JSON.parse(w) : [];
  } catch { return []; }
};

export const saveWishlist = async (items) => {
  await AsyncStorage.setItem('ms_wishlist', JSON.stringify(items));
};

export const syncWishlistToDB = async () => {
  const token = await getToken();
  if (!token) return;
  const items = await getWishlist();
  try {
    const headers = await authHeaders();
    await apiFetch('/api/wishlist/sync', {
      method: 'POST',
      headers,
      body: JSON.stringify({ items }),
    });
  } catch (e) { console.warn('Wishlist sync:', e.message); }
};

export const syncWishlistFromDB = async (uid) => {
  const token = await getToken();
  if (!token) return;
  try {
    const headers = await authHeaders();
    const data = await apiFetch('/api/wishlist/' + uid, { headers });
    await saveWishlist(data.items || []);
  } catch (e) { console.warn('Wishlist load:', e.message); }
};

export const addToWishlist = async (product) => {
  const list = await getWishlist();
  if (!list.find(i => i.id === product.id)) {
    list.push(product);
    await saveWishlist(list);
    await syncWishlistToDB();
  }
  return list;
};

export const removeFromWishlist = async (id) => {
  const list = (await getWishlist()).filter(i => i.id !== id);
  await saveWishlist(list);
  await syncWishlistToDB();
  return list;
};

/* ============================================================
   ORDERS
   ============================================================ */
export const apiPlaceOrder = async (orderData) => {
  const headers = await authHeaders();
  return await apiFetch('/api/orders', {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });
};

export const apiGetMyOrders = async () => {
  const headers = await authHeaders();
  return await apiFetch('/api/orders/my', { headers });
};

/* ============================================================
   CONTACT / FORMS
   ============================================================ */
export const apiSendContact = async (data) => {
  return await apiFetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const apiSubmitJobApp = async (data) => {
  return await apiFetch('/api/job-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const apiSubmitVerification = async (data) => {
  return await apiFetch('/api/verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const apiBookCall = async (data) => {
  return await apiFetch('/api/book-call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};
