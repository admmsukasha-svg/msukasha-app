import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Alert, RefreshControl, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOW } from '../constants';
import {
  getCart, saveCart, removeFromCart,
  syncCartToDB, getUser
} from '../services/api';

const { width } = Dimensions.get('window');

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [cart,       setCart]      = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [user,       setUser]      = useState(null);

  useEffect(() => {
    loadCart();
    loadUser();
  }, []);

  const loadUser = async () => { setUser(await getUser()); };
  const loadCart = async () => { setCart(await getCart()); };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  }, []);

  const changeQty = async (id, delta) => {
    const updated = cart.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, (i.qty || 1) + delta);
        return { ...i, qty: newQty };
      }
      return i;
    });
    setCart(updated);
    await saveCart(updated);
    await syncCartToDB();
  };

  const handleRemove = async (id) => {
    Alert.alert('Remove Item', 'Remove this item from cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          const updated = await removeFromCart(id);
          setCart(updated);
        }
      },
    ]);
  };

  const clearCart = async () => {
    Alert.alert('Clear Cart', 'Remove all items from cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive',
        onPress: async () => {
          await saveCart([]);
          await syncCartToDB();
          setCart([]);
        }
      },
    ]);
  };

  const subtotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (i.qty || 1), 0);

  const handleCheckout = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to proceed to checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login', { redirectTo: 'Checkout' }) },
        ]
      );
      return;
    }
    navigation.navigate('Checkout', { cart, subtotal });
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image
        source={{ uri: item.img || 'https://via.placeholder.com/80' }}
        style={styles.itemImg}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          {item.currency === '$' || item.type === 'b2b'
            ? `$${Number(item.price).toFixed(2)}${item.unit || '/pc'}`
            : `Rs. ${Number(item.price).toLocaleString()}`}
        </Text>
        <View style={styles.itemBottom}>
          <View style={styles.qtyControl}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, -1)}>
              <Ionicons name="remove" size={16} color={COLORS.dark} />
            </TouchableOpacity>
            <Text style={styles.qtyVal}>{item.qty || 1}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, 1)}>
              <Ionicons name="add" size={16} color={COLORS.dark} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={18} color={COLORS.red} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={72} color={COLORS.border} />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySub}>Browse our marketplace and add products to your cart.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Shop')}>
            <Ionicons name="storefront-outline" size={16} color="#fff" />
            <Text style={styles.shopBtnTxt}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart ({cart.length})</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearTxt}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />}
        ListFooterComponent={() => (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({cart.length} items)</Text>
              <Text style={styles.summaryVal}>Rs. {subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={[styles.summaryVal, { color: COLORS.green }]}>Free</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Trade Assurance</Text>
              <Text style={[styles.summaryVal, { color: COLORS.green }]}>Included</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>Rs. {subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.trustRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.orange} />
              <Text style={styles.trustTxt}>Protected by MSukasha Trade Assurance</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.continueTxt}
          onPress={() => navigation.navigate('Shop')}
        >
          <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>← Continue Shopping</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Ionicons name="lock-closed-outline" size={16} color="#fff" />
          <Text style={styles.checkoutBtnTxt}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bodyBg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  clearTxt:     { fontSize: 13, color: COLORS.red, fontWeight: '700' },
  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle:   { fontSize: 20, fontWeight: '800', color: COLORS.dark, marginTop: 16, marginBottom: 8 },
  emptySub:     { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  shopBtn:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.orange, paddingHorizontal: 24, paddingVertical: 13, borderRadius: RADIUS.md },
  shopBtnTxt:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  item:         { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 14, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  itemImg:      { width: 80, height: 80, borderRadius: RADIUS.sm },
  itemInfo:     { flex: 1 },
  itemName:     { fontSize: 14, fontWeight: '700', color: COLORS.dark, marginBottom: 5, lineHeight: 19 },
  itemPrice:    { fontSize: 16, fontWeight: '900', color: COLORS.orange, marginBottom: 8 },
  itemBottom:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyControl:   { flexDirection: 'row', alignItems: 'center', gap: 0, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, overflow: 'hidden' },
  qtyBtn:       { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bodyBg },
  qtyVal:       { width: 36, textAlign: 'center', fontSize: 15, fontWeight: '800', color: COLORS.dark },
  removeBtn:    { padding: 6 },
  summaryCard:  { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 18, marginTop: 8, borderWidth: 1, borderColor: COLORS.border },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark, marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: COLORS.muted },
  summaryVal:   { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  totalRow:     { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 4 },
  totalLabel:   { fontSize: 16, fontWeight: '800', color: COLORS.dark },
  totalVal:     { fontSize: 18, fontWeight: '900', color: COLORS.orange },
  trustRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: COLORS.orangeLight, padding: 10, borderRadius: RADIUS.sm },
  trustTxt:     { fontSize: 12, color: COLORS.orange, fontWeight: '600' },
  bottomBar:    { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border },
  continueTxt:  { padding: 4 },
  checkoutBtn:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.orange, paddingHorizontal: 28, paddingVertical: 13, borderRadius: RADIUS.md },
  checkoutBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
