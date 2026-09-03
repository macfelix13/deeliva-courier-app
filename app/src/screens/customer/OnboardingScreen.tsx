import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/types';
import { api } from '../../api/client';
import { Blueprint, Button, Field, Heading, Kicker, MutedText } from '../../theme/primitives';
import { colors, fonts } from '../../theme/tokens';

type Props = NativeStackScreenProps<CustomerStackParamList, 'Onboarding'>;

const TITLES = ['Send a parcel across town today.', 'Where do we collect?', 'You are set up.'];
const SUBS = [
  'Book in under a minute, watch it move, and know exactly when it lands.',
  'This becomes your default pickup — you can add more later.',
  'One tap from here books your first shipment.',
];

export function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [pickup, setPickup] = useState('');
  const [notes, setNotes] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [done, setDone] = useState<{ pickupOut: string; notesOut: string; nearbyCouriers: number; typicalFirstPickupMinutes: number } | null>(null);

  useEffect(() => {
    api.getOnboarding().then((s) => setSuggestions(s.suggestions)).catch(() => {});
  }, []);

  const next = async () => {
    if (step === 0) {
      await api.patchOnboarding({ phone }).catch(() => {});
      setStep(1);
    } else if (step === 1) {
      await api.patchOnboarding({ pickup, notes }).catch(() => {});
      setStep(2);
      const result = await api.completeOnboarding().catch(() => null);
      if (result) setDone(result);
    } else {
      navigation.replace('Tabs');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top + 44 }]}>
        <Kicker style={{ letterSpacing: 3.5 }}>Deeliva</Kicker>
        <Heading size={40} style={{ marginTop: 10 }}>{TITLES[step]}</Heading>
        <MutedText style={{ marginTop: 10, fontSize: 14 }}>{SUBS[step]}</MutedText>

        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i <= step ? colors.accent : colors.divider }]} />
          ))}
        </View>

        {step === 0 && (
          <>
            <Field label="Mobile number" value={phone} onChangeText={setPhone} placeholder="+44 7700 900112" keyboardType="phone-pad" />
            <Blueprint style={{ marginTop: 22, padding: 16 }}>
              <Kicker>Why we ask</Kicker>
              <MutedText style={{ marginTop: 6, fontSize: 13 }}>
                Your courier texts this number on arrival, and we send one tracking link per parcel. Nothing else.
              </MutedText>
            </Blueprint>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Pickup address" value={pickup} onChangeText={setPickup} placeholder="Unit 4, Barrow Works, Leeds" />
            <View style={styles.suggestRow}>
              {suggestions.map((s) => (
                <Button key={s} variant="secondary" onPress={() => setPickup(s)} style={styles.suggestBtn}>{s}</Button>
              ))}
            </View>
            <Field label="Access notes for the courier" value={notes} onChangeText={setNotes} placeholder="Loading bay, buzzer 4" style={{ marginTop: 22 }} />
          </>
        )}

        {step === 2 && done && (
          <>
            <Blueprint style={{ padding: 18 }}>
              <Kicker>Your default pickup</Kicker>
              <Text style={styles.pickupOut}>{done.pickupOut}</Text>
              <View style={styles.notesRow}>
                <MutedText style={{ fontSize: 12 }}>Notes</MutedText>
                <Text style={{ fontFamily: fonts.mono, fontSize: 11 }}>{done.notesOut}</Text>
              </View>
            </Blueprint>
            <View style={styles.statRow}>
              <Blueprint style={styles.statTile}>
                <Text style={styles.statValue}>{done.nearbyCouriers}</Text>
                <MutedText style={{ fontSize: 11, marginTop: 4 }}>couriers within 3 km</MutedText>
              </Blueprint>
              <Blueprint style={styles.statTile}>
                <Text style={styles.statValue}>{done.typicalFirstPickupMinutes} <Text style={{ fontSize: 15 }}>min</Text></Text>
                <MutedText style={{ fontSize: 11, marginTop: 4 }}>typical first pickup</MutedText>
              </Blueprint>
            </View>
          </>
        )}

        <View style={{ flex: 1, minHeight: 24 }} />
        <Button variant="primary" blueprint onPress={next} style={{ height: 50 }}>
          {step === 2 ? 'Book my first parcel' : 'Continue'}
        </Button>
        <Text onPress={() => navigation.replace('Tabs')} style={styles.skip}>Skip for now</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 22, paddingBottom: 30 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 22, marginBottom: 26 },
  dot: { height: 3, flex: 1 },
  suggestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  suggestBtn: { paddingHorizontal: 12, height: 34 },
  pickupOut: { fontFamily: fonts.heading, fontSize: 20, marginTop: 8, color: colors.text },
  notesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  statRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statTile: { flex: 1, padding: 14 },
  statValue: { fontFamily: fonts.heading, fontSize: 26, color: colors.text },
  skip: { textAlign: 'center', fontSize: 12, paddingTop: 14, color: colors.textMuted, fontFamily: fonts.body },
});
