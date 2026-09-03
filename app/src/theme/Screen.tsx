import React from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from './tokens';

/** Consistent top-safe-area padded container matching the prototype's tab screens. */
export function Screen({ children, scroll = true, contentStyle }: {
  children: React.ReactNode; scroll?: boolean; contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  if (!scroll) {
    return <View style={[{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 18 }, contentStyle]}>{children}</View>;
  }
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ paddingTop: insets.top + 18, paddingBottom: 26 }, contentStyle]}
    >
      {children}
    </ScrollView>
  );
}
