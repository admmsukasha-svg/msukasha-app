import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet as CS2, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS as CC, RADIUS as CR, SHADOW as CSH } from '../constants';
import { getUser } from '../services/api';

const DEMO_MESSAGES = [
  { id: 'm1', text: 'Hi! Is this item still available?', sender: 'other', time: '10:32 AM' },
  { id: 'm2', text: 'Yes, still available! It\'s in excellent condition.', sender: 'me', time: '10:34 AM' },
  { id: 'm3', text: 'What\'s the lowest price? Any warranty?', sender: 'other', time: '10:35 AM' },
  { id: 'm4', text: 'Price is firm. I can give you a 7-day return guarantee if any issue arises.', sender: 'me', time: '10:36 AM' },
  { id: 'm5', text: 'Can we meet tomorrow for inspection?', sender: 'other', time: '2m ago' },
];

const AUTO_REPLIES = [
  'Thank you! I\'ll get back to you shortly.',
  'Sure! When would you like to meet?',
  'Can we discuss further details?',
  'Let me check and confirm.',
];

export default function ChatScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { conversation } = route.params || {};
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [input,    setInput]    = useState('');
  const [user,     setUser]     = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    (async () => setUser(await getUser()))();
  }, []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg = {
      id: 'm' + Date.now(),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    // Auto reply
    setTimeout(() => {
      const reply = {
        id: 'm' + (Date.now() + 1),
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        sender: 'other',
        time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
    }, 1200);
  };

  const renderMessage = ({ item }) => (
    <View style={[cs2.msgWrap, item.sender === 'me' ? cs2.msgWrapMe : cs2.msgWrapOther]}>
      <View style={[cs2.bubble, item.sender === 'me' ? cs2.bubbleMe : cs2.bubbleOther]}>
        <Text style={[cs2.bubbleTxt, item.sender === 'me' && { color: '#fff' }]}>{item.text}</Text>
        <Text style={[cs2.bubbleTime, item.sender === 'me' && { color: 'rgba(255,255,255,0.7)' }]}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[cs2.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={cs2.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={cs2.backBtn}>
            <Ionicons name="arrow-back" size={22} color={CC.dark} />
          </TouchableOpacity>
          <View style={[cs2.headerAvatar, { backgroundColor: conversation?.color || CC.orange }]}>
            <Text style={cs2.headerAvatarTxt}>{conversation?.initials || 'S'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={cs2.headerName}>{conversation?.name || 'Seller'}</Text>
            <Text style={[cs2.headerStatus, { color: conversation?.online ? '#22c55e' : CC.muted }]}>
              {conversation?.online ? '● Online' : '● Offline'}
            </Text>
          </View>
          <TouchableOpacity style={cs2.callBtn} onPress={() => {}}>
            <Ionicons name="call-outline" size={20} color={CC.orange} />
          </TouchableOpacity>
        </View>

        {/* Product reference */}
        {conversation?.product && (
          <View style={cs2.productRef}>
            <Ionicons name="pricetag-outline" size={13} color={CC.orange} />
            <Text style={cs2.productRefTxt}>Re: {conversation.product}</Text>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={i => i.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* Quick replies */}
        <View style={cs2.quickReplies}>
          {['Is it available?', 'What\'s the price?', 'Can we meet?'].map((q, i) => (
            <TouchableOpacity key={i} style={cs2.quickReply} onPress={() => setInput(q)}>
              <Text style={cs2.quickReplyTxt}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input */}
        <View style={[cs2.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={cs2.input}
            placeholder="Type a message..."
            placeholderTextColor={CC.muted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[cs2.sendBtn, !input.trim() && { backgroundColor: CC.border }]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={18} color={input.trim() ? '#fff' : CC.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const cs2 = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: CC.border },
  backBtn:        { marginRight: 4 },
  headerAvatar:   { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerAvatarTxt:{ fontSize: 14, fontWeight: '900', color: '#fff' },
  headerName:     { fontSize: 15, fontWeight: '800', color: CC.dark },
  headerStatus:   { fontSize: 11, fontWeight: '600', marginTop: 1 },
  callBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: CC.orangeLight, alignItems: 'center', justifyContent: 'center' },
  productRef:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: CC.orangeLight, borderBottomWidth: 1, borderBottomColor: CC.border },
  productRefTxt:  { fontSize: 12, color: CC.orange, fontWeight: '600' },
  msgWrap:        { flexDirection: 'row' },
  msgWrapMe:      { justifyContent: 'flex-end' },
  msgWrapOther:   { justifyContent: 'flex-start' },
  bubble:         { maxWidth: '75%', padding: 12, borderRadius: 16 },
  bubbleMe:       { backgroundColor: CC.orange, borderBottomRightRadius: 4 },
  bubbleOther:    { backgroundColor: CC.bodyBg, borderBottomLeftRadius: 4 },
  bubbleTxt:      { fontSize: 14, color: CC.text, lineHeight: 20 },
  bubbleTime:     { fontSize: 10, color: CC.muted, marginTop: 4, textAlign: 'right' },
  quickReplies:   { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: CC.border },
  quickReply:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: CC.border, backgroundColor: '#fff' },
  quickReplyTxt:  { fontSize: 12, color: CC.dark, fontWeight: '600' },
  inputBar:       { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 12, paddingTop: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: CC.border },
  input:          { flex: 1, backgroundColor: CC.bodyBg, borderRadius: CR.md, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: CC.text, maxHeight: 100, borderWidth: 1, borderColor: CC.border },
  sendBtn:        { width: 42, height: 42, borderRadius: 21, backgroundColor: CC.orange, alignItems: 'center', justifyContent: 'center' },
});
