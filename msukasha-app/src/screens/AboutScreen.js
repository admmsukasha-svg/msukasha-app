import React from 'react';
import { View, Text, StyleSheet as AS, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as AC, RADIUS as AR } from '../constants';

export default function AboutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[as.container, { paddingTop: insets.top }]}>
      <View style={as.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={AC.dark} />
        </TouchableOpacity>
        <Text style={as.headerTitle}>About MSukasha</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1a2332','#2d4a6e']} style={as.heroBanner}>
          <View style={as.logoBox}><Text style={as.logoTxt}>M</Text></View>
          <Text style={as.heroTitle}>MSukasha</Text>
          <Text style={as.heroSub}>Pakistan's #1 B2B Wholesale & C2C Marketplace</Text>
          <View style={as.flagBadge}>
            <Text style={as.flagTxt}>🇵🇰 Made in Pakistan</Text>
          </View>
        </LinearGradient>

        <View style={as.content}>
          <View style={as.card}>
            <Text style={as.cardTitle}>Our Mission</Text>
            <Text style={as.cardTxt}>MSukasha was founded to make trade accessible for every Pakistani business — connecting verified suppliers, buyers, and everyday sellers nationwide through a safe, efficient, and modern platform.</Text>
          </View>

          <View style={as.statsRow}>
            {[{n:'1.2M+',l:'Users'},{n:'50K+',l:'Suppliers'},{n:'100+',l:'Cities'},{n:'200K+',l:'Listings'}].map((s,i)=>(
              <View key={i} style={as.statItem}>
                <Text style={as.statNum}>{s.n}</Text>
                <Text style={as.statLabel}>{s.l}</Text>
              </View>
            ))}
          </View>

          <View style={as.card}>
            <Text style={as.cardTitle}>Legal Information</Text>
            {[
              ['Company','MSUKASHA SMC-PRIVATE LIMITED'],
              ['Corporate ID','0318964'],
              ['Incorporated','December 2025'],
              ['Registered','SECP Pakistan'],
              ['Office','Islamabad, Pakistan'],
            ].map(([k,v],i)=>(
              <View key={i} style={as.infoRow}>
                <Text style={as.infoKey}>{k}</Text>
                <Text style={as.infoVal}>{v}</Text>
              </View>
            ))}
          </View>

          <View style={as.card}>
            <Text style={as.cardTitle}>Follow Us</Text>
            <View style={as.socialRow}>
              {[
                { icon:'logo-facebook', color:'#1877f2', url:'https://www.facebook.com/profile.php?id=61554607264842' },
                { icon:'logo-instagram',color:'#e1306c', url:'https://www.instagram.com/msukasha.co/' },
                { icon:'logo-linkedin', color:'#0077b5', url:'https://www.linkedin.com/in/msukasha-com-63a18a3a3' },
                { icon:'logo-whatsapp', color:'#25d366', url:'https://wa.me/923313730953' },
              ].map((s,i)=>(
                <TouchableOpacity key={i} style={[as.socialBtn,{backgroundColor:s.color+'20'}]} onPress={()=>Linking.openURL(s.url)}>
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={as.versionRow}>
            <Text style={as.versionTxt}>MSukasha App v1.0.0</Text>
            <Text style={as.versionTxt}>© 2026 MSukasha.com</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const as = AS.create({
  container:   { flex:1, backgroundColor: AC.bodyBg },
  header:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: AC.border },
  headerTitle: { fontSize:18, fontWeight:'800', color: AC.dark },
  heroBanner:  { padding:32, alignItems:'center' },
  logoBox:     { width:72, height:72, borderRadius:20, backgroundColor: AC.orange, alignItems:'center', justifyContent:'center', marginBottom:14 },
  logoTxt:     { fontSize:36, fontWeight:'900', color:'#fff' },
  heroTitle:   { fontSize:28, fontWeight:'900', color:'#fff', marginBottom:6 },
  heroSub:     { fontSize:13, color:'rgba(255,255,255,0.75)', textAlign:'center', marginBottom:14 },
  flagBadge:   { backgroundColor:'rgba(255,102,0,0.2)', paddingHorizontal:16, paddingVertical:5, borderRadius:20 },
  flagTxt:     { color:'#ffaa66', fontWeight:'700', fontSize:12 },
  content:     { padding:16, gap:14 },
  card:        { backgroundColor:'#fff', borderRadius: AR.md, padding:18, borderWidth:1, borderColor: AC.border },
  cardTitle:   { fontSize:15, fontWeight:'800', color: AC.dark, marginBottom:10, paddingBottom:8, borderBottomWidth:1, borderBottomColor: AC.border },
  cardTxt:     { fontSize:13, color: AC.muted, lineHeight:20 },
  statsRow:    { flexDirection:'row', backgroundColor:'#fff', borderRadius: AR.md, padding:16, borderWidth:1, borderColor: AC.border },
  statItem:    { flex:1, alignItems:'center' },
  statNum:     { fontSize:18, fontWeight:'900', color: AC.orange },
  statLabel:   { fontSize:10, color: AC.muted, marginTop:2 },
  infoRow:     { flexDirection:'row', justifyContent:'space-between', paddingVertical:7, borderBottomWidth:1, borderBottomColor: AC.border },
  infoKey:     { fontSize:13, color: AC.muted, fontWeight:'600' },
  infoVal:     { fontSize:13, color: AC.dark, fontWeight:'700' },
  socialRow:   { flexDirection:'row', gap:12, marginTop:4 },
  socialBtn:   { width:48, height:48, borderRadius:14, alignItems:'center', justifyContent:'center' },
  versionRow:  { alignItems:'center', gap:4, paddingTop:8 },
  versionTxt:  { fontSize:12, color: AC.muted },
});
