import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../constants';


export default function SafetyTipsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const tips = [
    { icon:'people-outline',  color:'#22c55e', title:'Meet in Public',       desc:'Always meet sellers in busy, well-lit public places. Avoid private locations for first transactions.' },
    { icon:'eye-outline',     color:'#0066cc', title:'Inspect Before Pay',   desc:'Never pay before physically inspecting the item. Test electronics, check vehicle documents, inspect furniture.' },
    { icon:'card-outline',    color:'#ff6600', title:'No Advance Payment',   desc:'Do not send advance payment to strangers. Legitimate sellers accept payment on delivery or inspection.' },
    { icon:'alert-outline',   color:'#ef4444', title:'Suspicious Low Prices',desc:'If a price seems too good to be true, it probably is. Research market prices before making any deal.' },
    { icon:'chatbubble-outline',color:'#8b5cf6',title:'Use MSukasha Messages','desc':'Keep all communication within the platform. This creates a record and protects you in disputes.' },
  ];
  return (
    <View style={{ flex:1, backgroundColor: COLORS.bodyBg, paddingTop: insets.top }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: COLORS.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color={COLORS.dark} /></TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:'800', color: COLORS.dark }}>Safety Tips</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
        {tips.map((t,i)=>(
          <View key={i} style={{ flexDirection:'row', gap:14, backgroundColor:'#fff', borderRadius: RADIUS.md, padding:16, borderWidth:1, borderColor: COLORS.border }}>
            <View style={{ width:44, height:44, borderRadius:12, backgroundColor: t.color+'20', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Ionicons name={t.icon} size={22} color={t.color} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:14, fontWeight:'800', color: COLORS.dark, marginBottom:4 }}>{t.title}</Text>
              <Text style={{ fontSize:13, color: COLORS.muted, lineHeight:19 }}>{t.desc}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor: COLORS.orange, paddingVertical:14, borderRadius: RADIUS.md }} onPress={() => navigation.navigate('Contact')}>
          <Ionicons name="flag-outline" size={18} color="#fff" />
          <Text style={{ color:'#fff', fontSize:15, fontWeight:'800' }}>Report Suspicious Activity</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
