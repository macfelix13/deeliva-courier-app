import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerTabParamList, CustomerStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { TrackingResponse } from '../../api/types';
import { usePolling } from '../../state/usePolling';
import { Screen } from '../../theme/Screen';
import { Blueprint, Button, DividerRow, Heading, Kicker, MutedText } from '../../theme/primitives';
import { VanIcon } from '../../theme/icons';
import { colors, fonts } from '../../theme/tokens';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, 'Track'>,
  NativeStackScreenProps<CustomerStackParamList>
>;

const DOT_PATH: [number, number][] = [[40, 232], [92, 196], [92, 120], [206, 120], [296, 62]];

export function TrackingScreen({ navigation }: Props) {
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  const loadActive = useCallback(() => {
    api.getHome().then((h) => { setOrderId(h.active?.orderId ?? null); setReady(true); }).catch(() => setReady(true));
  }, []);

  useFocusEffect(useCallback(() => { loadActive(); }, [loadActive]));

  const { data } = usePolling<TrackingResponse | null>(
    () => (orderId ? api.getTracking(orderId) : Promise.resolve(null)),
    3000,
    [orderId],
  );

  if (ready && !orderId) {
    return (
      <Screen>
        <View style={{ paddingHorizontal: 18, paddingTop: 40, alignItems: 'center' }}>
          <Kicker>Nothing in transit</Kicker>
          <MutedText style={{ fontSize: 13, marginTop: 8, textAlign: 'center' }}>
            Book a parcel and it will show up here with a live route.
          </MutedText>
        </View>
      </Screen>
    );
  }

  if (!data) return <Screen><View /></Screen>;

  const dot = DOT_PATH[Math.min(DOT_PATH.length - 1, data.stage)];

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          <Kicker>{data.ref}</Kicker>
          <Heading size={30} style={{ marginTop: 6 }}>{data.stageLabel}</Heading>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: fonts.heading, fontSize: 38, color: colors.accent700 }}>{data.eta}</Text>
          <Kicker>min</Kicker>
        </View>
      </View>

      <Blueprint style={{ marginHorizontal: 18, marginTop: 18, height: 262, overflow: 'hidden', backgroundColor: colors.neutral100 }}>
        <Svg viewBox="0 0 340 262" width="100%" height="100%" style={{ position: 'absolute' }}>
          <Path d="M0 196 L92 196 L92 120 L206 120 L206 62 L340 62" stroke={colors.neutral400} strokeWidth={9} fill="none" />
          <Path d="M0 108 L128 108 L128 240" stroke={colors.neutral400} strokeWidth={7} fill="none" />
          <Path d="M40 232 L40 196 L92 196 L92 120 L206 120 L206 62 L296 62" stroke={colors.accent} strokeWidth={2.5} strokeDasharray="7 5" fill="none" />
          <Circle cx={40} cy={232} r={5} fill={colors.accent900} />
          <Circle cx={296} cy={62} r={5} fill="none" stroke={colors.accent900} strokeWidth={2} />
        </Svg>
        <View style={{ position: 'absolute', left: dot[0] - 15, top: dot[1] - 15, width: 30, height: 30, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
          <VanIcon size={16} color="#fff" />
        </View>
        <Text style={{ position: 'absolute', bottom: 8, left: 10, fontFamily: fonts.mono, fontSize: 11, color: colors.neutral700 }}>
          {data.route.pickup.split(',').pop()?.trim()} → {data.route.drop.split(',').pop()?.trim()}
        </Text>
      </Blueprint>

      <View style={{ paddingHorizontal: 18, marginTop: 20 }}>
        <Kicker style={{ marginBottom: 2 }}>Progress</Kicker>
        {data.steps.map((s) => {
          const reached = s.stage <= data.stage;
          const current = s.stage === data.stage;
          return (
            <View key={s.stage} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
              <View style={{
                width: 26, height: 26, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
                borderColor: reached ? colors.accent : colors.divider,
                backgroundColor: current ? colors.accent100 : (s.stage < data.stage ? colors.accent : 'transparent'),
              }}>
                <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: s.stage < data.stage ? '#fff' : colors.accent700 }}>
                  {String(s.stage + 1).padStart(2, '0')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.heading, fontSize: 17, color: reached ? colors.text : colors.neutral500 }}>{s.label}</Text>
                <MutedText style={{ fontSize: 12.5 }}>{s.note}</MutedText>
              </View>
              <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, fontSize: 11 }}>{s.time}</Text>
            </View>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 18, marginTop: 20 }}>
        <Blueprint style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, backgroundColor: colors.neutral300, alignItems: 'center', justifyContent: 'center' }}>
            <VanIcon size={20} color={colors.neutral700} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 17, color: colors.text }}>{data.courier.name}</Text>
            <MutedText style={{ fontSize: 12 }}>Your courier · {data.courier.rating} ★ · {data.courier.drops} drops</MutedText>
          </View>
          <Button variant="secondary" onPress={() => navigation.navigate('Chat')}>Message</Button>
        </Blueprint>
      </View>
    </Screen>
  );
}
