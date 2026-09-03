import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { PaymentMethod } from '../../api/types';
import { useCart } from '../../state/CartContext';
import { Screen } from '../../theme/Screen';
import { Blueprint, Button, DividerRow, Field, Heading, Kicker, MutedText } from '../../theme/primitives';
import { colors, fonts } from '../../theme/tokens';

type Props = NativeStackScreenProps<CustomerStackParamList, 'Checkout'>;

const HEADINGS = ['Your shipment', 'When and where', 'Pay and book'];
const WINDOWS = [
  { label: 'Next 60 minutes', note: 'Courier assigned on booking' },
  { label: '11:00 – 13:00', note: 'Most popular · no surcharge' },
  { label: '16:00 – 18:00', note: 'Last collection of the day' },
];

export function CheckoutScreen({ navigation }: Props) {
  const { items, removeItem, total, clear } = useCart();
  const [step, setStep] = useState(0);
  const [windowIdx, setWindowIdx] = useState(1);
  const [drop, setDrop] = useState('Wellington Place, 6th floor, LS1 4AP');
  const [cardIdx, setCardIdx] = useState(0);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [booking, setBooking] = useState(false);

  useEffect(() => { api.getPaymentMethods().then(setMethods).catch(() => {}); }, []);

  const coverTotal = items.filter((i) => i.cover).length * 1.8;
  const carriage = Math.round((total - coverTotal) * 100) / 100;

  const book = async () => {
    setBooking(true);
    try {
      await api.createOrder({
        items: items.map((i) => ({ name: i.name, serviceId: i.serviceId, weightKg: i.weightKg, cover: i.cover })),
        window: WINDOWS[windowIdx].label,
        dropAddress: drop,
        paymentMethodId: methods[cardIdx]?.id ?? 'card',
      });
      clear();
      navigation.popToTop();
      navigation.navigate('Tabs');
    } finally {
      setBooking(false);
    }
  };

  const next = () => (step < 2 ? setStep(step + 1) : book());

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18 }}>
        <Text onPress={() => navigation.goBack()} style={{ fontFamily: fonts.mono, color: colors.accent700 }}>← Back</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 }}>
          <Heading size={30}>{HEADINGS[step]}</Heading>
          <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, fontSize: 12 }}>Step {step + 1} of 3</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 14 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flex: 1, height: 3, backgroundColor: i <= step ? colors.accent : colors.divider }} />
          ))}
        </View>
      </View>

      {step === 0 && (
        <View style={{ paddingHorizontal: 18, marginTop: 18 }}>
          <Kicker>Shipment</Kicker>
          {items.map((i) => (
            <Blueprint key={i.id} style={{ marginTop: 10, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.text }}>{i.name}</Text>
                  <MutedText style={{ fontSize: 12, marginTop: 3 }}>{i.meta}</MutedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: fonts.heading, fontSize: 17, color: colors.text }}>£{i.price.toFixed(2)}</Text>
                  <Text onPress={() => removeItem(i.id)} style={{ fontFamily: fonts.mono, color: colors.accent700, marginTop: 6, fontSize: 11 }}>Remove</Text>
                </View>
              </View>
            </Blueprint>
          ))}
          <Pressable onPress={() => navigation.navigate('NewParcel')}>
            <DividerRow>
              <Text style={{ fontSize: 14, color: colors.accent700, fontFamily: fonts.body }}>+ Add another parcel</Text>
              <Text style={{ fontFamily: fonts.mono, color: colors.accent700, fontSize: 11 }}>edit</Text>
            </DividerRow>
          </Pressable>
        </View>
      )}

      {step === 1 && (
        <View style={{ paddingHorizontal: 18, marginTop: 18 }}>
          <Kicker>Pickup window</Kicker>
          {WINDOWS.map((w, i) => {
            const selected = windowIdx === i;
            return (
              <Pressable key={w.label} onPress={() => setWindowIdx(i)}>
                <View style={[styles.optionRow, { borderColor: selected ? colors.accent : colors.divider, backgroundColor: selected ? colors.accent100 : 'transparent' }]}>
                  <View>
                    <Text style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.text }}>{w.label}</Text>
                    <MutedText style={{ fontSize: 12, marginTop: 2 }}>{w.note}</MutedText>
                  </View>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: selected ? colors.accent700 : colors.neutral500 }}>
                    {selected ? 'SELECTED' : 'select'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          <Field label="Drop-off address" value={drop} onChangeText={setDrop} placeholder="Where is it going?" style={{ marginTop: 20 }} />
        </View>
      )}

      {step === 2 && (
        <View style={{ paddingHorizontal: 18, marginTop: 18 }}>
          <Kicker>Payment</Kicker>
          {methods.map((c, i) => {
            const selected = cardIdx === i;
            return (
              <Pressable key={c.id} onPress={() => setCardIdx(i)}>
                <View style={[styles.optionRow, { borderColor: selected ? colors.accent : colors.divider, backgroundColor: selected ? colors.accent100 : 'transparent' }]}>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <View style={{ width: 34, height: 22, borderWidth: 1, borderColor: colors.divider }} />
                    <View>
                      <Text style={{ fontSize: 14, color: colors.text, fontFamily: fonts.body }}>{c.name}</Text>
                      <Text style={{ fontFamily: fonts.mono, color: colors.textMuted, fontSize: 11 }}>{c.detail}</Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: selected ? colors.accent700 : colors.neutral500 }}>
                    {selected ? 'SELECTED' : 'select'}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          <Blueprint style={{ marginTop: 20, padding: 16 }}>
            <DividerRow>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>Carriage</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>£{carriage.toFixed(2)}</Text>
            </DividerRow>
            <DividerRow>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>Cover to £500</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>£{coverTotal.toFixed(2)}</Text>
            </DividerRow>
            <DividerRow>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>Congestion surcharge</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>£0.00</Text>
            </DividerRow>
            <DividerRow style={{ borderBottomWidth: 0 }}>
              <Text style={{ fontSize: 15, color: colors.text }}>Total</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 15, color: colors.text }}>£{total.toFixed(2)}</Text>
            </DividerRow>
          </Blueprint>
        </View>
      )}

      <View style={{ paddingHorizontal: 18, marginTop: 20 }}>
        <Button variant="primary" blueprint onPress={next} disabled={booking} style={{ height: 50 }}>
          {step < 2 ? 'Continue' : `Book · £${total.toFixed(2)}`}
        </Button>
        <MutedText style={{ fontSize: 11.5, textAlign: 'center', marginTop: 12 }}>
          You can change the window free of charge up to 30 minutes before pickup.
        </MutedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderWidth: 1, marginTop: 10,
  },
});
