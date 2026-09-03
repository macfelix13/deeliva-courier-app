import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { Screen } from '../../theme/Screen';
import { Blueprint, DividerRow, Heading, Kicker, MutedText, Tag } from '../../theme/primitives';
import { colors, fonts } from '../../theme/tokens';

type Props = NativeStackScreenProps<CustomerStackParamList, 'OrderDetail'>;

export function OrderDetailScreen({ route, navigation }: Props) {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    api.getOrder(route.params.orderId).then(setOrder).catch(() => {});
  }, [route.params.orderId]);

  if (!order) {
    return (
      <Screen>
        <View style={{ paddingHorizontal: 18 }}>
          <Text onPress={() => navigation.goBack()} style={{ fontFamily: fonts.mono, color: colors.accent700 }}>← Back</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18 }}>
        <Text onPress={() => navigation.goBack()} style={{ fontFamily: fonts.mono, color: colors.accent700 }}>← Back</Text>
        <Kicker style={{ marginTop: 14 }}>{order.ref}</Kicker>
        <Heading size={30} style={{ marginTop: 6 }}>{order.title}</Heading>
        {!!order.blurb && <MutedText style={{ fontSize: 13.5, marginTop: 8 }}>{order.blurb}</MutedText>}
        <View style={{ marginTop: 10 }}>
          <Tag tone="accent">{order.statusLabel}</Tag>
        </View>
      </View>

      <View style={{ paddingHorizontal: 18, marginTop: 20 }}>
        <Kicker>Route</Kicker>
        <DividerRow>
          <MutedText style={{ fontSize: 13 }}>Pickup</MutedText>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, flexShrink: 1, textAlign: 'right' }}>{order.pickupAddress}</Text>
        </DividerRow>
        <DividerRow>
          <MutedText style={{ fontSize: 13 }}>Drop-off</MutedText>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, flexShrink: 1, textAlign: 'right' }}>{order.dropAddress}</Text>
        </DividerRow>
        <DividerRow>
          <MutedText style={{ fontSize: 13 }}>Window</MutedText>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11 }}>{order.window}</Text>
        </DividerRow>

        <Kicker style={{ marginTop: 22 }}>Parcels</Kicker>
        {order.items.map((i: any) => (
          <Blueprint key={i.id} style={{ marginTop: 10, padding: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.text }}>{i.name}</Text>
                <MutedText style={{ fontSize: 12, marginTop: 3 }}>{i.weightKg} kg{i.cover ? ' · cover £500' : ''}</MutedText>
              </View>
              <Text style={{ fontFamily: fonts.heading, fontSize: 17, color: colors.text }}>£{i.price.toFixed(2)}</Text>
            </View>
          </Blueprint>
        ))}

        <DividerRow style={{ marginTop: 16, borderBottomWidth: 0 }}>
          <Text style={{ fontSize: 15, color: colors.text, fontFamily: fonts.bodySemiBold }}>Total</Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 15, color: colors.text }}>£{order.total.toFixed(2)}</Text>
        </DividerRow>
      </View>
    </Screen>
  );
}
