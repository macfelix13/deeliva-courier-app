import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextProps, View, ViewProps, ViewStyle, TextInputProps, StyleProp } from 'react-native';
import { colors, fonts } from './tokens';

const CORNER_COLOR = 'rgba(29,31,32,0.55)';

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const vertical: any = { position: 'absolute', left: 5, top: 0, width: 1, height: 11, backgroundColor: CORNER_COLOR };
  const horizontal: any = { position: 'absolute', top: 5, left: 0, width: 11, height: 1, backgroundColor: CORNER_COLOR };
  const outer: any = {
    position: 'absolute', width: 11, height: 11,
    top: position === 'tl' || position === 'tr' ? -6 : undefined,
    bottom: position === 'bl' || position === 'br' ? -6 : undefined,
    left: position === 'tl' || position === 'bl' ? -6 : undefined,
    right: position === 'tr' || position === 'br' ? -6 : undefined,
  };
  return (
    <View style={outer} pointerEvents="none">
      <View style={vertical} />
      <View style={horizontal} />
    </View>
  );
}

/** The prototype's `.blueprint` class: a hairline box with four registration-mark corners. */
export function Blueprint({ style, borderColor, children, ...rest }: ViewProps & { style?: StyleProp<ViewStyle>; borderColor?: string }) {
  return (
    <View style={[styles.blueprint, { borderColor: borderColor ?? colors.divider }, style]} {...rest}>
      <Corner position="tl" />
      <Corner position="tr" />
      <Corner position="bl" />
      <Corner position="br" />
      {children}
    </View>
  );
}

/** `.k` — the small uppercase letter-spaced accent kicker used throughout. */
export function Kicker({ children, style, color }: { children: React.ReactNode; style?: StyleProp<TextStyleLike>; color?: string }) {
  return <Text style={[styles.kicker, color ? { color } : null, style]}>{children}</Text>;
}

/** `.mono` — small monospace text, used for refs, timestamps and counts. */
export function Mono({ children, style, color }: { children: React.ReactNode; style?: StyleProp<TextStyleLike>; color?: string }) {
  return <Text style={[styles.mono, color ? { color } : null, style]}>{children}</Text>;
}

export function MutedText({ children, style }: TextProps) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Heading({ children, style, size = 20 }: { children: React.ReactNode; style?: StyleProp<TextStyleLike>; size?: number }) {
  return <Text style={[styles.heading, { fontSize: size, lineHeight: size * 1.08 }, style]}>{children}</Text>;
}

type TextStyleLike = any;

export function Tag({ children, tone = 'accent', style }: { children: React.ReactNode; tone?: 'accent' | 'outline' | 'neutral'; style?: StyleProp<ViewStyle> }) {
  const toneStyle = tone === 'accent' ? { backgroundColor: colors.accent100 } : tone === 'neutral' ? { backgroundColor: colors.neutral200 } : { borderWidth: 1, borderColor: colors.accent };
  const textColor = tone === 'accent' ? colors.accent800 : tone === 'neutral' ? colors.neutral800 : colors.accent;
  return (
    <View style={[styles.tag, toneStyle, style]}>
      <Text style={[styles.tagText, { color: textColor }]}>{children}</Text>
    </View>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  blueprint?: boolean;
  style?: StyleProp<ViewStyle>;
  flex?: number;
  disabled?: boolean;
}

export function Button({ children, onPress, variant = 'secondary', blueprint = false, style, flex, disabled }: ButtonProps) {
  const variantStyle =
    variant === 'primary' ? { backgroundColor: colors.accent, borderColor: colors.accent }
    : variant === 'ghost' ? { backgroundColor: 'transparent', borderColor: 'transparent' }
    : { backgroundColor: 'transparent', borderColor: colors.divider };
  const textColor = variant === 'primary' ? colors.bg : variant === 'ghost' ? colors.accent : colors.text;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btnBase,
        variantStyle,
        flex ? { flex } : null,
        disabled ? { opacity: 0.45 } : null,
        pressed ? { opacity: 0.8 } : null,
        style,
      ]}
    >
      {blueprint && (
        <>
          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />
        </>
      )}
      <Text style={[styles.btnText, { color: textColor }]}>{children}</Text>
    </Pressable>
  );
}

export function Field({ label, value, onChangeText, placeholder, keyboardType, style }: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder?: string;
  keyboardType?: TextInputProps['keyboardType']; style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={style}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral500}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

export function DividerRow({ children, style }: ViewProps) {
  return <View style={[styles.dividerRow, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  blueprint: { borderWidth: 1, position: 'relative' },
  kicker: {
    fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: colors.accent700,
  },
  mono: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.2, color: colors.text },
  muted: { color: colors.textMuted, fontFamily: fonts.body },
  heading: { fontFamily: fonts.heading, color: colors.text },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 3 },
  tagText: { fontSize: 11, letterSpacing: 0.2, fontFamily: fonts.bodyMedium },
  btnBase: { height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 0 },
  btnInner: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', borderWidth: 0 },
  btnText: { fontFamily: fonts.heading, fontSize: 14, letterSpacing: 0.2 },
  fieldLabel: { fontSize: 12, color: colors.text, opacity: 0.7, marginBottom: 5, fontFamily: fonts.body },
  input: {
    minHeight: 44, paddingHorizontal: 10, fontSize: 16, color: colors.text,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, fontFamily: fonts.body,
  },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
});
