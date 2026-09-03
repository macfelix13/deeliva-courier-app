import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerTabParamList, CustomerStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { OrderListItem } from '../../api/types';
import { Screen } from '../../theme/Screen';
import { DividerRow, Heading, MutedText, Tag } from '../../theme/primitives';
import { colors, fonts } from '../../theme/tokens';

type Props = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, 'Orders'>,
  NativeStackScreenProps<CustomerStackParamList>
>;

const STATUS_TONE: Record<string, 'accent' | 'neutral' | 'outline'> = {
  'In transit': 'accent', Delivered: 'accent', Collected: 'outline', Refunded: 'neutral',
};

export function OrdersScreen({ navigation }: Props) {
  const [list, setList] = useState<OrderListItem[]>([]);
  const [summary, setSummary] = useState('');

  useFocusEffect(useCallback(() => {
    api.searchOrders('', []).then((r) => { setList(r.results); setSummary(r.summary); }).catch(() => {});
  }, []));

  const open = (item: OrderListItem) => {
    if (item.status === 'In transit') navigation.navigate('Track');
    else navigation.navigate('OrderDetail', { orderId: item.id });
  };

  return (
    <Screen contentStyle={{ paddingHorizontal: 0 }}>
      <View style={{ paddingHorizontal: 18 }}>
        <Heading size={30}>Your shipments</Heading>
        <DividerRow style={{ borderBottomWidth: 0 }}>
          <MutedText style={{ fontSize: 13 }}>This year</MutedText>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11 }}>{summary}</Text>
        </DividerRow>
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: colors.divider }}>
        {list.map((o) => (
          <Pressable key={o.id} onPress={() => open(o)} style={{ paddingHorizontal: 18, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.text, flexShrink: 1 }}>{o.title}</Text>
              <Text style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.text }}>{o.price}</Text>
            </View>
            <MutedText style={{ fontSize: 12.5, marginTop: 3 }}>{o.leg}</MutedText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}>
              <Tag tone={STATUS_TONE[o.status] ?? 'accent'}>{o.status}</Tag>
              <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, fontSize: 11 }}>{o.date} · {o.ref}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
