import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CourierTabParamList, CourierStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { JobsResponse } from '../../api/types';
import { usePolling } from '../../state/usePolling';
import { Screen } from '../../theme/Screen';
import { Blueprint, Button, Heading, Kicker, MutedText, Tag } from '../../theme/primitives';
import { colors, fonts } from '../../theme/tokens';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CourierTabParamList, 'Jobs'>,
  NativeStackScreenProps<CourierStackParamList>
>;

export function JobsScreen({ navigation }: Props) {
  const { data, refetch } = usePolling<JobsResponse>(() => api.getJobs(), 4000);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const toggleOnline = () => {
    if (!data) return;
    api.setOnline(!data.online).then(refetch);
  };

  const accept = (id: string) => api.acceptJob(id).then(() => {
    refetch();
    navigation.navigate('Tabs', { screen: 'Active' } as any);
  });
  const skip = (id: string) => api.skipJob(id).then(refetch);
  const refill = () => api.refillJobs().then(refetch);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Kicker>Leeds · shift ends 18:00</Kicker>
            <Heading size={30} style={{ marginTop: 6 }}>Jobs near you</Heading>
          </View>
          <Pressable onPress={toggleOnline} style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: data?.online ? colors.accent700 : colors.neutral500 }}>
              {data?.online ? 'ONLINE' : 'OFFLINE'}
            </Text>
            <View style={{
              width: 44, height: 22, borderWidth: 1, borderColor: colors.divider, padding: 2, marginTop: 5,
              flexDirection: 'row', justifyContent: data?.online ? 'flex-end' : 'flex-start',
              backgroundColor: data?.online ? colors.accent100 : 'transparent',
            }}>
              <View style={{ width: 16, height: 16, backgroundColor: data?.online ? colors.accent : colors.neutral300 }} />
            </View>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 18, borderWidth: 1, borderColor: colors.divider }}>
          {(data?.stats ?? []).map((s, i) => (
            <View key={s.k} style={{ flex: 1, padding: 12, borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: colors.divider }}>
              <Text style={{ fontFamily: fonts.heading, fontSize: 21, color: colors.text }}>{s.v}</Text>
              <MutedText style={{ fontSize: 10.5, marginTop: 3 }}>{s.k}</MutedText>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 18, borderTopWidth: 1, borderTopColor: colors.divider }}>
        {(data?.list ?? []).map((j) => (
          <View key={j.id} style={{ padding: 18, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Tag tone="accent">{j.kind}</Tag>
                  <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, fontSize: 11 }}>{j.ref}</Text>
                </View>
                <Text style={{ fontFamily: fonts.heading, fontSize: 20, color: colors.text, marginTop: 8 }}>{j.pickup}</Text>
                <MutedText style={{ fontSize: 12.5, marginTop: 2 }}>→ {j.drop}</MutedText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: fonts.heading, fontSize: 22, color: colors.text }}>{j.pay}</Text>
                <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, fontSize: 11, marginTop: 4 }}>{j.dist}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Button variant="secondary" flex={1} onPress={() => skip(j.id)}>Pass</Button>
              <Button variant="primary" blueprint flex={2} onPress={() => accept(j.id)}>Accept · {j.window}</Button>
            </View>
          </View>
        ))}
        {data?.empty && (
          <View style={{ padding: 46, alignItems: 'center' }}>
            <Kicker>Queue clear</Kicker>
            <MutedText style={{ fontSize: 13, marginTop: 8, textAlign: 'center' }}>No jobs left in this zone. New ones land every few minutes.</MutedText>
            <Button variant="secondary" onPress={refill} style={{ marginTop: 10, paddingHorizontal: 16 }}>Refresh queue</Button>
          </View>
        )}
      </View>
    </Screen>
  );
}
