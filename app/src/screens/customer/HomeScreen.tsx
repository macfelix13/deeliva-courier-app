import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerTabParamList, CustomerStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { HomeResponse } from '../../api/types';
import { Screen } from '../../theme/Screen';
import { Blueprint, DividerRow, Heading, Kicker, MutedText, Tag } from '../../theme/primitives';
import { Icon } from '../../theme/icons';
import { colors, fonts } from '../../theme/tokens';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, 'Send'>,
  NativeStackScreenProps<CustomerStackParamList>
>;

const CELLS = [
  { num: '01', title: 'New parcel', sub: 'Measure, price and book', target: 'NewParcel' as const },
  { num: '02', title: 'Track', sub: 'Follow the live route', target: 'Track' as const, isTab: true },
  { num: '03', title: 'Find a shipment', sub: 'Search past and current', target: 'Search' as const },
  { num: '04', title: 'Get help', sub: 'Chat with support', target: 'Chat' as const },
];

export function HomeScreen({ navigation }: Props) {
  const [data, setData] = React.useState<HomeResponse | null>(null);

  const load = useCallback(() => {
    api.getHome().then(setData).catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const goCell = (target: (typeof CELLS)[number]) => {
    if (target.isTab) navigation.navigate('Track');
    else navigation.navigate(target.target as any);
  };

  return (
    <Screen contentStyle={{ paddingHorizontal: 0 }}>
      <View style={{ paddingHorizontal: 18 }}>
        <Kicker>Good morning, {data?.greetingName ?? '—'}</Kicker>
        <Heading size={32} style={{ marginTop: 6 }}>Send something</Heading>
      </View>

      {data?.active && (
        <Pressable onPress={() => navigation.navigate('Track')}>
          <Blueprint borderColor={colors.accent900} style={styles.activeCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Kicker color={colors.accent300}>In transit</Kicker>
                <Text style={styles.activeStage}>{data.active.stageLabel}</Text>
                <Text style={[styles.activeRef, { color: colors.accent200 }]}>{data.active.ref}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.activeEta}>{data.active.etaMinutes}</Text>
                <Kicker color={colors.accent300}>min away</Kicker>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 3, marginTop: 14 }}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ flex: 1, height: 3, backgroundColor: i <= data.active!.stage ? '#fff' : 'rgba(255,255,255,0.28)' }} />
              ))}
            </View>
          </Blueprint>
        </Pressable>
      )}

      <View style={{ paddingHorizontal: 18, marginTop: 20 }}>
        {CELLS.map((c) => (
          <Pressable key={c.num} onPress={() => goCell(c)}>
            <DividerRow>
              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                <Text style={[styles.cellNum]}>{c.num}</Text>
                <View>
                  <Text style={styles.cellTitle}>{c.title}</Text>
                  <MutedText style={{ fontSize: 12 }}>{c.sub}</MutedText>
                </View>
              </View>
              <Icon name="chevronRight" size={16} color={colors.accent700} />
            </DividerRow>
          </Pressable>
        ))}
      </View>

      <View style={{ paddingHorizontal: 18, marginTop: 22 }}>
        <Kicker style={{ marginBottom: 4 }}>Saved routes</Kicker>
        {(data?.routes ?? []).map((r) => (
          <Pressable key={r.name} onPress={() => navigation.navigate('NewParcel')}>
            <DividerRow>
              <View>
                <Text style={{ fontSize: 14, color: colors.text, fontFamily: fonts.body }}>{r.name}</Text>
                <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>{r.leg}</Text>
              </View>
              <Tag tone="outline">from £{r.fromPrice.toFixed(2)}</Tag>
            </DividerRow>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  activeCard: { marginHorizontal: 18, marginTop: 18, padding: 16, backgroundColor: colors.accent900 },
  activeStage: { fontFamily: fonts.heading, fontSize: 24, marginTop: 6, color: '#fff' },
  activeRef: { fontFamily: fonts.mono, fontSize: 11, marginTop: 6 },
  activeEta: { fontFamily: fonts.heading, fontSize: 30, color: '#fff' },
  cellNum: { fontFamily: fonts.mono, fontSize: 11, color: colors.accent700, width: 22 },
  cellTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.text },
});
