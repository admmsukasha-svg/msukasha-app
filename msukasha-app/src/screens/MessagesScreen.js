import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOW } from '../constants';
import { getUser } from '../services/api';

const DEMO_CONVERSATIONS = [
  {
    id: 'c1',
    name: 'Ahmed Khan',
    avatar: null,
    initials: 'AK',
    color: '#ff6600',
    lastMsg: 'Is the iPhone still available?',
    time: '2m ago',
    unread: 2,
    online: true,
    product: 'Used iPhone 12 Pro',
  },
  {
    id: 'c2',
    name: 'Faisalabad Fabrics Co.',
    avatar: null,
    initials: 'FF',
    color: '#0066cc',
    lastMsg: 'MOQ for cotton t-shirts is 100 pcs',
    time: '1h ago',
    unread: 0,
    online: false,
    product: 'Cotton T-Shirts Wholesale',
    verified: true,
  },
  {
    id: 'c3',
    name: 'Sialkot Sports Goods',
    avatar: null,
    initials: 'SG',
    color: '#22c55e',
    lastMsg: 'We can ship to Karachi in 3 days',
    time: 'Yesterday',
    unread: 0,
    online: false,
    product: 'FIFA Footballs Bulk',
    verified: true,
  },
  {
    id: 'c4',
    name: 'Bilal Ahmed',
    avatar: null,
    initials: 'BA',
    color: '#8b5cf6',
    lastMsg: 'Price is negotiable, come see the bike',
    time: '2 days ago',
    unread: 1,
    online: true,
    product: 'Honda CD 70 2024',
  },
];

export default function MessagesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [user,         setUser]         = useState(null);
  const [conversations,setConversations]= useState(DEMO_CONVERSATIONS);
  const [searchQuery,  setSearchQuery]  = useState('');

  useEffect(() => {
    (async () => setUser(await getUser()))();
  }, []);

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.product?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.guestWrap}>
          <Ionicons name="chatbubbles-outline" size={64} color={COLORS.border} />
          <Text style={styles.guestTitle}>Sign in to view Messages</Text>
          <Text style={styles.guestSub}>Login to chat with buyers and sellers on MSukasha.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnTxt}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.convItem}
      onPress={() => navigation.navigate('Chat', { conversation: item })}
      activeOpacity={0.85}
    >
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { backgroundColor: item.color }]}>
          <Text style={styles.avatarTxt}>{item.initials}</Text>
        </View>
        {item.online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.convInfo}>
        <View style={styles.convTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
            <Text style={styles.convName} numberOfLines={1}>{item.name}</Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={13} color="#15803d" />
            )}
          </View>
          <Text style={styles.convTime}>{item.time}</Text>
        </View>
        {item.product && (
          <Text style={styles.convProduct} numberOfLines={1}>
            Re: {item.product}
          </Text>
        )}
        <View style={styles.convBottomRow}>
          <Text style={styles.convLastMsg} numberOfLines={1}>{item.lastMsg}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadTxt}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.unreadTotal}>
          <Text style={styles.unreadTotalTxt}>
            {conversations.reduce((s, c) => s + c.unread, 0)} unread
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={COLORS.muted} style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={COLORS.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderConversation}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Ionicons name="chatbubble-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyTxt}>No conversations yet</Text>
            <Text style={{ color: COLORS.muted, fontSize: 13 }}>
              Message a seller from any product listing.
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle:  { fontSize: 20, fontWeight: '900', color: COLORS.dark },
  unreadTotal:  { backgroundColor: COLORS.orange, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  unreadTotalTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  guestWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  guestTitle:   { fontSize: 20, fontWeight: '800', color: COLORS.dark, marginTop: 16, marginBottom: 8 },
  guestSub:     { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  loginBtn:     { backgroundColor: COLORS.orange, paddingHorizontal: 32, paddingVertical: 13, borderRadius: RADIUS.md },
  loginBtnTxt:  { color: '#fff', fontSize: 15, fontWeight: '800' },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: COLORS.bodyBg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  searchInput:  { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: COLORS.text },
  convItem:     { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  avatarWrap:   { position: 'relative' },
  avatar:       { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:    { fontSize: 18, fontWeight: '900', color: '#fff' },
  onlineDot:    { position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#fff' },
  convInfo:     { flex: 1 },
  convTopRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  convName:     { fontSize: 14, fontWeight: '800', color: COLORS.dark, flex: 1 },
  convTime:     { fontSize: 11, color: COLORS.muted },
  convProduct:  { fontSize: 11, color: COLORS.orange, fontWeight: '600', marginBottom: 3 },
  convBottomRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convLastMsg:  { flex: 1, fontSize: 13, color: COLORS.muted },
  unreadBadge:  { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.orange, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  unreadTxt:    { color: '#fff', fontSize: 10, fontWeight: '900' },
  separator:    { height: 1, backgroundColor: COLORS.border, marginLeft: 78 },
  emptyWrap:    { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTxt:     { fontSize: 16, fontWeight: '700', color: COLORS.muted },
});
