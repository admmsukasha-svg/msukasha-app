import React, { useState } from 'react';
import { View, Text, StyleSheet as HS, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as HC, RADIUS as HR } from '../constants';

const FAQS = [
  { q:'How do I post a free ad on MSukasha?', a:'Tap "Post Ad" in the bottom tab. Fill in your item details, add photos, set your price, and publish. It is 100% free and takes less than 3 minutes.' },
  { q:'What is Trade Assurance?', a:'Trade Assurance protects B2B buyers by holding payment in escrow until you confirm receipt of goods as described. If there is a dispute, our team investigates and resolves it fairly.' },
  { q:'How do I become a verified supplier?', a:'Go to your account settings and apply for vendor verification. Submit your CNIC, NTN, and business registration documents. Our team reviews within 3–5 business days.' },
  { q:'How do I contact a seller?', a:'Use the built-in messaging system by tapping "Message Seller" on any listing. You can also call the seller if they have shared their phone number publicly.' },
  { q:'Is it safe to buy used items?', a:'Always inspect the item in person before paying. Meet in a public place. Read our Safety Tips for more guidance on safe C2C transactions.' },
  { q:'How do I track my order?', a:'Go to My Account → My Orders, or use the Track Order feature. Enter your Order ID to see real-time status.' },
];

export default function HelpScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <View style={[hs.container, { paddingTop: insets.top }]}>
      <View style={hs.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={HC.dark} />
        </TouchableOpacity>
        <Text style={hs.headerTitle}>Help Center</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding:16, gap:14 }} showsVerticalScrollIndicator={false}>
        {/* Quick help */}
        <View style={hs.quickGrid}>
          {[
            { icon:'bag-handle-outline', label:'Buying',  color:'#0066cc' },
            { icon:'storefront-outline', label:'Selling', color:'#ff6600' },
            { icon:'car-outline',        label:'Shipping',color:'#22c55e' },
            { icon:'shield-outline',     label:'Safety',  color:'#8b5cf6' },
          ].map((q,i)=>(
            <TouchableOpacity key={i} style={hs.quickCard} onPress={() => navigation.navigate('Contact')}>
              <View style={[hs.quickIcon, {backgroundColor: q.color+'20'}]}>
                <Ionicons name={q.icon} size={24} color={q.color} />
              </View>
              <Text style={hs.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <Text style={hs.sectionTitle}>Frequently Asked Questions</Text>
        {FAQS.map((faq, i) => (
          <TouchableOpacity key={i} style={hs.faqCard} onPress={() => setOpenFaq(openFaq === i ? null : i)} activeOpacity={0.85}>
            <View style={hs.faqHeader}>
              <Text style={hs.faqQ}>{faq.q}</Text>
              <Ionicons name={openFaq === i ? 'chevron-up' : 'chevron-down'} size={18} color={HC.muted} />
            </View>
            {openFaq === i && <Text style={hs.faqA}>{faq.a}</Text>}
          </TouchableOpacity>
        ))}

        {/* Still need help */}
        <TouchableOpacity style={hs.contactCard} onPress={() => navigation.navigate('Contact')}>
          <Ionicons name="headset-outline" size={22} color={HC.orange} />
          <View style={{ flex:1 }}>
            <Text style={hs.contactCardTitle}>Still need help?</Text>
            <Text style={hs.contactCardSub}>Our support team replies within 24 hours.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={HC.muted} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const hs = HS.create({
  container:      { flex:1, backgroundColor: HC.bodyBg },
  header:         { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: HC.border },
  headerTitle:    { fontSize:18, fontWeight:'800', color: HC.dark },
  quickGrid:      { flexDirection:'row', gap:12 },
  quickCard:      { flex:1, backgroundColor:'#fff', borderRadius: HR.md, padding:14, alignItems:'center', gap:8, borderWidth:1, borderColor: HC.border },
  quickIcon:      { width:48, height:48, borderRadius:14, alignItems:'center', justifyContent:'center' },
  quickLabel:     { fontSize:12, fontWeight:'700', color: HC.dark },
  sectionTitle:   { fontSize:16, fontWeight:'800', color: HC.dark },
  faqCard:        { backgroundColor:'#fff', borderRadius: HR.md, padding:16, borderWidth:1, borderColor: HC.border },
  faqHeader:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap:10 },
  faqQ:           { flex:1, fontSize:14, fontWeight:'700', color: HC.dark, lineHeight:20 },
  faqA:           { fontSize:13, color: HC.muted, lineHeight:20, marginTop:10, paddingTop:10, borderTopWidth:1, borderTopColor: HC.border },
  contactCard:    { flexDirection:'row', alignItems:'center', gap:12, backgroundColor: HC.orangeLight, borderRadius: HR.md, padding:16 },
  contactCardTitle: { fontSize:14, fontWeight:'800', color: HC.dark },
  contactCardSub: { fontSize:12, color: HC.muted, marginTop:2 },
});


// ===== FILE 5: Remaining stub screens =====
// Save each as separate file

// src/screens/TradeAssuranceScreen.js
export function TradeAssuranceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex:1, backgroundColor: HC.bodyBg, paddingTop: insets.top }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: HC.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color={HC.dark} /></TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:'800', color: HC.dark }}>Trade Assurance</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding:16, gap:14 }}>
        {[{icon:'lock-closed-outline',title:'Secure Payment',desc:'Your payment is held in secure escrow. The supplier never receives it until you confirm delivery.'},{icon:'car-outline',title:'Shipment Tracking',desc:'Track your order in real time from your account dashboard.'},{icon:'checkmark-circle-outline',title:'Confirm & Release',desc:'Inspect goods and confirm receipt. Payment is released to supplier only after your approval.'}].map((s,i)=>(
          <View key={i} style={{ backgroundColor:'#fff', borderRadius: HR.md, padding:18, borderWidth:1, borderColor: HC.border }}>
            <View style={{ width:52, height:52, borderRadius:14, backgroundColor: HC.orangeLight, alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <Ionicons name={s.icon} size={24} color={HC.orange} />
            </View>
            <Text style={{ fontSize:15, fontWeight:'800', color: HC.dark, marginBottom:6 }}>Step {i+1} — {s.title}</Text>
            <Text style={{ fontSize:13, color: HC.muted, lineHeight:20 }}>{s.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// src/screens/SafetyTipsScreen.js
export function SafetyTipsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const tips = [
    { icon:'people-outline',  color:'#22c55e', title:'Meet in Public',       desc:'Always meet sellers in busy, well-lit public places. Avoid private locations for first transactions.' },
    { icon:'eye-outline',     color:'#0066cc', title:'Inspect Before Pay',   desc:'Never pay before physically inspecting the item. Test electronics, check vehicle documents, inspect furniture.' },
    { icon:'card-outline',    color:'#ff6600', title:'No Advance Payment',   desc:'Do not send advance payment to strangers. Legitimate sellers accept payment on delivery or inspection.' },
    { icon:'alert-outline',   color:'#ef4444', title:'Suspicious Low Prices',desc:'If a price seems too good to be true, it probably is. Research market prices before making any deal.' },
    { icon:'chatbubble-outline',color:'#8b5cf6',title:'Use MSukasha Messages','desc':'Keep all communication within the platform. This creates a record and protects you in disputes.' },
  ];
  return (
    <View style={{ flex:1, backgroundColor: HC.bodyBg, paddingTop: insets.top }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: HC.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color={HC.dark} /></TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:'800', color: HC.dark }}>Safety Tips</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
        {tips.map((t,i)=>(
          <View key={i} style={{ flexDirection:'row', gap:14, backgroundColor:'#fff', borderRadius: HR.md, padding:16, borderWidth:1, borderColor: HC.border }}>
            <View style={{ width:44, height:44, borderRadius:12, backgroundColor: t.color+'20', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Ionicons name={t.icon} size={22} color={t.color} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:14, fontWeight:'800', color: HC.dark, marginBottom:4 }}>{t.title}</Text>
              <Text style={{ fontSize:13, color: HC.muted, lineHeight:19 }}>{t.desc}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor: HC.orange, paddingVertical:14, borderRadius: HR.md }} onPress={() => navigation.navigate('Contact')}>
          <Ionicons name="flag-outline" size={18} color="#fff" />
          <Text style={{ color:'#fff', fontSize:15, fontWeight:'800' }}>Report Suspicious Activity</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// src/screens/BuyingGuidesScreen.js
export function BuyingGuidesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const guides = [
    { icon:'phone-portrait-outline', title:'Used Smartphones', desc:'Check IMEI, battery health, iCloud/Google lock, and test all ports before buying.' },
    { icon:'car-outline',            title:'Used Vehicles',    desc:'Verify chassis number, inspect for accident damage, test drive minimum 10 minutes.' },
    { icon:'laptop-outline',         title:'Used Laptops',     desc:'Run battery report, test keyboard, check screen for dead pixels, test all ports.' },
    { icon:'couch-outline',          title:'Furniture',        desc:'Check for termite damage, structural integrity, musty smells indicating mold.' },
  ];
  return (
    <View style={{ flex:1, backgroundColor: HC.bodyBg, paddingTop: insets.top }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: HC.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color={HC.dark} /></TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:'800', color: HC.dark }}>Buying Guides</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
        {guides.map((g,i)=>(
          <View key={i} style={{ backgroundColor:'#fff', borderRadius: HR.md, padding:18, borderWidth:1, borderColor: HC.border }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:10 }}>
              <View style={{ width:44, height:44, borderRadius:12, backgroundColor: HC.orangeLight, alignItems:'center', justifyContent:'center' }}>
                <Ionicons name={g.icon} size={22} color={HC.orange} />
              </View>
              <Text style={{ fontSize:15, fontWeight:'800', color: HC.dark }}>{g.title}</Text>
            </View>
            <Text style={{ fontSize:13, color: HC.muted, lineHeight:20 }}>{g.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// Stub screens for remaining pages
export function VerifiedSuppliersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex:1, paddingTop: insets.top }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: HC.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color={HC.dark} /></TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:'800', color: HC.dark }}>Verified Suppliers</Text>
      </View>
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <Ionicons name="shield-checkmark-outline" size={52} color={HC.orange} />
        <Text style={{ fontSize:16, fontWeight:'700', color: HC.dark, marginTop:12 }}>50,000+ Verified Suppliers</Text>
        <Text style={{ fontSize:13, color: HC.muted, marginTop:6, textAlign:'center', paddingHorizontal:32 }}>Browse our marketplace to find verified B2B suppliers.</Text>
        <TouchableOpacity style={{ marginTop:20, backgroundColor: HC.orange, paddingHorizontal:24, paddingVertical:12, borderRadius: HR.md }} onPress={() => navigation.navigate('Shop', { type:'b2b' })}>
          <Text style={{ color:'#fff', fontWeight:'700' }}>Browse Suppliers</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function LogisticsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex:1, paddingTop: insets.top }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: HC.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color={HC.dark} /></TouchableOpacity>
        <Text style={{ fontSize:18, fontWeight:'800', color: HC.dark }}>Logistics Service</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
        {[{icon:'cube-outline',title:'Express Parcel',desc:'Same-day and next-day delivery across major cities.'},{icon:'car-outline',title:'Bulk Freight',desc:'Full and partial truckload services for wholesale orders.'},{icon:'business-outline',title:'Warehousing',desc:'Store inventory in Karachi, Lahore, and Islamabad.'}].map((s,i)=>(
          <View key={i} style={{ flexDirection:'row', gap:14, backgroundColor:'#fff', borderRadius: HR.md, padding:16, borderWidth:1, borderColor: HC.border }}>
            <View style={{ width:44, height:44, borderRadius:12, backgroundColor: HC.orangeLight, alignItems:'center', justifyContent:'center' }}>
              <Ionicons name={s.icon} size={22} color={HC.orange} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:14, fontWeight:'800', color: HC.dark, marginBottom:4 }}>{s.title}</Text>
              <Text style={{ fontSize:13, color: HC.muted }}>{s.desc}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor: HC.orange, paddingVertical:14, borderRadius: HR.md }} onPress={() => navigation.navigate('Contact')}>
          <Text style={{ color:'#fff', fontSize:15, fontWeight:'800' }}>Get a Quote</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
