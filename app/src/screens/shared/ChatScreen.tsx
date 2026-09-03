import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import { ChatMessage } from '../../api/types';
import { useRole } from '../../state/RoleContext';
import { usePolling } from '../../state/usePolling';
import { Kicker } from '../../theme/primitives';
import { colors, fonts } from '../../theme/tokens';

const QUICK_REPLIES: Record<'customer' | 'courier', string[]> = {
  customer: ['Where is my parcel?', 'Change the address', 'It arrived damaged'],
  courier: ['Address looks wrong', 'Recipient not answering', 'Running late'],
};

export function ChatScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { role } = useRole();
  const [draft, setDraft] = useState('');
  const { data, refetch } = usePolling<{ messages: ChatMessage[] }>(() => api.getChat(role), 2500, [role]);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const send = (text?: string) => {
    const body = (text ?? draft).trim();
    if (!body) return;
    setDraft('');
    api.sendChat(role, body).then(refetch);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 10 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingHorizontal: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.divider, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          <Kicker>Usually replies in 2 min</Kicker>
          <Text style={{ fontFamily: fonts.heading, fontSize: 20, marginTop: 4, color: colors.text }}>Support</Text>
        </View>
        <Text onPress={() => navigation.goBack()} style={{ fontFamily: fonts.mono, color: colors.accent700 }}>Close</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 10 }}>
        {(data?.messages ?? []).map((m) => (
          <View
            key={m.id}
            style={{
              alignSelf: m.fromMe ? 'flex-end' : 'flex-start', maxWidth: '78%',
              paddingHorizontal: 13, paddingVertical: 10,
              backgroundColor: m.fromMe ? colors.accent : colors.bg,
              borderWidth: 1, borderColor: m.fromMe ? colors.accent : colors.divider,
            }}
          >
            <Text style={{ color: m.fromMe ? '#fff' : colors.text, fontSize: 14, lineHeight: 20, fontFamily: fonts.body }}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 18, paddingBottom: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {QUICK_REPLIES[role].map((q) => (
          <Pressable key={q} onPress={() => send(q)} style={{ borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ color: colors.accent, fontSize: 11, fontFamily: fonts.bodyMedium }}>{q}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{
        flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingTop: 12, paddingBottom: insets.bottom + 12,
        borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.bg,
      }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => send()}
          placeholder="Write a message"
          placeholderTextColor={colors.neutral500}
          style={{ flex: 1, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.neutral100, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: colors.text, fontFamily: fonts.body }}
        />
        <Pressable onPress={() => send()} style={{ width: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>→</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
