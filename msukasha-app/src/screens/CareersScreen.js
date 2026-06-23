import React, { useState } from 'react';
import {
  View, Text, StyleSheet as CrS, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as CrC, RADIUS as CrR } from '../constants';
import { apiSubmitJobApp, getUser } from '../services/api';

const OPENINGS = [
  { id: 1, title: 'React Native Developer', type: 'Full-time', loc: 'Islamabad / Remote', icon: 'logo-react' },
  { id: 2, title: 'Backend Engineer (Node.js)', type: 'Full-time', loc: 'Islamabad / Remote', icon: 'server-outline' },
  { id: 3, title: 'B2B Sales Executive', type: 'Full-time', loc: 'Karachi', icon: 'briefcase-outline' },
  { id: 4, title: 'Customer Support Associate', type: 'Full-time', loc: 'Islamabad', icon: 'headset-outline' },
  { id: 5, title: 'Digital Marketing Intern', type: 'Internship', loc: 'Remote', icon: 'megaphone-outline' },
];

export default function CareersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    (async () => {
      const u = await getUser();
      if (u) { setName(u.name || ''); setEmail(u.email || ''); }
    })();
  }, []);

  const handleApply = (job) => {
    setSelected(job);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Required', 'Please fill in your name, email, and phone.');
      return;
    }
    setLoading(true);
    try {
      await apiSubmitJobApp({
        position: selected.title,
        name, email, phone, message,
      });
      Alert.alert('Application Sent!', `Thanks for applying to ${selected.title}. Our team will review your application and get back to you.`);
      setSelected(null);
      setMessage('');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={[cs.container, { paddingTop: insets.top }]}>
      <View style={cs.header}>
        <TouchableOpacity onPress={() => (selected ? setSelected(null) : navigation.goBack())}>
          <Ionicons name="arrow-back" size={22} color={CrC.dark} />
        </TouchableOpacity>
        <Text style={cs.headerTitle}>{selected ? 'Apply Now' : 'Careers at MSukasha'}</Text>
        <View style={{ width: 22 }} />
      </View>

      {!selected ? (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <View style={cs.heroCard}>
            <Ionicons name="people-circle-outline" size={36} color="#fff" />
            <Text style={cs.heroTitle}>Help Us Build Pakistan's Marketplace</Text>
            <Text style={cs.heroSub}>We're a small, fast-moving team based in Islamabad. If you want real ownership and impact, we'd love to hear from you.</Text>
          </View>

          <Text style={cs.sectionLabel}>Open Positions ({OPENINGS.length})</Text>
          {OPENINGS.map(job => (
            <View key={job.id} style={cs.jobCard}>
              <View style={cs.jobIcon}>
                <Ionicons name={job.icon} size={22} color={CrC.orange} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={cs.jobTitle}>{job.title}</Text>
                <View style={cs.jobMetaRow}>
                  <Text style={cs.jobMeta}>{job.type}</Text>
                  <Text style={cs.jobMetaDot}>•</Text>
                  <Text style={cs.jobMeta}>{job.loc}</Text>
                </View>
              </View>
              <TouchableOpacity style={cs.applyBtn} onPress={() => handleApply(job)}>
                <Text style={cs.applyBtnTxt}>Apply</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={cs.noteCard}>
            <Ionicons name="information-circle-outline" size={18} color={CrC.muted} />
            <Text style={cs.noteTxt}>Don't see a role that fits? Send us your CV anyway via the Contact page — we're always open to meeting great people.</Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
          <View style={cs.selectedJobCard}>
            <Ionicons name={selected.icon} size={20} color={CrC.orange} />
            <View style={{ flex: 1 }}>
              <Text style={cs.jobTitle}>{selected.title}</Text>
              <Text style={cs.jobMeta}>{selected.type} • {selected.loc}</Text>
            </View>
          </View>

          {[
            { label: 'Full Name *', val: name, set: setName, ph: 'Your full name', type: 'default' },
            { label: 'Email *',     val: email, set: setEmail, ph: 'your@email.com', type: 'email-address' },
            { label: 'Phone *',     val: phone, set: setPhone, ph: '+92 300 0000000', type: 'phone-pad' },
          ].map((f, i) => (
            <View key={i} style={cs.field}>
              <Text style={cs.fieldLabel}>{f.label}</Text>
              <TextInput style={cs.input} placeholder={f.ph} placeholderTextColor={CrC.muted} value={f.val} onChangeText={f.set} keyboardType={f.type} autoCapitalize="none" />
            </View>
          ))}
          <View style={cs.field}>
            <Text style={cs.fieldLabel}>Why are you a good fit? (optional)</Text>
            <TextInput style={[cs.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Tell us a bit about your experience..." placeholderTextColor={CrC.muted} value={message} onChangeText={setMessage} multiline numberOfLines={4} />
          </View>

          <TouchableOpacity style={[cs.submitBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                <Text style={cs.submitBtnTxt}>Submit Application</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const cs = CrS.create({
  container:   { flex: 1, backgroundColor: CrC.bodyBg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: CrC.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: CrC.dark },
  heroCard:    { backgroundColor: CrC.dark, borderRadius: CrR.lg, padding: 22, alignItems: 'center' },
  heroTitle:   { fontSize: 17, fontWeight: '800', color: '#fff', marginTop: 10, marginBottom: 6, textAlign: 'center' },
  heroSub:     { fontSize: 12, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 18 },
  sectionLabel:{ fontSize: 13, fontWeight: '800', color: CrC.dark, marginTop: 4 },
  jobCard:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: CrR.md, padding: 14, borderWidth: 1, borderColor: CrC.border },
  jobIcon:     { width: 44, height: 44, borderRadius: 12, backgroundColor: CrC.orangeLight, alignItems: 'center', justifyContent: 'center' },
  jobTitle:    { fontSize: 14, fontWeight: '800', color: CrC.dark, marginBottom: 4 },
  jobMetaRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  jobMeta:     { fontSize: 11, color: CrC.muted },
  jobMetaDot:  { fontSize: 11, color: CrC.muted },
  applyBtn:    { backgroundColor: CrC.orange, paddingHorizontal: 16, paddingVertical: 8, borderRadius: CrR.sm },
  applyBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  noteCard:    { flexDirection: 'row', gap: 10, backgroundColor: '#fff', borderRadius: CrR.md, padding: 14, borderWidth: 1, borderColor: CrC.border },
  noteTxt:     { flex: 1, fontSize: 12, color: CrC.muted, lineHeight: 18 },
  selectedJobCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: CrR.md, padding: 14, borderWidth: 1, borderColor: CrC.border },
  field:       { marginBottom: 4 },
  fieldLabel:  { fontSize: 13, fontWeight: '700', color: CrC.dark, marginBottom: 6 },
  input:       { backgroundColor: CrC.bodyBg, borderRadius: CrR.sm, borderWidth: 1.5, borderColor: CrC.border, paddingVertical: 11, paddingHorizontal: 14, fontSize: 14, color: CrC.text },
  submitBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: CrC.orange, paddingVertical: 14, borderRadius: CrR.md, marginTop: 4 },
  submitBtnTxt:{ color: '#fff', fontSize: 15, fontWeight: '800' },
});
