import React, { useState } from 'react';
import {
  View, Text, StyleSheet as ConS, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as ConC, RADIUS as ConR } from '../constants';
import { apiSendContact, getUser } from '../services/api';

export default function ContactScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    (async () => {
      const u = await getUser();
      if (u) { setName(u.name || ''); setEmail(u.email || ''); }
    })();
  }, []);

  const handleSend = async () => {
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      Alert.alert('Required', 'Please fill all fields.'); return;
    }
    setLoading(true);
    try {
      await apiSendContact({ name, email, subject, message });
      Alert.alert('Sent!', 'Message sent! We\'ll reply within 24 hours.');
      setMessage(''); setSubject('');
    } catch(e) {
      Alert.alert('Error', e.message || 'Failed to send. Please try again.');
    }
    setLoading(false);
  };

  const cs = conStyles;
  return (
    <View style={[cs.container, { paddingTop: insets.top }]}>
      <View style={cs.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={ConC.dark} />
        </TouchableOpacity>
        <Text style={cs.headerTitle}>Contact Us</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding:16, gap:14 }} keyboardShouldPersistTaps="handled">
        {/* Contact Info */}
        <View style={cs.card}>
          {[
            { icon:'mail-outline',     label:'Email',   val:'supp.msukasha@gmail.com', onPress:()=>Linking.openURL('mailto:supp.msukasha@gmail.com') },
            { icon:'call-outline',     label:'Phone',   val:'+92 331 3730953',          onPress:()=>Linking.openURL('tel:+923313730953') },
            { icon:'logo-whatsapp',    label:'WhatsApp',val:'+92 331 3730953',          onPress:()=>Linking.openURL('https://wa.me/923313730953') },
            { icon:'location-outline', label:'Office',  val:'Islamabad, Pakistan',      onPress:null },
          ].map((c,i)=>(
            <TouchableOpacity key={i} style={cs.contactRow} onPress={c.onPress} disabled={!c.onPress}>
              <View style={cs.contactIcon}><Ionicons name={c.icon} size={20} color={ConC.orange} /></View>
              <View style={{ flex:1 }}>
                <Text style={cs.contactLabel}>{c.label}</Text>
                <Text style={cs.contactVal}>{c.val}</Text>
              </View>
              {c.onPress && <Ionicons name="chevron-forward" size={16} color={ConC.muted} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Message Form */}
        <View style={cs.card}>
          <Text style={cs.cardTitle}>Send a Message</Text>
          {[
            { label:'Full Name *',   val:name,    set:setName,    ph:'Your full name',     type:'default' },
            { label:'Email *',       val:email,   set:setEmail,   ph:'your@email.com',     type:'email-address' },
          ].map((f,i)=>(
            <View key={i} style={cs.field}>
              <Text style={cs.fieldLabel}>{f.label}</Text>
              <TextInput style={cs.input} placeholder={f.ph} placeholderTextColor={ConC.muted} value={f.val} onChangeText={f.set} keyboardType={f.type} autoCapitalize="none" />
            </View>
          ))}
          <View style={cs.field}>
            <Text style={cs.fieldLabel}>Subject *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8 }}>
              {['B2B Inquiry','C2C Help','Account Issue','Trade Assurance','Other'].map(s=>(
                <TouchableOpacity key={s} style={[cs.subjectPill, subject===s && cs.subjectPillActive]} onPress={()=>setSubject(s)}>
                  <Text style={[cs.subjectPillTxt, subject===s && {color:'#fff'}]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={cs.field}>
            <Text style={cs.fieldLabel}>Message *</Text>
            <TextInput style={[cs.input, {height:110,textAlignVertical:'top'}]} placeholder="Describe your query..." placeholderTextColor={ConC.muted} value={message} onChangeText={setMessage} multiline numberOfLines={5} />
          </View>
          <TouchableOpacity style={[cs.sendBtn, loading && {opacity:0.7}]} onPress={handleSend} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <>
              <Ionicons name="paper-plane-outline" size={18} color="#fff" />
              <Text style={cs.sendBtnTxt}>Send Message</Text>
            </>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const conStyles = ConS.create({
  container:      { flex:1, backgroundColor: ConC.bodyBg },
  header:         { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor: ConC.border },
  headerTitle:    { fontSize:18, fontWeight:'800', color: ConC.dark },
  card:           { backgroundColor:'#fff', borderRadius: ConR.md, padding:16, borderWidth:1, borderColor: ConC.border },
  cardTitle:      { fontSize:15, fontWeight:'800', color: ConC.dark, marginBottom:14, paddingBottom:10, borderBottomWidth:1, borderBottomColor: ConC.border },
  contactRow:     { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor: ConC.border },
  contactIcon:    { width:40, height:40, borderRadius:12, backgroundColor: ConC.orangeLight, alignItems:'center', justifyContent:'center' },
  contactLabel:   { fontSize:11, color: ConC.muted, marginBottom:2 },
  contactVal:     { fontSize:14, fontWeight:'700', color: ConC.dark },
  field:          { marginBottom:14 },
  fieldLabel:     { fontSize:13, fontWeight:'700', color: ConC.dark, marginBottom:6 },
  input:          { backgroundColor: ConC.bodyBg, borderRadius: ConR.sm, borderWidth:1.5, borderColor: ConC.border, paddingVertical:11, paddingHorizontal:14, fontSize:14, color: ConC.text },
  subjectPill:    { paddingHorizontal:12, paddingVertical:6, borderRadius:20, borderWidth:1, borderColor: ConC.border, backgroundColor:'#fff' },
  subjectPillActive:{ backgroundColor: ConC.orange, borderColor: ConC.orange },
  subjectPillTxt: { fontSize:12, fontWeight:'600', color: ConC.muted },
  sendBtn:        { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor: ConC.orange, paddingVertical:14, borderRadius: ConR.md },
  sendBtnTxt:     { color:'#fff', fontSize:15, fontWeight:'800' },
});
