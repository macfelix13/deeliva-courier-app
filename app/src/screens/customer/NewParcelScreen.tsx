import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { Service } from '../../api/types';
import { useCart } from '../../state/CartContext';
import { Screen } from '../../theme/Screen';
import { Blueprint, Button, DividerRow, Heading, Kicker, MutedText } from '../../theme/primitives';
import { Icon } from '../../theme/icons';
import { colors, fonts } from '../../theme/tokens';

type Props = NativeStackScreenProps<CustomerStackParamList, 'NewParcel'>;

const SPECS = [
  { k: 'Type', v: 'Tube' },
  { k: 'Length', v: '910 mm' },
  { k: 'Diameter', v: '110 mm' },
  { k: 'Girth class', v: 'C · oversize' },
];

export function NewParcelScreen({ navigation }: Props) {
  const { addItem } = useCart();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('express');
  const [weight, setWeight] = useState(5);
  const [cover, setCover] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => { api.getServices().then(setServices).catch(() => {}); }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      api.getQuote(serviceId, weight, cover).then((q) => setTotal(q.total)).catch(() => {});
    }, 150);
    return () => clearTimeout(t);
  }, [serviceId, weight, cover]);

  const service = services.find((s) => s.id === serviceId);

  const stepWeight = (dir: 1 | -1) => setWeight((w) => Math.min(25, Math.max(0.5, Math.round((w + dir * 0.5) * 10) / 10)));

  const addToCart = () => {
    addItem({
      id: `local_${Date.now()}`,
      name: 'Rolled drawings tube',
      serviceName: service?.name ?? 'Express 2 hr',
      meta: `${service?.name ?? 'Express 2 hr'} · ${weight.toFixed(1)} kg${cover ? ' · cover £500' : ''}`,
      serviceId,
      weightKg: weight,
      cover,
      price: total,
    });
    navigation.navigate('Checkout');
  };

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18 }}>
        <Text onPress={() => navigation.goBack()} style={styles.back}>← Back</Text>
        <Kicker style={{ marginTop: 14 }}>Parcel 1 of 1</Kicker>
        <Heading size={30} style={{ marginTop: 6 }}>Rolled drawings tube</Heading>
        <MutedText style={{ fontSize: 13.5, marginTop: 8 }}>
          Long, light and awkward — couriers carry it upright, so it goes direct with no depot handling.
        </MutedText>
      </View>

      <Blueprint style={styles.photo}>
        <Icon name="parcel" size={34} color={colors.neutral700} />
        <Text style={{ fontFamily: fonts.mono, color: colors.neutral700, marginTop: 8, fontSize: 11 }}>
          PARCEL PHOTO — drop image
        </Text>
      </Blueprint>

      <View style={{ paddingHorizontal: 18, marginTop: 20 }}>
        <Kicker>Measurements</Kicker>
        {SPECS.map((s) => (
          <DividerRow key={s.k}>
            <MutedText style={{ fontSize: 13 }}>{s.k}</MutedText>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11 }}>{s.v}</Text>
          </DividerRow>
        ))}

        <Kicker style={{ marginTop: 22 }}>Weight — {weight.toFixed(1)} kg</Kicker>
        <View style={styles.weightRow}>
          <Pressable onPress={() => stepWeight(-1)} style={styles.weightBtn}><Text style={styles.weightBtnText}>−</Text></Pressable>
          <View style={styles.weightTrack}>
            <View style={[styles.weightFill, { width: `${((weight - 0.5) / 24.5) * 100}%` }]} />
          </View>
          <Pressable onPress={() => stepWeight(1)} style={styles.weightBtn}><Text style={styles.weightBtnText}>+</Text></Pressable>
        </View>

        <Kicker style={{ marginTop: 22 }}>Service</Kicker>
        {services.map((s) => {
          const selected = s.id === serviceId;
          return (
            <Pressable key={s.id} onPress={() => setServiceId(s.id)}>
              <Blueprint
                borderColor={selected ? colors.accent : colors.divider}
                style={[styles.serviceRow, selected ? { backgroundColor: colors.accent100 } : null]}
              >
                <View>
                  <Text style={styles.serviceName}>{s.name}</Text>
                  <MutedText style={{ fontSize: 12, marginTop: 3 }}>{s.window}</MutedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.servicePrice}>£{s.price.toFixed(2)}</Text>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: selected ? colors.accent700 : colors.neutral500 }}>
                    {selected ? 'SELECTED' : 'select'}
                  </Text>
                </View>
              </Blueprint>
            </Pressable>
          );
        })}

        <DividerRow style={{ marginTop: 16 }}>
          <View>
            <Text style={{ fontSize: 14, color: colors.text, fontFamily: fonts.body }}>Add cover to £500</Text>
            <MutedText style={{ fontSize: 12 }}>+£1.80 · optional</MutedText>
          </View>
          <Pressable onPress={() => setCover((c) => !c)} style={[styles.toggle, { backgroundColor: cover ? colors.accent100 : 'transparent', justifyContent: cover ? 'flex-end' : 'flex-start' }]}>
            <View style={[styles.toggleKnob, { backgroundColor: cover ? colors.accent : colors.neutral300 }]} />
          </Pressable>
        </DividerRow>
      </View>

      <View style={{ paddingHorizontal: 18, marginTop: 20 }}>
        <Button variant="primary" blueprint onPress={addToCart} style={{ height: 50 }}>
          Add to shipment · £{total.toFixed(2)}
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.mono, color: colors.accent700, fontSize: 12 },
  photo: {
    marginHorizontal: 18, marginTop: 18, height: 150, backgroundColor: colors.neutral300,
    alignItems: 'center', justifyContent: 'center',
  },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  weightBtn: { width: 32, height: 32, borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center' },
  weightBtnText: { fontSize: 18, color: colors.accent700, fontFamily: fonts.heading },
  weightTrack: { flex: 1, height: 3, backgroundColor: colors.divider },
  weightFill: { height: 3, backgroundColor: colors.accent },
  serviceRow: { marginTop: 10, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontFamily: fonts.heading, fontSize: 19, color: colors.text },
  servicePrice: { fontFamily: fonts.heading, fontSize: 19, color: colors.text },
  toggle: { width: 44, height: 24, borderWidth: 1, borderColor: colors.divider, padding: 2, flexDirection: 'row' },
  toggleKnob: { width: 18, height: 18 },
});
