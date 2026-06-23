import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../constants';


export default function BuyingGuidesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const guides = [
    { icon:'phone-portrait-outline', title:'Used Smartphones', desc:'Check IMEI, battery health, iCloud/Google lock, and test all ports before buying.' },
    { icon:'car-outline',            title:'Used Vehicles',    desc:'Verify chassis number, inspect for accident damage, test drive minimum 10 minutes.' },
    { icon:'laptop-outline',         title:'Used Laptops',     desc:'Run battery report, test keyboard, check screen for dead pixels, test all ports.' },
    { icon:'couch-outline',          title:'Furniture',        desc:'Check for termite damage, structural integrity, musty smells indicating mold.' },
  ];
  return (
    <View style={{ flex:1, backgroundColor: COLORS.bodyBg, paddingTop: insets.top }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: COLORS.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color={COLORS.dark} /></TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:'800', color: COLORS.dark }}>Buying Guides</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
        {guides.map((g,i)=>(
          <View key={i} style={{ backgroundColor:'#fff', borderRadius: RADIUS.md, padding:18, borderWidth:1, borderColor: COLORS.border }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:10 }}>
              <View style={{ width:44, height:44, borderRadius:12, backgroundColor: COLORS.orangeLight, alignItems:'center', justifyContent:'center' }}>
                <Ionicons name={g.icon} size={22} color={COLORS.orange} />
              </View>
              <Text style={{ fontSize:15, fontWeight:'800', color: COLORS.dark }}>{g.title}</Text>
            </View>
            <Text style={{ fontSize:13, color: COLORS.muted, lineHeight:20 }}>{g.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
