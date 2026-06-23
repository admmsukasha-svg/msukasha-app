import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../constants';


export default function LogisticsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex:1, paddingTop: insets.top }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: COLORS.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color={COLORS.dark} /></TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:'800', color: COLORS.dark }}>Logistics Service</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
        {[{icon:'cube-outline',title:'Express Parcel',desc:'Same-day and next-day delivery across major cities.'},{icon:'car-outline',title:'Bulk Freight',desc:'Full and partial truckload services for wholesale orders.'},{icon:'business-outline',title:'Warehousing',desc:'Store inventory in Karachi, Lahore, and Islamabad.'}].map((s,i)=>(
          <View key={i} style={{ flexDirection:'row', gap:14, backgroundColor:'#fff', borderRadius: RADIUS.md, padding:16, borderWidth:1, borderColor: COLORS.border }}>
            <View style={{ width:44, height:44, borderRadius:12, backgroundColor: COLORS.orangeLight, alignItems:'center', justifyContent:'center' }}>
              <Ionicons name={s.icon} size={22} color={COLORS.orange} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:14, fontWeight:'800', color: COLORS.dark, marginBottom:4 }}>{s.title}</Text>
              <Text style={{ fontSize:13, color: COLORS.muted }}>{s.desc}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor: COLORS.orange, paddingVertical:14, borderRadius: RADIUS.md }} onPress={() => navigation.navigate('Contact')}>
          <Text style={{ color:'#fff', fontSize:15, fontWeight:'800' }}>Get a Quote</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
