import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet as PS, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as PC, RADIUS as PR, SHADOW as PSH } from '../constants';
import { apiPostAd, getUser } from '../services/api';

const CATS = ['Electronics','Vehicles','Fashion','Home & Living','Sports','Books','Tools','Other'];

export default function PostAdScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [user,      setUser]     = useState(null);
  const [step,      setStep]     = useState(1);
  const [category,  setCategory] = useState('');
  const [title,     setTitle]    = useState('');
  const [price,     setPrice]    = useState('');
  const [condition, setCondition]= useState('');
  const [city,      setCity]     = useState('');
  const [area,      setArea]     = useState('');
  const [desc,      setDesc]     = useState('');
  const [name,      setName]     = useState('');
  const [phone,     setPhone]    = useState('');
  const [photos,    setPhotos]   = useState([]);
  const [loading,   setLoading]  = useState(false);
  const [success,   setSuccess]  = useState(false);
  const [adId,      setAdId]     = useState('');

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
      if (u) { setName(u.name || ''); setPhone(u.phone || ''); }
    })();
  }, []);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 8,
    });
    if (!result.canceled) {
      setPhotos(result.assets.slice(0, 8));
    }
  };

  const handlePublish = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Required', 'Please fill your name and phone.'); return;
    }
    setLoading(true);
    try {
      const data = await apiPostAd({
        title, price: parseFloat(price),
        category, condition, city, area, desc,
        sellerName: name, sellerPhone: phone,
        uid: user?.uid || user?._id || 'guest',
        status: 'active',
      });
      setAdId(data.adId || 'MS-AD-' + Date.now().toString().slice(-6));
      setSuccess(true);
    } catch(e) {
      Alert.alert('Error', e.message || 'Failed to post ad. Please try again.');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <View style={[ps.container, { paddingTop: insets.top }]}>
        <View style={ps.header}>
          <Text style={ps.headerTitle}>Post Free Ad</Text>
        </View>
        <View style={ps.guestWrap}>
          <Ionicons name="camera-outline" size={64} color={PC.border} />
          <Text style={ps.guestTitle}>Login to Post an Ad</Text>
          <Text style={ps.guestSub}>Create a free account to list your items and reach thousands of buyers.</Text>
          <TouchableOpacity style={ps.loginBtn} onPress={() => navigation.navigate('Login', { redirectTo: 'PostAd' })}>
            <Text style={ps.loginBtnTxt}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (success) {
    return (
      <View style={[ps.container, ps.centered, { paddingTop: insets.top }]}>
        <View style={ps.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
        </View>
        <Text style={ps.successTitle}>Ad Posted Successfully!</Text>
        <Text style={ps.successSub}>Your ad is now live on MSukasha.</Text>
        <Text style={ps.adId}>Ad ID: <Text style={{ color: PC.orange }}>{adId}</Text></Text>
        <TouchableOpacity style={ps.doneBtn} onPress={() => navigation.navigate('C2C')}>
          <Text style={ps.doneBtnTxt}>View All Ads</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setSuccess(false); setStep(1); setTitle(''); setPrice(''); setCategory(''); setDesc(''); setPhotos([]); }} style={{ marginTop: 12 }}>
          <Text style={{ color: PC.muted, fontWeight: '600' }}>Post Another Ad</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* Step indicators */
  const STEPS = ['Category','Details','Photos','Contact'];

  return (
    <View style={[ps.container, { paddingTop: insets.top }]}>
      <View style={ps.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={() => setStep(s => s - 1)}>
            <Ionicons name="arrow-back" size={22} color={PC.dark} />
          </TouchableOpacity>
        ) : <View style={{ width: 22 }} />}
        <Text style={ps.headerTitle}>Post Free Ad</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Step Bar */}
      <View style={ps.stepBar}>
        {STEPS.map((s, i) => (
          <View key={i} style={ps.stepItem}>
            <View style={[ps.stepCircle, step > i + 1 ? ps.stepDone : step === i + 1 ? ps.stepActive : ps.stepPending]}>
              {step > i + 1
                ? <Ionicons name="checkmark" size={12} color="#fff" />
                : <Text style={[ps.stepNum, step === i + 1 && { color: '#fff' }]}>{i + 1}</Text>
              }
            </View>
            <Text style={[ps.stepLabel, step === i + 1 && { color: PC.orange }]}>{s}</Text>
            {i < STEPS.length - 1 && <View style={[ps.stepLine, step > i + 1 && ps.stepLineDone]} />}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">

        {/* STEP 1: Category */}
        {step === 1 && (
          <>
            <Text style={ps.stepTitle}>Select a Category *</Text>
            <View style={ps.catGrid}>
              {CATS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[ps.catCard, category === c && ps.catCardActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[ps.catCardTxt, category === c && { color: PC.orange }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[ps.nextBtn, !category && ps.nextBtnDisabled]}
              onPress={() => { if (category) setStep(2); else Alert.alert('Required', 'Select a category.'); }}
            >
              <Text style={ps.nextBtnTxt}>Next: Add Details →</Text>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 2: Details */}
        {step === 2 && (
          <>
            <View style={ps.field}>
              <Text style={ps.label}>Ad Title *</Text>
              <TextInput style={ps.input} placeholder="e.g. Used iPhone 13 Pro 256GB — Excellent Condition" placeholderTextColor={PC.muted} value={title} onChangeText={setTitle} />
            </View>
            <View style={ps.twoCol}>
              <View style={[ps.field, { flex: 1 }]}>
                <Text style={ps.label}>Price (PKR) *</Text>
                <TextInput style={ps.input} placeholder="95000" placeholderTextColor={PC.muted} value={price} onChangeText={setPrice} keyboardType="numeric" />
              </View>
              <View style={[ps.field, { flex: 1 }]}>
                <Text style={ps.label}>Condition *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {['New','Like New','Good','Fair'].map(c => (
                    <TouchableOpacity key={c} style={[ps.condPill, condition === c && ps.condPillActive]} onPress={() => setCondition(c)}>
                      <Text style={[ps.condPillTxt, condition === c && { color: '#fff' }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={ps.field}>
              <Text style={ps.label}>Description *</Text>
              <TextInput style={[ps.input, ps.textarea]} placeholder="Describe your item — condition, age, reason for selling..." placeholderTextColor={PC.muted} value={desc} onChangeText={setDesc} multiline numberOfLines={5} textAlignVertical="top" />
            </View>
            <View style={ps.twoCol}>
              <View style={[ps.field, { flex: 1 }]}>
                <Text style={ps.label}>City *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {['Karachi','Lahore','Islamabad','Faisalabad','Multan','Peshawar','Quetta'].map(c => (
                    <TouchableOpacity key={c} style={[ps.condPill, city === c && ps.condPillActive]} onPress={() => setCity(c)}>
                      <Text style={[ps.condPillTxt, city === c && { color: '#fff' }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={ps.field}>
              <Text style={ps.label}>Area / Locality</Text>
              <TextInput style={ps.input} placeholder="e.g. DHA Phase 5, Gulberg" placeholderTextColor={PC.muted} value={area} onChangeText={setArea} />
            </View>
            <TouchableOpacity
              style={[ps.nextBtn, (!title.trim() || !price || !condition || !city || !desc.trim()) && ps.nextBtnDisabled]}
              onPress={() => {
                if (!title.trim() || !price || !condition || !city || !desc.trim()) {
                  Alert.alert('Required', 'Please fill all fields.'); return;
                }
                setStep(3);
              }}
            >
              <Text style={ps.nextBtnTxt}>Next: Add Photos →</Text>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 3: Photos */}
        {step === 3 && (
          <>
            <TouchableOpacity style={ps.uploadBox} onPress={pickImages}>
              <Ionicons name="cloud-upload-outline" size={40} color={PC.muted} />
              <Text style={ps.uploadTitle}>Tap to Upload Photos</Text>
              <Text style={ps.uploadSub}>Up to 8 photos · JPG, PNG · Max 5MB each</Text>
            </TouchableOpacity>

            {photos.length > 0 && (
              <View style={ps.photosRow}>
                {photos.map((p, i) => (
                  <View key={i} style={ps.photoThumb}>
                    <Image source={{ uri: p.uri }} style={ps.photoThumbImg} />
                    <TouchableOpacity
                      style={ps.photoRemove}
                      onPress={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    >
                      <Ionicons name="close-circle" size={18} color={PC.red} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={ps.tipBox}>
              <Ionicons name="bulb-outline" size={16} color={PC.orange} />
              <Text style={ps.tipTxt}>Ads with photos get 3× more responses. Add clear photos from multiple angles.</Text>
            </View>

            <TouchableOpacity style={ps.nextBtn} onPress={() => setStep(4)}>
              <Text style={ps.nextBtnTxt}>Next: Contact Info →</Text>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 4: Contact & Publish */}
        {step === 4 && (
          <>
            <View style={ps.field}>
              <Text style={ps.label}>Full Name *</Text>
              <TextInput style={ps.input} placeholder="Your full name" placeholderTextColor={PC.muted} value={name} onChangeText={setName} />
            </View>
            <View style={ps.field}>
              <Text style={ps.label}>Phone / WhatsApp *</Text>
              <TextInput style={ps.input} placeholder="+92 300 0000000" placeholderTextColor={PC.muted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
            <View style={ps.summaryCard}>
              <Text style={ps.summaryTitle}>Ad Summary</Text>
              <Text style={ps.summaryRow2}><Text style={ps.summaryKey}>Category: </Text>{category}</Text>
              <Text style={ps.summaryRow2}><Text style={ps.summaryKey}>Title: </Text>{title}</Text>
              <Text style={ps.summaryRow2}><Text style={ps.summaryKey}>Price: </Text>Rs. {Number(price||0).toLocaleString()}</Text>
              <Text style={ps.summaryRow2}><Text style={ps.summaryKey}>Condition: </Text>{condition}</Text>
              <Text style={ps.summaryRow2}><Text style={ps.summaryKey}>City: </Text>{city}</Text>
              <Text style={ps.summaryRow2}><Text style={ps.summaryKey}>Photos: </Text>{photos.length} uploaded</Text>
            </View>
            <TouchableOpacity
              style={[ps.publishBtn, loading && { opacity: 0.7 }]}
              onPress={handlePublish}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={ps.publishBtnTxt}>Publish Ad — Free</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const ps = PS.create({
  container:     { flex: 1, backgroundColor: PC.bodyBg },
  centered:      { alignItems: 'center', justifyContent: 'center' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: PC.border },
  headerTitle:   { fontSize: 18, fontWeight: '800', color: PC.dark },
  guestWrap:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  guestTitle:    { fontSize: 20, fontWeight: '800', color: PC.dark, marginTop: 16, marginBottom: 8 },
  guestSub:      { fontSize: 14, color: PC.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  loginBtn:      { backgroundColor: PC.orange, paddingHorizontal: 32, paddingVertical: 13, borderRadius: PR.md },
  loginBtnTxt:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  stepBar:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: PC.border },
  stepItem:      { alignItems: 'center', position: 'relative', flex: 1 },
  stepCircle:    { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepActive:    { backgroundColor: PC.orange },
  stepDone:      { backgroundColor: '#22c55e' },
  stepPending:   { backgroundColor: PC.border },
  stepNum:       { fontSize: 11, fontWeight: '800', color: PC.muted },
  stepLabel:     { fontSize: 10, fontWeight: '600', color: PC.muted },
  stepLine:      { position: 'absolute', top: 13, left: '60%', right: '-60%', height: 2, backgroundColor: PC.border, zIndex: -1 },
  stepLineDone:  { backgroundColor: '#22c55e' },
  stepTitle:     { fontSize: 16, fontWeight: '800', color: PC.dark, marginBottom: 14 },
  catGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  catCard:       { paddingHorizontal: 16, paddingVertical: 10, borderRadius: PR.md, borderWidth: 1.5, borderColor: PC.border, backgroundColor: '#fff' },
  catCardActive: { borderColor: PC.orange, backgroundColor: PC.orangeLight },
  catCardTxt:    { fontSize: 13, fontWeight: '700', color: PC.dark },
  nextBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PC.orange, paddingVertical: 14, borderRadius: PR.md, marginTop: 8 },
  nextBtnDisabled:{ opacity: 0.5 },
  nextBtnTxt:    { color: '#fff', fontSize: 15, fontWeight: '800' },
  field:         { marginBottom: 16 },
  label:         { fontSize: 13, fontWeight: '700', color: PC.dark, marginBottom: 6 },
  input:         { backgroundColor: '#fff', borderRadius: PR.sm, borderWidth: 1.5, borderColor: PC.border, paddingVertical: 11, paddingHorizontal: 14, fontSize: 14, color: PC.text },
  textarea:      { height: 110, textAlignVertical: 'top' },
  twoCol:        { flexDirection: 'row', gap: 12 },
  condPill:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: PC.border, backgroundColor: '#fff' },
  condPillActive:{ backgroundColor: PC.orange, borderColor: PC.orange },
  condPillTxt:   { fontSize: 12, fontWeight: '600', color: PC.muted },
  uploadBox:     { borderWidth: 2, borderColor: PC.border, borderStyle: 'dashed', borderRadius: PR.md, padding: 36, alignItems: 'center', gap: 8, backgroundColor: '#fff', marginBottom: 16 },
  uploadTitle:   { fontSize: 15, fontWeight: '700', color: PC.dark },
  uploadSub:     { fontSize: 12, color: PC.muted },
  photosRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  photoThumb:    { width: 80, height: 80, borderRadius: PR.sm, overflow: 'hidden', position: 'relative' },
  photoThumbImg: { width: '100%', height: '100%' },
  photoRemove:   { position: 'absolute', top: 3, right: 3 },
  tipBox:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: PC.orangeLight, borderRadius: PR.md, padding: 12, marginBottom: 16 },
  tipTxt:        { flex: 1, fontSize: 12, color: PC.text, lineHeight: 18 },
  summaryCard:   { backgroundColor: '#fff', borderRadius: PR.md, padding: 16, borderWidth: 1, borderColor: PC.border, marginBottom: 16 },
  summaryTitle:  { fontSize: 15, fontWeight: '800', color: PC.dark, marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: PC.border },
  summaryRow2:   { fontSize: 13, color: PC.text, marginBottom: 6, lineHeight: 18 },
  summaryKey:    { fontWeight: '700', color: PC.dark },
  publishBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PC.orange, paddingVertical: 15, borderRadius: PR.md },
  publishBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  successIcon:   { width: 100, height: 100, borderRadius: 50, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle:  { fontSize: 22, fontWeight: '900', color: PC.dark, marginBottom: 8 },
  successSub:    { fontSize: 14, color: PC.muted, marginBottom: 8 },
  adId:          { fontSize: 14, color: PC.text, marginBottom: 24 },
  doneBtn:       { backgroundColor: PC.orange, paddingHorizontal: 32, paddingVertical: 13, borderRadius: PR.md },
  doneBtnTxt:    { color: '#fff', fontSize: 15, fontWeight: '800' },
});
