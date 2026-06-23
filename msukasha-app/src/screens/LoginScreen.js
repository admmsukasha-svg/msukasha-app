import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOW } from '../constants';
import { apiLogin, getToken, getUser } from '../services/api';

export function LoginScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [email,     setEmail]    = useState('');
  const [password,  setPassword] = useState('');
  const [showPwd,   setShowPwd]  = useState(false);
  const [loading,   setLoading]  = useState(false);

  const redirectTo = route?.params?.redirectTo || null;

  useEffect(() => {
    // If already logged in — redirect
    (async () => {
      const token = await getToken();
      const user  = await getUser();
      if (token && user) {
        if (redirectTo) navigation.replace(redirectTo);
        else navigation.replace('MainTabs');
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiLogin(email.trim().toLowerCase(), password);
      // Sync cart/wishlist
      if (redirectTo) navigation.replace(redirectTo);
      else navigation.replace('MainTabs');
    } catch(e) {
      Alert.alert('Login Failed', e.message || 'Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#1a2332', '#2d4a6e']} style={[styles.topBg, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topContent}>
          <View style={styles.logoBox}>
            <Text style={styles.logoTxt}>M</Text>
          </View>
          <Text style={styles.topTitle}>Welcome Back</Text>
          <Text style={styles.topSub}>Sign in to your MSukasha account</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.formWrap}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Email */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.fieldWrap}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TouchableOpacity>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { paddingRight: 44 }]}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              autoComplete="password"
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd(!showPwd)}>
              <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={18} color="#fff" />
              <Text style={styles.primaryBtnTxt}>Sign In</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.switchRow}>
          <Text style={styles.switchTxt}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register', { redirectTo })}>
            <Text style={styles.switchLink}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Browse Info */}
        <View style={styles.guestInfo}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.muted} />
          <Text style={styles.guestInfoTxt}>
            You can browse products without logging in. Login is only required to place orders.
          </Text>
        </View>

        <TouchableOpacity style={styles.guestBtn} onPress={() => navigation.replace('MainTabs')}>
          <Text style={styles.guestBtnTxt}>Continue as Guest →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ===== Styles for LoginScreen =====
const styles = StyleSheet.create({
  topBg:       { paddingHorizontal:24, paddingBottom:32 },
  backBtn:     { marginBottom:16 },
  topContent:  { alignItems:'center' },
  logoBox:     { width:64, height:64, borderRadius:18, backgroundColor: COLORS.orange, alignItems:'center', justifyContent:'center', marginBottom:14, ...SHADOW.md },
  logoTxt:     { fontSize:32, fontWeight:'900', color:'#fff' },
  topTitle:    { fontSize:24, fontWeight:'900', color:'#fff', marginBottom:6 },
  topSub:      { fontSize:14, color:'rgba(255,255,255,0.7)' },
  formWrap:    { flex:1, backgroundColor:'#fff', borderTopLeftRadius:24, borderTopRightRadius:24, marginTop:-20 },
  formContent: { padding:24, paddingBottom:40 },
  fieldWrap:   { marginBottom:18 },
  fieldLabel:  { fontSize:13, fontWeight:'700', color: COLORS.dark, marginBottom:7 },
  labelRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:7 },
  forgotLink:  { fontSize:12, color: COLORS.orange, fontWeight:'700' },
  inputRow:    { flexDirection:'row', alignItems:'center', backgroundColor: COLORS.bodyBg, borderRadius: RADIUS.md, borderWidth:1.5, borderColor: COLORS.border },
  inputIcon:   { marginLeft:12 },
  input:       { flex:1, paddingVertical:12, paddingHorizontal:10, fontSize:14, color: COLORS.text },
  eyeBtn:      { position:'absolute', right:12, padding:4 },
  primaryBtn:  { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor: COLORS.orange, paddingVertical:15, borderRadius: RADIUS.md, marginTop:6, marginBottom:16, ...SHADOW.sm },
  primaryBtnTxt: { color:'#fff', fontSize:16, fontWeight:'800' },
  switchRow:   { flexDirection:'row', justifyContent:'center', marginBottom:24 },
  switchTxt:   { fontSize:14, color: COLORS.muted },
  switchLink:  { fontSize:14, color: COLORS.orange, fontWeight:'700' },
  guestInfo:   { flexDirection:'row', gap:8, backgroundColor: COLORS.bodyBg, borderRadius: RADIUS.md, padding:14, marginBottom:14 },
  guestInfoTxt: { flex:1, fontSize:12, color: COLORS.muted, lineHeight:18 },
  guestBtn:    { alignItems:'center' },
  guestBtnTxt: { fontSize:14, color: COLORS.muted, fontWeight:'600' },
});

export default LoginScreen;


// =====================================================
