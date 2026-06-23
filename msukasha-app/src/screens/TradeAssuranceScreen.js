import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../constants';


export default function TradeAssuranceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex:1, backgroundColor: COLORS.bodyBg, paddingTop: insets.top }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: COLORS.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color={COLORS.dark} /></TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:'800', color: COLORS.dark }}>Trade Assurance</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding:16, gap:14 }}>
        {[{icon:'lock-closed-outline',title:'Secure Payment',desc:'Your payment is held in secure escrow. The supplier never receives it until you confirm delivery.'},{icon:'car-outline',title:'Shipment Tracking',desc:'Track your order in real time from your account dashboard.'},{icon:'checkmark-circle-outline',title:'Confirm & Release',desc:'Inspect goods and confirm receipt. Payment is released to supplier only after your approval.'}].map((s,i)=>(
          <View key={i} style={{ backgroundColor:'#fff', borderRadius: RADIUS.md, padding:18, borderWidth:1, borderColor: COLORS.border }}>
            <View style={{ width:52, height:52, borderRadius:14, backgroundColor: COLORS.orangeLight, alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <Ionicons name={s.icon} size={24} color={COLORS.orange} />
            </View>
            <Text style={{ fontSize:15, fontWeight:'800', color: COLORS.dark, marginBottom:6 }}>Step {i+1} — {s.title}</Text>
            <Text style={{ fontSize:13, color: COLORS.muted, lineHeight:20 }}>{s.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
