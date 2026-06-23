import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOW } from '../constants';

const DEMO_ORDER = {
  id: 'MS-2026-001',
  product: 'Solar Panels 545W × 10',
  date: 'May 10, 2026',
  status: 'In Transit',
  steps: [
    { label: 'Order Placed',  done: true,  icon: 'checkmark-circle' },
    { label: 'Confirmed',     done: true,  icon: 'checkmark-circle' },
    { label: 'Dispatched',    done: true,  icon: 'checkmark-circle' },
    { label: 'In Transit',    done: true,  icon: 'car-outline',   active: true },
    { label: 'Delivered',     done: false, icon: 'home-outline' },
  ],
  lastUpdate: 'Your order is in Karachi Hub, expected delivery May 23, 2026',
};

export default function TrackOrderScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initId = route?.params?.orderId || '';
  const [orderId, setOrderId] = useState(initId || 'MS-2026-001');
  const [order,   setOrder]   = useState(initId ? DEMO_ORDER : null);
  const [searched, setSearched] = useState(!!initId);

  const handleTrack = () => {
    if (!orderId.trim()) return;
    setOrder(DEMO_ORDER);
    setSearched(true);
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Track Order</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Search box */}
        <View style={s.searchCard}>
          <Text style={s.searchLabel}>Enter Order Number</Text>
          <View style={s.searchRow}>
            <TextInput
              style={s.searchInput}
              placeholder="e.g. MS-2026-1234"
              placeholderTextColor={COLORS.muted}
              value={orderId}
              onChangeText={setOrderId}
              onSubmitEditing={handleTrack}
            />
            <TouchableOpacity style={s.trackBtn} onPress={handleTrack}>
              <Ionicons name="search-outline" size={16} color="#fff" />
              <Text style={s.trackBtnTxt}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Result */}
        {searched && order && (
          <View style={s.resultCard}>
            <View style={s.resultHeader}>
              <View>
                <Text style={s.resultId}>Order #{order.id}</Text>
                <Text style={s.resultProduct}>{order.product}</Text>
                <Text style={s.resultDate}>Placed: {order.date}</Text>
              </View>
              <View style={s.statusBadge}>
                <Text style={s.statusTxt}>{order.status}</Text>
              </View>
            </View>

            {/* Progress Steps */}
            <View style={s.stepsWrap}>
              {order.steps.map((step, i) => (
                <View key={i} style={s.stepRow}>
                  <View style={s.stepLeft}>
                    <View style={[
                      s.stepIcon,
                      step.done && s.stepIconDone,
                      step.active && s.stepIconActive,
                    ]}>
                      <Ionicons
                        name={step.done ? 'checkmark' : step.icon}
                        size={14}
                        color={step.done || step.active ? '#fff' : COLORS.muted}
                      />
                    </View>
                    {i < order.steps.length - 1 && (
                      <View style={[s.stepLine, step.done && s.stepLineDone]} />
                    )}
                  </View>
                  <Text style={[
                    s.stepLabel,
                    step.done && s.stepLabelDone,
                    step.active && s.stepLabelActive,
                  ]}>{step.label}</Text>
                </View>
              ))}
            </View>

            {/* Last update */}
            <View style={s.updateBox}>
              <Ionicons name="location-outline" size={16} color={COLORS.orange} />
              <Text style={s.updateTxt}>{order.lastUpdate}</Text>
            </View>
          </View>
        )}

        {searched && !order && (
          <View style={s.notFound}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.border} />
            <Text style={s.notFoundTxt}>Order not found</Text>
            <Text style={s.notFoundSub}>Check your order ID and try again.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex:1, backgroundColor: COLORS.bodyBg },
  header:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: COLORS.border },
  headerTitle:  { fontSize:18, fontWeight:'800', color: COLORS.dark },
  searchCard:   { backgroundColor:'#fff', borderRadius: RADIUS.md, padding:16, borderWidth:1, borderColor: COLORS.border },
  searchLabel:  { fontSize:14, fontWeight:'700', color: COLORS.dark, marginBottom:10 },
  searchRow:    { flexDirection:'row', gap:10 },
  searchInput:  { flex:1, backgroundColor: COLORS.bodyBg, borderRadius: RADIUS.sm, borderWidth:1.5, borderColor: COLORS.border, paddingVertical:11, paddingHorizontal:14, fontSize:14, color: COLORS.text },
  trackBtn:     { flexDirection:'row', alignItems:'center', gap:6, backgroundColor: COLORS.orange, paddingHorizontal:18, paddingVertical:11, borderRadius: RADIUS.sm },
  trackBtnTxt:  { color:'#fff', fontWeight:'700', fontSize:14 },
  resultCard:   { backgroundColor:'#fff', borderRadius: RADIUS.md, padding:18, borderWidth:1, borderColor: COLORS.border },
  resultHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },
  resultId:     { fontSize:16, fontWeight:'900', color: COLORS.dark, marginBottom:4 },
  resultProduct:{ fontSize:13, color: COLORS.muted, marginBottom:2 },
  resultDate:   { fontSize:12, color: COLORS.muted },
  statusBadge:  { backgroundColor: COLORS.orangeLight, paddingHorizontal:12, paddingVertical:5, borderRadius:20 },
  statusTxt:    { color: COLORS.orange, fontWeight:'800', fontSize:12 },
  stepsWrap:    { marginBottom:16 },
  stepRow:      { flexDirection:'row', alignItems:'flex-start', gap:12, marginBottom:0 },
  stepLeft:     { alignItems:'center', width:28 },
  stepIcon:     { width:28, height:28, borderRadius:14, backgroundColor: COLORS.border, alignItems:'center', justifyContent:'center' },
  stepIconDone: { backgroundColor: COLORS.green },
  stepIconActive:{ backgroundColor: COLORS.orange },
  stepLine:     { width:2, height:28, backgroundColor: COLORS.border, marginTop:2 },
  stepLineDone: { backgroundColor: COLORS.green },
  stepLabel:    { fontSize:13, color: COLORS.muted, paddingTop:6, paddingBottom:22, fontWeight:'600' },
  stepLabelDone:{ color: COLORS.dark },
  stepLabelActive:{ color: COLORS.orange, fontWeight:'800' },
  updateBox:    { flexDirection:'row', alignItems:'flex-start', gap:8, backgroundColor: COLORS.orangeLight, borderRadius: RADIUS.sm, padding:12 },
  updateTxt:    { flex:1, fontSize:13, color: COLORS.text, lineHeight:18 },
  notFound:     { alignItems:'center', paddingTop:40, gap:8 },
  notFoundTxt:  { fontSize:16, fontWeight:'700', color: COLORS.dark },
  notFoundSub:  { fontSize:13, color: COLORS.muted },
});
