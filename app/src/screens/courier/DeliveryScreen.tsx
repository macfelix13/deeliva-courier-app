import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CourierTabParamList, CourierStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { ActiveDelivery } from '../../api/types';
import { usePolling } from '../../state/usePolling';
import { Screen } from '../../theme/Screen';
import { Blueprint, Button, Field, Heading, Kicker, MutedText } from '../../theme/primitives';
import { colors, fonts } from '../../theme/tokens';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CourierTabParamList, 'Active'>,
  NativeStackScreenProps<CourierStackParamList>
>;

export function DeliveryScreen({}: Props) {
  const { data, refetch } = usePolling<{ active: ActiveDelivery | null }>(() => api.getActiveDelivery(), 4000);
  const [receiver, setReceiver] = useState('');

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  useEffect(() => { setReceiver(data?.active?.receiver ?? ''); }, [data?.active?.ref, data?.active?.isProof]);

  const active = data?.active ?? null;

  const advance = () => api.advanceDelivery().then(refetch);
  const setProof = (proof: 'photo' | 'sign') => api.patchActiveDelivery({ proof }).then(refetch);
  const commitReceiver = (text: string) => {
    setReceiver(text);
    api.patchActiveDelivery({ receiver: text }).catch(() => {});
  };

  if (!active) {
    return (
      <Screen>
        <View style={{ paddingHorizontal: 18, paddingTop: 40, alignItems: 'center' }}>
          <Kicker>No active job</Kicker>
          <MutedText style={{ fontSize: 13, marginTop: 8, textAlign: 'center' }}>
            Accept a job from the Jobs tab to start a delivery run.
          </MutedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Kicker>Active job · {active.ref}</Kicker>
            <Heading size={30} style={{ marginTop: 6 }}>{active.title}</Heading>
          </View>
          <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, fontSize: 12 }}>{active.stepLabel}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 3, marginTop: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ flex: 1, height: 3, backgroundColor: i <= active.stepIndex ? colors.accent : colors.divider }} />
          ))}
        </View>
      </View>

      <Blueprint style={{ marginHorizontal: 18, marginTop: 18, padding: 16 }}>
        <Kicker>{active.addrKicker}</Kicker>
        <Text style={{ fontFamily: fonts.heading, fontSize: 22, marginTop: 6, color: colors.text }}>{active.addr}</Text>
        <MutedText style={{ fontSize: 12.5, marginTop: 8 }}>{active.note}</MutedText>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          <Button variant="secondary" flex={1}>Navigate</Button>
          <Button variant="secondary" flex={1}>Call</Button>
        </View>
      </Blueprint>

      {active.isScan && (
        <Blueprint style={{ marginHorizontal: 18, marginTop: 18, height: 172, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neutral100 }}>
          <View style={{ width: 150, height: 56, backgroundColor: colors.text, opacity: 0.15 }} />
          <Text style={{ fontFamily: fonts.mono, marginTop: 12, color: colors.accent700 }}>{active.ref} · 1 of 1</Text>
          <MutedText style={{ fontSize: 11.5, marginTop: 4 }}>Hold steady over the label</MutedText>
        </Blueprint>
      )}

      {active.isProof && (
        <View style={{ paddingHorizontal: 18, marginTop: 18 }}>
          <Kicker>Proof of delivery</Kicker>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            {(['photo', 'sign'] as const).map((p) => {
              const selected = active.proof === p;
              return (
                <Pressable key={p} onPress={() => setProof(p)} style={{ flex: 1 }}>
                  <View style={{
                    borderWidth: 1, borderColor: selected ? colors.accent : colors.divider,
                    backgroundColor: selected ? colors.accent100 : 'transparent',
                    padding: 16, minHeight: 92, justifyContent: 'space-between',
                  }}>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: selected ? colors.accent700 : colors.neutral500 }}>
                      {selected ? 'CAPTURED' : 'tap to capture'}
                    </Text>
                    <View>
                      <Text style={{ fontFamily: fonts.heading, fontSize: 17, color: colors.text }}>{p === 'photo' ? 'Photo' : 'Signature'}</Text>
                      <MutedText style={{ fontSize: 11, marginTop: 3 }}>{p === 'photo' ? 'Left with reception' : 'Signed on the door'}</MutedText>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Field label="Received by" value={receiver} onChangeText={commitReceiver} placeholder="Name on the door" style={{ marginTop: 16 }} />
        </View>
      )}

      {active.isDone && (
        <View style={{ paddingHorizontal: 18, marginTop: 18 }}>
          <Blueprint borderColor={colors.accent900} style={{ padding: 18, backgroundColor: colors.accent900 }}>
            <Kicker color={colors.accent300}>Delivered</Kicker>
            <Text style={{ fontFamily: fonts.heading, fontSize: 30, marginTop: 8, color: '#fff' }}>{active.payout} added to today</Text>
            <Text style={{ fontFamily: fonts.mono, color: colors.accent200, marginTop: 8 }}>
              {active.ref} · signed by {receiver || 'recipient'}
            </Text>
          </Blueprint>
        </View>
      )}

      <View style={{ paddingHorizontal: 18, marginTop: 24 }}>
        <Button variant="primary" blueprint onPress={advance} style={{ height: 52 }}>{active.cta}</Button>
      </View>
    </Screen>
  );
}
