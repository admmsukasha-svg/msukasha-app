import React, { useState } from 'react';
import {
  View, Text, StyleSheet as CS, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as C, RADIUS as R, SHADOW as S } from '../constants';
import { apiPlaceOrder, getUser, saveCart, syncCartToDB } from '../services/api';

export default function CheckoutScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { cart = [], subtotal = 0, product, qty = 1 } = route.params || {};

  const orderItems = cart.length > 0 ? cart : (product ? [{ ...product, qty }] : []);
  const orderTotal = cart.length > 0 ? subtotal : (product ? product.price * qty : 0);

  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [address, setAddress] = useState('');
  const [city,    setCity]    = useState('');
  const [payment, setPayment] = useState('cod');
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim() || !city) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const user = await getUser();
      const data = await apiPlaceOrder({
        buyerName:  name,
        buyerPhone: phone,
        address:    { street: address, city },
        items:      orderItems,
        total:      orderTotal,
        payment,
        buyerId:    user?._id || user?.uid || 'guest',
      });
      await saveCart([]);
      await syncCartToDB();
      navigation.replace('OrderSuccess', { orderId: data.orderId });
    } catch(e) {
      Alert.alert('Order Failed', e.message || 'Please try again.');
    }
    setLoading(false);
  };

  const s = csStyles;
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.dark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Secure Checkout</Text>
        <Ionicons name="lock-closed-outline" size={18} color={C.orange} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
        {/* Delivery Address */}
        <View style={s.card}>
          <Text style={s.cardTitle}><Ionicons name="location-outline" size={16} color={C.orange} /> Delivery Address</Text>
          <View style={s.field}>
            <Text style={s.label}>Full Name *</Text>
            <TextInput style={s.input} placeholder="Your full name" placeholderTextColor={C.muted} value={name} onChangeText={setName} />
          </View>
          <View style={s.field}>
            <Text style={s.label}>Phone *</Text>
            <TextInput style={s.input} placeholder="+92 300 0000000" placeholderTextColor={C.muted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <View style={s.field}>
            <Text style={s.label}>Street Address *</Text>
            <TextInput style={s.input} placeholder="House/Plot no., Street, Area" placeholderTextColor={C.muted} value={address} onChangeText={setAddress} />
          </View>
          <View style={s.field}>
            <Text style={s.label}>City *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar'].map(c => (
                <TouchableOpacity
                  key={c}
                  style={[s.cityPill, city === c && s.cityPillActive]}
                  onPress={() => setCity(c)}
                >
                  <Text style={[s.cityPillTxt, city === c && s.cityPillTxtActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Payment Method */}
        <View style={s.card}>
          <Text style={s.cardTitle}><Ionicons name="card-outline" size={16} color={C.orange} /> Payment Method</Text>
          {[
            { v:'cod',       icon:'cash-outline',         label:'Cash on Delivery',     sub:'Pay when you receive your order' },
            { v:'bank',      icon:'business-outline',      label:'Bank Transfer',         sub:'Transfer to MSukasha escrow account' },
            { v:'easypaisa', icon:'phone-portrait-outline', label:'EasyPaisa / JazzCash', sub:'Pay via mobile wallet' },
          ].map(pm => (
            <TouchableOpacity
              key={pm.v}
              style={[s.payOption, payment === pm.v && s.payOptionActive]}
              onPress={() => setPayment(pm.v)}
            >
              <View style={[s.payRadio, payment === pm.v && s.payRadioActive]}>
                {payment === pm.v && <View style={s.payRadioDot} />}
              </View>
              <Ionicons name={pm.icon} size={20} color={payment === pm.v ? C.orange : C.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[s.payLabel, payment === pm.v && { color: C.orange }]}>{pm.label}</Text>
                <Text style={s.paySub}>{pm.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Order Summary</Text>
          {orderItems.map((item, i) => (
            <View key={i} style={s.summaryRow}>
              <Text style={s.summaryItem} numberOfLines={1}>{item.name || item.title} × {item.qty || 1}</Text>
              <Text style={s.summaryPrice}>Rs. {(Number(item.price) * (item.qty||1)).toLocaleString()}</Text>
            </View>
          ))}
          <View style={s.divider} />
          <View style={s.summaryRow}>
            <Text style={s.summaryItem}>Shipping</Text>
            <Text style={[s.summaryPrice, { color: C.green }]}>Free</Text>
          </View>
          <View style={[s.summaryRow, { marginTop: 6 }]}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalVal}>Rs. {Number(orderTotal).toLocaleString()}</Text>
          </View>
        </View>

        <View style={s.assurance}>
          <Ionicons name="shield-checkmark-outline" size={18} color={C.orange} />
          <Text style={s.assuranceTxt}>Protected by MSukasha Trade Assurance. Your money is safe until you confirm delivery.</Text>
        </View>

        <TouchableOpacity
          style={[s.placeBtn, loading && { opacity: 0.7 }]}
          onPress={handleOrder}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={s.placeBtnTxt}>Place Order Securely</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 16 }} />
      </ScrollView>
    </View>
  );
}

const csStyles = CS.create({
  container:   { flex: 1, backgroundColor: C.bodyBg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.dark },
  card:        { backgroundColor: '#fff', borderRadius: R.md, padding: 16, borderWidth: 1, borderColor: C.border },
  cardTitle:   { fontSize: 15, fontWeight: '800', color: C.dark, marginBottom: 14 },
  field:       { marginBottom: 14 },
  label:       { fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 },
  input:       { backgroundColor: C.bodyBg, borderRadius: R.sm, borderWidth: 1.5, borderColor: C.border, paddingVertical: 11, paddingHorizontal: 14, fontSize: 14, color: C.text },
  cityPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: '#fff' },
  cityPillActive: { backgroundColor: C.orange, borderColor: C.orange },
  cityPillTxt: { fontSize: 12, fontWeight: '600', color: C.muted },
  cityPillTxtActive: { color: '#fff' },
  payOption:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.md, borderWidth: 1.5, borderColor: C.border, marginBottom: 10 },
  payOptionActive: { borderColor: C.orange, backgroundColor: C.orangeLight },
  payRadio:    { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  payRadioActive: { borderColor: C.orange },
  payRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.orange },
  payLabel:    { fontSize: 14, fontWeight: '700', color: C.dark },
  paySub:      { fontSize: 12, color: C.muted, marginTop: 2 },
  summaryRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryItem: { flex: 1, fontSize: 13, color: C.muted, marginRight: 8 },
  summaryPrice: { fontSize: 13, fontWeight: '700', color: C.dark },
  divider:     { height: 1, backgroundColor: C.border, marginVertical: 10 },
  totalLabel:  { fontSize: 16, fontWeight: '800', color: C.dark },
  totalVal:    { fontSize: 18, fontWeight: '900', color: C.orange },
  assurance:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: C.orangeLight, borderRadius: R.md, padding: 12 },
  assuranceTxt: { flex: 1, fontSize: 12, color: C.text, lineHeight: 18 },
  placeBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.orange, paddingVertical: 15, borderRadius: R.md },
  placeBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
