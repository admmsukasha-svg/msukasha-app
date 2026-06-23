import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../constants';


export default function VerifiedSuppliersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex:1, paddingTop: insets.top }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: COLORS.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color={COLORS.dark} /></TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:'800', color: COLORS.dark }}>Verified Suppliers</Text>
      </View>
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <Ionicons name="shield-checkmark-outline" size={52} color={COLORS.orange} />
        <Text style={{ fontSize:16, fontWeight:'700', color: COLORS.dark, marginTop:12 }}>50,000+ Verified Suppliers</Text>
        <Text style={{ fontSize:13, color: COLORS.muted, marginTop:6, textAlign:'center', paddingHorizontal:32 }}>Browse our marketplace to find verified B2B suppliers.</Text>
        <TouchableOpacity style={{ marginTop:20, backgroundColor: COLORS.orange, paddingHorizontal:24, paddingVertical:12, borderRadius: RADIUS.md }} onPress={() => navigation.navigate('Shop', { type:'b2b' })}>
          <Text style={{ color:'#fff', fontWeight:'700' }}>Browse Suppliers</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
