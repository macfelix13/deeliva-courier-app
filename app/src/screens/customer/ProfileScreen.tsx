import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerTabParamList, CustomerStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { ProfileResponse } from '../../api/types';
import { useRole } from '../../state/RoleContext';
import { Screen } from '../../theme/Screen';
import { Button, DividerRow, Heading, MutedText } from '../../theme/primitives';
import { colors, fonts } from '../../theme/tokens';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, 'You'>,
  NativeStackScreenProps<CustomerStackParamList>
>;

export function ProfileScreen({ navigation }: Props) {
  const { setRole } = useRole();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  useFocusEffect(useCallback(() => {
    api.getProfile('customer').then(setProfile).catch(() => {});
  }, []));

  if (!profile) return <Screen><View /></Screen>;

  return (
    <Screen contentStyle={{ paddingHorizontal: 0 }}>
      <View style={{ paddingHorizontal: 18 }}>
        <Heading size={30}>{profile.name}</Heading>
        <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, marginTop: 4 }}>{profile.sub}</Text>
      </View>

      <View style={{ flexDirection: 'row', marginVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider }}>
        {profile.stats.map((s, i) => (
          <View key={s.k} style={{ flex: 1, padding: 14, borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: colors.divider }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 24, color: colors.text }}>{s.v}</Text>
            <MutedText style={{ fontSize: 11, marginTop: 4 }}>{s.k}</MutedText>
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: 18 }}>
        {profile.rows.map((r) => (
          <DividerRow key={r.id}>
            <View>
              <Text
                style={{ fontSize: 14.5, color: colors.text, fontFamily: fonts.body }}
                onPress={r.val === 'chat' ? () => navigation.navigate('Chat') : undefined}
              >
                {r.label}
              </Text>
              <MutedText style={{ fontSize: 12 }}>{r.note}</MutedText>
            </View>
            <Text style={{ fontFamily: fonts.mono, color: colors.accent700, fontSize: 12 }}>{r.val}</Text>
          </DividerRow>
        ))}

        <Button variant="secondary" onPress={() => setRole('courier')} style={{ marginTop: 18 }}>
          Switch to courier account
        </Button>
        <Button
          variant="ghost"
          onPress={() => navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Onboarding' }] })}
          style={{ marginTop: 8 }}
        >
          Sign out
        </Button>
      </View>
    </Screen>
  );
}
