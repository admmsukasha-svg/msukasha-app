import React from 'react';
import { View, Text, StyleSheet as OS, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as OC, RADIUS as OR } from '../constants';

export default function OrderSuccessScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { orderId } = route.params || {};

  return (
    <LinearGradient colors={['#1a2332', '#2d4a6e']} style={[oStyles.container, { paddingTop: insets.top }]}>
      <View style={oStyles.content}>
        <View style={oStyles.iconWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
        </View>
        <Text style={oStyles.title}>Order Placed Successfully!</Text>
        <Text style={oStyles.sub}>Your order has been placed and is being processed.</Text>
        {orderId && (
          <View style={oStyles.orderIdBox}>
            <Text style={oStyles.orderIdLabel}>Order ID</Text>
            <Text style={oStyles.orderId}>{orderId}</Text>
          </View>
        )}
        <View style={oStyles.steps}>
          {[
            { icon:'checkmark-circle', label:'Order Placed',  done: true },
            { icon:'cube-outline',     label:'Processing',    done: false },
            { icon:'car-outline',      label:'In Transit',    done: false },
            { icon:'home-outline',     label:'Delivered',     done: false },
          ].map((s, i) => (
            <View key={i} style={oStyles.step}>
              <Ionicons name={s.icon} size={22} color={s.done ? '#22c55e' : 'rgba(255,255,255,0.3)'} />
              <Text style={[oStyles.stepTxt, !s.done && { opacity: 0.4 }]}>{s.label}</Text>
            </View>
          ))}
        </View>
        <View style={oStyles.btns}>
          <TouchableOpacity
            style={oStyles.trackBtn}
            onPress={() => navigation.navigate('TrackOrder', { orderId })}
          >
            <Ionicons name="location-outline" size={16} color={OC.dark} />
            <Text style={oStyles.trackBtnTxt}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={oStyles.homeBtn}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Ionicons name="home-outline" size={16} color="#fff" />
            <Text style={oStyles.homeBtnTxt}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const oStyles = OS.create({
  container: { flex: 1 },
  content:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrap:  { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(34,197,94,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title:     { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 10 },
  sub:       { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  orderIdBox: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: OR.md, padding: 16, alignItems: 'center', marginBottom: 28, width: '100%' },
  orderIdLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  orderId:   { fontSize: 20, fontWeight: '900', color: OC.orange, letterSpacing: 1 },
  steps:     { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 36 },
  step:      { alignItems: 'center', gap: 6 },
  stepTxt:   { fontSize: 11, color: '#fff', fontWeight: '600' },
  btns:      { flexDirection: 'row', gap: 12, width: '100%' },
  trackBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#fff', paddingVertical: 13, borderRadius: OR.md },
  trackBtnTxt: { fontSize: 14, fontWeight: '700', color: OC.dark },
  homeBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: OC.orange, paddingVertical: 13, borderRadius: OR.md },
  homeBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
