import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { OrderListItem } from '../../api/types';
import { Screen } from '../../theme/Screen';
import { Blueprint, Button, DividerRow, Heading, Kicker, MutedText, Tag } from '../../theme/primitives';
import { Icon } from '../../theme/icons';
import { colors, fonts } from '../../theme/tokens';

type Props = NativeStackScreenProps<CustomerStackParamList, 'Search'>;

const CHIPS = ['Express', 'Same day', 'Next day', 'In transit', 'Delivered'];

export function SearchScreen({ navigation }: Props) {
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [results, setResults] = useState<OrderListItem[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      api.searchOrders(q, filters).then((r) => { setResults(r.results); setCount(r.count); }).catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [q, filters]);

  const toggle = (f: string) => setFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const openResult = (item: OrderListItem) => {
    if (item.status === 'In transit') navigation.navigate('Tabs');
    else navigation.navigate('OrderDetail', { orderId: item.id });
  };

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18 }}>
        <Heading size={30}>Find a shipment</Heading>
        <View style={styles.searchBox}>
          <Icon name="search" size={17} color={colors.accent} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Tracking no., address or name"
            placeholderTextColor={colors.neutral500}
            style={styles.searchInput}
          />
        </View>
        <View style={styles.chipRow}>
          {CHIPS.map((c) => {
            const on = filters.includes(c);
            return (
              <Pressable key={c} onPress={() => toggle(c)}>
                <View style={[styles.chip, on ? { backgroundColor: colors.accent, borderColor: colors.accent } : { borderColor: colors.divider }]}>
                  <Text style={{ color: on ? '#fff' : colors.accent700, fontSize: 11, fontFamily: fonts.bodyMedium }}>{c}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <DividerRow style={{ borderBottomWidth: 0 }}>
          <Kicker>{count} results</Kicker>
          <MutedText style={{ fontFamily: fonts.mono, fontSize: 11 }}>sorted by date</MutedText>
        </DividerRow>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.divider }}>
        {results.map((r) => (
          <Pressable key={r.id} onPress={() => openResult(r)} style={styles.resultRow}>
            <Blueprint style={styles.resultIcon}>
              <Icon name="parcel" size={18} color={colors.accent} />
            </Blueprint>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <Text style={styles.resultTitle}>{r.title}</Text>
                <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, fontSize: 11 }}>{r.date}</Text>
              </View>
              <MutedText style={{ fontSize: 12.5, marginTop: 2 }}>{r.leg}</MutedText>
              <View style={{ marginTop: 7, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Tag tone="accent">{r.status}</Tag>
                <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, fontSize: 11 }}>{r.ref}</Text>
              </View>
            </View>
          </Pressable>
        ))}
        {results.length === 0 && (
          <View style={{ padding: 44, alignItems: 'center' }}>
            <Kicker>No matches</Kicker>
            <MutedText style={{ fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              Nothing for “{q}”. Try a tracking number or clear the filters.
            </MutedText>
            <Button variant="secondary" onPress={() => { setFilters([]); setQ(''); }} style={{ marginTop: 8, paddingHorizontal: 16 }}>
              Clear filters
            </Button>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.divider,
    paddingHorizontal: 12, paddingVertical: 11, marginTop: 14, backgroundColor: colors.neutral100,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, fontFamily: fonts.body },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  chip: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  resultRow: { paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  resultIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontFamily: fonts.heading, fontSize: 17, color: colors.text },
});
