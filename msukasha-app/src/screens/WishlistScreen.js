import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet as WS, FlatList, TouchableOpacity,
  Image, Alert, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as WC, RADIUS as WR, SHADOW as WSH } from '../constants';
import {
  getWishlist, removeFromWishlist, addToCart,
  syncWishlistFromDB, getUser
} from '../services/api';

export default function WishlistScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [list,       setList]      = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [user,       setUser]      = useState(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const u = await getUser();
    setUser(u);
    if (u?.uid) await syncWishlistFromDB(u.uid);
    setList(await getWishlist());
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await init();
    setRefreshing(false);
  }, []);

  const handleRemove = async (id) => {
    const updated = await removeFromWishlist(id);
    setList(updated);
    Alert.alert('', 'Removed from wishlist.');
  };

  const handleMoveToCart = async (item) => {
    if (!user) { navigation.navigate('Login'); return; }
    await addToCart(item);
    await removeFromWishlist(item.id);
    setList(await getWishlist());
    Alert.alert('Added to Cart', `${item.name} moved to cart.`);
  };

  const handleClearAll = () => {
    Alert.alert('Clear Wishlist', 'Remove all saved items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive',
        onPress: async () => {
          const { saveWishlist, syncWishlistToDB } = await import('../services/api');
          await saveWishlist([]);
          await syncWishlistToDB();
          setList([]);
        }
      },
    ]);
  };

  if (!user) {
    return (
      <View style={[ws.container, ws.centered, { paddingTop: insets.top }]}>
        <View style={ws.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={WC.dark} />
          </TouchableOpacity>
          <Text style={ws.headerTitle}>My Wishlist</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={ws.guestWrap}>
          <Ionicons name="heart-outline" size={64} color={WC.border} />
          <Text style={ws.guestTitle}>Sign in to view your Wishlist</Text>
          <Text style={ws.guestSub}>Your wishlist is saved to your account — access it from any device.</Text>
          <TouchableOpacity style={ws.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={ws.loginBtnTxt}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={ws.card}>
      <TouchableOpacity
        style={ws.cardImg}
        onPress={() => navigation.navigate('ProductDetail', { id: item.id, type: item.type })}
      >
        <Image
          source={{ uri: item.img || 'https://via.placeholder.com/120' }}
          style={ws.cardImage}
          resizeMode="cover"
        />
        <View style={[ws.badge, item.type === 'b2b' ? ws.badgeB2B : ws.badgeC2C]}>
          <Text style={ws.badgeTxt}>{item.type === 'b2b' ? 'B2B' : 'USED'}</Text>
        </View>
      </TouchableOpacity>
      <View style={ws.cardInfo}>
        <Text style={ws.cardName} numberOfLines={2}>{item.name}</Text>
        <Text style={ws.cardPrice}>
          {item.type === 'b2b'
            ? `$${Number(item.price).toFixed(2)}`
            : `Rs. ${Number(item.price).toLocaleString()}`}
        </Text>
        <View style={ws.cardBtns}>
          <TouchableOpacity style={ws.cartBtn} onPress={() => handleMoveToCart(item)}>
            <Ionicons name="cart-outline" size={14} color="#fff" />
            <Text style={ws.cartBtnTxt}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ws.removeBtn} onPress={() => handleRemove(item.id)}>
            <Ionicons name="heart-dislike-outline" size={16} color={WC.red} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[ws.container, { paddingTop: insets.top }]}>
      <View style={ws.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={WC.dark} />
        </TouchableOpacity>
        <Text style={ws.headerTitle}>My Wishlist {list.length > 0 ? `(${list.length})` : ''}</Text>
        {list.length > 0 ? (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={{ color: WC.red, fontSize: 13, fontWeight: '700' }}>Clear All</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 60 }} />}
      </View>

      {list.length === 0 ? (
        <View style={ws.emptyWrap}>
          <Ionicons name="heart-outline" size={72} color={WC.border} />
          <Text style={ws.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={ws.emptySub}>Save products you love by tapping the heart icon on any listing.</Text>
          <TouchableOpacity style={ws.shopBtn} onPress={() => navigation.navigate('Shop')}>
            <Ionicons name="storefront-outline" size={16} color="#fff" />
            <Text style={ws.shopBtnTxt}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={list}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={WC.orange} />}
          />
          {/* Move all to cart */}
          <View style={[ws.bottomBar, { paddingBottom: 16 }]}>
            <TouchableOpacity
              style={ws.moveAllBtn}
              onPress={async () => {
                for (const item of list) await addToCart(item);
                const { saveWishlist, syncWishlistToDB } = await import('../services/api');
                await saveWishlist([]);
                await syncWishlistToDB();
                setList([]);
                Alert.alert('Done!', `${list.length} item(s) moved to cart.`);
              }}
            >
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={ws.moveAllBtnTxt}>Move All to Cart</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const ws = WS.create({
  container:  { flex: 1, backgroundColor: WC.bodyBg },
  centered:   { flex: 1 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: WC.border },
  headerTitle:{ fontSize: 18, fontWeight: '800', color: WC.dark },
  guestWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  guestTitle: { fontSize: 20, fontWeight: '800', color: WC.dark, marginTop: 16, marginBottom: 8 },
  guestSub:   { fontSize: 14, color: WC.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  loginBtn:   { backgroundColor: WC.orange, paddingHorizontal: 32, paddingVertical: 13, borderRadius: WR.md },
  loginBtnTxt:{ color: '#fff', fontSize: 15, fontWeight: '800' },
  emptyWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: WC.dark, marginTop: 16, marginBottom: 8 },
  emptySub:   { fontSize: 14, color: WC.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  shopBtn:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: WC.orange, paddingHorizontal: 24, paddingVertical: 13, borderRadius: WR.md },
  shopBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  card:       { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: WR.md, overflow: 'hidden', borderWidth: 1, borderColor: WC.border, ...WSH.sm },
  cardImg:    { width: 110, height: 110, position: 'relative' },
  cardImage:  { width: '100%', height: '100%' },
  badge:      { position: 'absolute', top: 7, left: 7, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  badgeB2B:   { backgroundColor: WC.orange },
  badgeC2C:   { backgroundColor: '#0099cc' },
  badgeTxt:   { color: '#fff', fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  cardInfo:   { flex: 1, padding: 12 },
  cardName:   { fontSize: 13, fontWeight: '700', color: WC.dark, lineHeight: 18, marginBottom: 5 },
  cardPrice:  { fontSize: 16, fontWeight: '900', color: WC.orange, marginBottom: 10 },
  cardBtns:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cartBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: WC.orange, paddingVertical: 8, borderRadius: WR.sm },
  cartBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  removeBtn:  { width: 36, height: 36, borderRadius: WR.sm, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  bottomBar:  { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: WC.border },
  moveAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: WC.orange, paddingVertical: 14, borderRadius: WR.md },
  moveAllBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
