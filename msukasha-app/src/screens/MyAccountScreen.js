import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, RefreshControl, TextInput, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOW } from '../constants';
import {
  getUser, apiLogout, apiGetMe, apiUpdateProfile,
  apiGetMyOrders, apiGetMyAds, getWishlist
} from '../services/api';

export default function MyAccountScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [user,      setUser]      = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [listings,  setListings]  = useState([]);
  const [wishCount, setWishCount] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading,   setLoading]   = useState(false);
  const [refreshing,setRefreshing] = useState(false);
  const [editName,  setEditName]  = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity,  setEditCity]  = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const u = await getUser();
    if (!u) { setLoading(false); return; }
    setUser(u);
    setEditName(u.name || '');
    setEditPhone(u.phone || '');
    setEditCity(u.city || '');

    try {
      const [freshUser, ordersData, adsData, wl] = await Promise.all([
        apiGetMe(),
        apiGetMyOrders(),
        apiGetMyAds(),
        getWishlist(),
      ]);
      if (freshUser) { setUser(freshUser); setEditName(freshUser.name || ''); }
      setOrders(ordersData?.orders || []);
      setListings(adsData?.ads || []);
      setWishCount(wl.length);
    } catch {}
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await apiLogout();
          navigation.replace('Login');
        }
      },
    ]);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await apiUpdateProfile({ name: editName, phone: editPhone, city: editCity });
      setUser(prev => ({ ...prev, name: editName, phone: editPhone, city: editCity }));
      Alert.alert('Success', 'Profile updated successfully!');
    } catch(e) {
      Alert.alert('Error', e.message || 'Update failed.');
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="person-circle-outline" size={72} color={COLORS.border} />
        <Text style={styles.notLoginTitle}>Please Sign In</Text>
        <Text style={styles.notLoginSub}>Login to access your account, orders and wishlist.</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="log-in-outline" size={18} color="#fff" />
          <Text style={styles.loginBtnTxt}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 12 }}>
          <Text style={{ color: COLORS.orange, fontWeight: '700', fontSize: 14 }}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initial = (user.name || 'U').charAt(0).toUpperCase();

  const MENU_ITEMS = [
    { icon: 'th-large',         label: 'Dashboard',    tab: 'dashboard' },
    { icon: 'box',              label: 'My Orders',    tab: 'orders' },
    { icon: 'tag',              label: 'My Listings',  tab: 'listings' },
    { icon: 'user-edit',        label: 'Edit Profile', tab: 'profile' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#1a2332', '#2d4a6e']} style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleTxt}>{(user.role || 'buyer').charAt(0).toUpperCase() + (user.role||'buyer').slice(1)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Tab Nav */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabNav}>
          {MENU_ITEMS.map(m => (
            <TouchableOpacity
              key={m.tab}
              style={[styles.tabNavItem, activeTab === m.tab && styles.tabNavItemActive]}
              onPress={() => setActiveTab(m.tab)}
            >
              <Text style={[styles.tabNavTxt, activeTab === m.tab && styles.tabNavTxtActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              {[
                { num: orders.length,   label: 'Orders',   icon: 'cube-outline' },
                { num: listings.length, label: 'Listings', icon: 'pricetag-outline' },
                { num: wishCount,       label: 'Wishlist', icon: 'heart-outline' },
              ].map((s, i) => (
                <View key={i} style={styles.statCard}>
                  <Ionicons name={s.icon} size={22} color={COLORS.orange} />
                  <Text style={styles.statNum}>{s.num}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Quick Links */}
            <View style={styles.quickLinks}>
              {[
                { icon:'storefront-outline', label:'Browse Shop',    onPress:() => navigation.navigate('Shop') },
                { icon:'camera-outline',     label:'Post Free Ad',   onPress:() => navigation.navigate('PostAd') },
                { icon:'heart-outline',      label:'My Wishlist',    onPress:() => navigation.navigate('Wishlist') },
                { icon:'chatbubble-outline', label:'Messages',       onPress:() => navigation.navigate('Messages') },
                { icon:'location-outline',   label:'Track Order',    onPress:() => navigation.navigate('TrackOrder') },
                { icon:'shield-outline',     label:'Get Verified',   onPress:() => {} },
              ].map((q, i) => (
                <TouchableOpacity key={i} style={styles.quickLink} onPress={q.onPress}>
                  <View style={styles.quickLinkIcon}>
                    <Ionicons name={q.icon} size={20} color={COLORS.orange} />
                  </View>
                  <Text style={styles.quickLinkTxt}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
              <Text style={styles.infoCardTxt}>Account active — data saved to MSukasha database.</Text>
            </View>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={52} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Shop')}>
                <Text style={styles.emptyBtnTxt}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order, i) => (
              <View key={i} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{order.orderId || order._id?.toString().slice(-8).toUpperCase()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: order.status === 'placed' ? '#dcfce7' : COLORS.orangeLight }]}>
                    <Text style={[styles.statusTxt, { color: order.status === 'placed' ? '#15803d' : COLORS.orange }]}>
                      {order.status || 'Placed'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderMeta}>{new Date(order.createdAt).toLocaleDateString()} • Rs. {Number(order.total).toLocaleString()}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TrackOrder', { orderId: order.orderId })}>
                  <Text style={styles.trackLink}>Track Order →</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <>
            <TouchableOpacity style={styles.postAdBtn} onPress={() => navigation.navigate('PostAd')}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={styles.postAdBtnTxt}>Post New Ad</Text>
            </TouchableOpacity>
            {listings.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="camera-outline" size={52} color={COLORS.border} />
                <Text style={styles.emptyTitle}>No Listings Yet</Text>
              </View>
            ) : (
              listings.map((ad, i) => (
                <View key={i} style={styles.listingCard}>
                  <View>
                    <Text style={styles.listingTitle}>{ad.title}</Text>
                    <Text style={styles.listingMeta}>Rs. {Number(ad.price).toLocaleString()} • {ad.city}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
                    <Text style={[styles.statusTxt, { color: '#15803d' }]}>{ad.status || 'Active'}</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <View style={styles.profileCard}>
            <Text style={styles.profileCardTitle}>Edit Profile</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput style={styles.fieldInput} value={editName} onChangeText={setEditName} placeholder="Your full name" placeholderTextColor={COLORS.muted} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInput style={styles.fieldInput} value={editPhone} onChangeText={setEditPhone} placeholder="+92 300 0000000" placeholderTextColor={COLORS.muted} keyboardType="phone-pad" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email (cannot change)</Text>
              <TextInput style={[styles.fieldInput, { color: COLORS.muted, backgroundColor: '#f5f5f5' }]} value={user.email} editable={false} />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="save-outline" size={16} color="#fff" />
                  <Text style={styles.saveBtnTxt}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bodyBg },
  centered:      { alignItems: 'center', justifyContent: 'center', padding: 32 },
  notLoginTitle: { fontSize: 22, fontWeight: '800', color: COLORS.dark, marginTop: 16, marginBottom: 8 },
  notLoginSub:   { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  loginBtn:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.orange, paddingHorizontal: 32, paddingVertical: 13, borderRadius: RADIUS.md },
  loginBtnTxt:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  header:        { paddingHorizontal: 16, paddingBottom: 0 },
  profileRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 18 },
  avatar:        { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.orange, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:     { fontSize: 24, fontWeight: '900', color: '#fff' },
  userName:      { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
  userEmail:     { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 5 },
  roleBadge:     { backgroundColor: 'rgba(255,102,0,0.25)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 20, alignSelf: 'flex-start' },
  roleTxt:       { fontSize: 10, fontWeight: '700', color: '#ffaa66', textTransform: 'uppercase' },
  logoutBtn:     { padding: 8 },
  tabNav:        { flexDirection: 'row', gap: 4, paddingBottom: 0 },
  tabNavItem:    { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabNavItemActive: { borderBottomColor: COLORS.orange },
  tabNavTxt:     { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  tabNavTxtActive: { color: '#fff', fontWeight: '800' },
  statsRow:      { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard:      { flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  statNum:       { fontSize: 22, fontWeight: '900', color: COLORS.dark },
  statLabel:     { fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  quickLinks:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  quickLink:     { width: '30%', backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 14, alignItems: 'center', gap: 7, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  quickLinkIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.orangeLight, alignItems: 'center', justifyContent: 'center' },
  quickLinkTxt:  { fontSize: 11, fontWeight: '700', color: COLORS.dark, textAlign: 'center' },
  infoCard:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dcfce7', borderRadius: RADIUS.md, padding: 12 },
  infoCardTxt:   { fontSize: 13, color: '#15803d', flex: 1 },
  emptyState:    { alignItems: 'center', paddingVertical: 48 },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: COLORS.muted, marginTop: 12, marginBottom: 16 },
  emptyBtn:      { backgroundColor: COLORS.orange, paddingHorizontal: 24, paddingVertical: 11, borderRadius: RADIUS.md },
  emptyBtnTxt:   { color: '#fff', fontWeight: '700' },
  orderCard:     { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  orderHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId:       { fontSize: 14, fontWeight: '800', color: COLORS.dark },
  orderMeta:     { fontSize: 12, color: COLORS.muted, marginBottom: 8 },
  trackLink:     { fontSize: 13, color: COLORS.orange, fontWeight: '700' },
  statusBadge:   { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusTxt:     { fontSize: 11, fontWeight: '700' },
  postAdBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.orange, padding: 13, borderRadius: RADIUS.md, marginBottom: 14 },
  postAdBtnTxt:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  listingCard:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  listingTitle:  { fontSize: 14, fontWeight: '700', color: COLORS.dark, marginBottom: 3 },
  listingMeta:   { fontSize: 12, color: COLORS.muted },
  profileCard:   { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  profileCardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark, marginBottom: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  field:         { marginBottom: 16 },
  fieldLabel:    { fontSize: 13, fontWeight: '700', color: COLORS.dark, marginBottom: 6 },
  fieldInput:    { backgroundColor: COLORS.bodyBg, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: 11, paddingHorizontal: 14, fontSize: 14, color: COLORS.text },
  saveBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.orange, paddingVertical: 13, borderRadius: RADIUS.md, marginTop: 4 },
  saveBtnTxt:    { color: '#fff', fontSize: 15, fontWeight: '700' },
});
