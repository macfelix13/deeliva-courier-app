import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAppFonts } from './src/theme/useAppFonts';
import { RoleProvider } from './src/state/RoleContext';
import { CartProvider } from './src/state/CartContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/tokens';

export default function App() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RoleProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </CartProvider>
      </RoleProvider>
    </SafeAreaProvider>
  );
}
