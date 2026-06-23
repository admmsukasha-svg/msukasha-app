import React, { useState } from 'react';
import {
  View, Text, StyleSheet as RNStyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRegister } from '../services/api';
import { CITIES, COLORS } from '../constants';

export function RegisterScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const redirectTo = route?.params?.redirectTo || null;

  const [role,     setRole]     = useState('buyer');
  const [fname,    setFname]    = useState('');
  const [lname,    setLname]    = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [city,     setCity]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [step,     setStep]     = useState(1); // 2-step form

  const handleRegister = async () => {
    if (!fname.trim() || !lname.trim() || !email.trim() || !phone.trim() || !city || !password) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await apiRegister({
        name:     `${fname.trim()} ${lname.trim()}`,
        email:    email.trim().toLowerCase(),
        password, phone, city, role,
      });
      if (redirectTo) navigation.replace(redirectTo);
      else navigation.replace('MainTabs');
    } catch(e) {
      Alert.alert('Registration Failed', e.message || 'Please try again.');
    }
    setLoading(false);
  };

  const s = rStyles;

  return (
    <KeyboardAvoidingView
      style={{ flex:1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#1a2332', '#2d4a6e']} style={[s.topBg, { paddingTop: insets.top }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.topTitle}>Create Account</Text>
        <Text style={s.topSub}>Join 1.2 million traders on MSukasha</Text>

        {/* Step indicator */}
        <View style={s.stepRow}>
          {[1,2].map(n => (
            <View key={n} style={{ flexDirection:'row', alignItems:'center' }}>
              <View style={[s.stepDot, step >= n && s.stepDotActive]}>
                <Text style={[s.stepDotTxt, step >= n && s.stepDotTxtActive]}>{n}</Text>
              </View>
              {n < 2 && <View style={[s.stepLine, step > n && s.stepLineActive]} />}
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={s.formWrap}
        contentContainerStyle={s.formContent}
        keyboardShouldPersistTaps="handled"
      >

        {step === 1 ? (
          <>
            {/* Role Selection */}
            <Text style={s.sectionLabel}>I want to:</Text>
            <View style={s.roleRow}>
              <TouchableOpacity
                style={[s.roleCard, role === 'buyer' && s.roleCardActive]}
                onPress={() => setRole('buyer')}
              >
                <Ionicons name="bag-handle-outline" size={24} color={role === 'buyer' ? COLORS.orange : COLORS.muted} />
                <Text style={[s.roleTitle, role === 'buyer' && { color: COLORS.orange }]}>Buy / Source</Text>
                <Text style={s.roleSub}>Find wholesale or used items</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.roleCard, role === 'seller' && s.roleCardActive]}
                onPress={() => setRole('seller')}
              >
                <Ionicons name="storefront-outline" size={24} color={role === 'seller' ? COLORS.orange : COLORS.muted} />
                <Text style={[s.roleTitle, role === 'seller' && { color: COLORS.orange }]}>Sell / Supply</Text>
                <Text style={s.roleSub}>List products or ads</Text>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={s.twoCol}>
              <View style={[s.fieldWrap, { flex:1 }]}>
                <Text style={s.fieldLabel}>First Name *</Text>
                <TextInput style={s.input} placeholder="Ali" placeholderTextColor={COLORS.muted} value={fname} onChangeText={setFname} />
              </View>
              <View style={[s.fieldWrap, { flex:1 }]}>
                <Text style={s.fieldLabel}>Last Name *</Text>
                <TextInput style={s.input} placeholder="Khan" placeholderTextColor={COLORS.muted} value={lname} onChangeText={setLname} />
              </View>
            </View>

            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Email Address *</Text>
              <TextInput style={s.input} placeholder="your@email.com" placeholderTextColor={COLORS.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Phone / WhatsApp *</Text>
              <TextInput style={s.input} placeholder="+92 300 0000000" placeholderTextColor={COLORS.muted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <TouchableOpacity
              style={[s.primaryBtn, (!fname||!lname||!email||!phone) && { opacity:0.5 }]}
              onPress={() => {
                if (!fname.trim()||!lname.trim()||!email.trim()||!phone.trim()) {
                  Alert.alert('Required', 'Please fill all fields.'); return;
                }
                setStep(2);
              }}
            >
              <Text style={s.primaryBtnTxt}>Next: Set Password →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* City */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>City *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8, paddingBottom:4 }}>
                {CITIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[s.cityPill, city === c && s.cityPillActive]}
                    onPress={() => setCity(c)}
                  >
                    <Text style={[s.cityPillTxt, city === c && s.cityPillTxtActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Password */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Password *</Text>
              <View style={s.inputRow}>
                <TextInput style={[s.input, { flex:1, paddingRight:44 }]} placeholder="Minimum 6 characters" placeholderTextColor={COLORS.muted} value={password} onChangeText={setPassword} secureTextEntry={!showPwd} />
                <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPwd(!showPwd)}>
                  <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Confirm Password *</Text>
              <TextInput style={s.input} placeholder="Repeat password" placeholderTextColor={COLORS.muted} value={confirm} onChangeText={setConfirm} secureTextEntry />
            </View>

            <View style={{ flexDirection:'row', gap:10 }}>
              <TouchableOpacity style={s.backBtnForm} onPress={() => setStep(1)}>
                <Ionicons name="arrow-back" size={18} color={COLORS.dark} />
                <Text style={s.backBtnTxt}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.primaryBtn, { flex:1 }, loading && { opacity:0.7 }]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnTxt}>Create Account</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={s.switchRow}>
          <Text style={s.switchTxt}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login', { redirectTo })}>
            <Text style={s.switchLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const rStyles = RNStyleSheet.create({
  topBg:       { paddingHorizontal:24, paddingBottom:28 },
  backBtn:     { marginBottom:12 },
  topTitle:    { fontSize:24, fontWeight:'900', color:'#fff', marginBottom:4 },
  topSub:      { fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:16 },
  stepRow:     { flexDirection:'row', alignItems:'center' },
  stepDot:     { width:28, height:28, borderRadius:14, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' },
  stepDotActive: { backgroundColor: COLORS.orange },
  stepDotTxt:  { fontSize:12, fontWeight:'800', color:'rgba(255,255,255,0.5)' },
  stepDotTxtActive: { color:'#fff' },
  stepLine:    { width:40, height:2, backgroundColor:'rgba(255,255,255,0.2)', marginHorizontal:4 },
  stepLineActive: { backgroundColor: COLORS.orange },
  formWrap:    { flex:1, backgroundColor:'#fff', borderTopLeftRadius:24, borderTopRightRadius:24, marginTop:-16 },
  formContent: { padding:24, paddingBottom:40 },
  sectionLabel: { fontSize:13, fontWeight:'700', color: COLORS.dark, marginBottom:10 },
  roleRow:     { flexDirection:'row', gap:12, marginBottom:20 },
  roleCard:    { flex:1, borderWidth:2, borderColor: COLORS.border, borderRadius:12, padding:16, alignItems:'center', gap:6 },
  roleCardActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orangeLight },
  roleTitle:   { fontSize:13, fontWeight:'800', color: COLORS.dark },
  roleSub:     { fontSize:10, color: COLORS.muted, textAlign:'center' },
  twoCol:      { flexDirection:'row', gap:12 },
  fieldWrap:   { marginBottom:16 },
  fieldLabel:  { fontSize:13, fontWeight:'700', color: COLORS.dark, marginBottom:6 },
  input:       { backgroundColor: COLORS.bodyBg, borderRadius:8, borderWidth:1.5, borderColor: COLORS.border, paddingVertical:11, paddingHorizontal:14, fontSize:14, color: COLORS.text },
  inputRow:    { position:'relative' },
  eyeBtn:      { position:'absolute', right:12, top:12 },
  cityPill:    { paddingHorizontal:14, paddingVertical:7, borderRadius:20, borderWidth:1, borderColor: COLORS.border, backgroundColor:'#fff' },
  cityPillActive: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  cityPillTxt: { fontSize:12, fontWeight:'600', color: COLORS.muted },
  cityPillTxtActive: { color:'#fff' },
  primaryBtn:  { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor: COLORS.orange, paddingVertical:14, borderRadius:10, marginTop:6, marginBottom:16 },
  primaryBtnTxt: { color:'#fff', fontSize:15, fontWeight:'800' },
  backBtnForm: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:16, paddingVertical:14, borderRadius:10, borderWidth:1.5, borderColor: COLORS.border },
  backBtnTxt:  { fontSize:14, fontWeight:'700', color: COLORS.dark },
  switchRow:   { flexDirection:'row', justifyContent:'center' },
  switchTxt:   { fontSize:14, color: COLORS.muted },
  switchLink:  { fontSize:14, color: COLORS.orange, fontWeight:'700' },
});

export default RegisterScreen;
