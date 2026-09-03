import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomerStackParamList } from './types';
import { CustomerTabs } from './CustomerTabs';
import { OnboardingScreen } from '../screens/customer/OnboardingScreen';
import { SearchScreen } from '../screens/customer/SearchScreen';
import { NewParcelScreen } from '../screens/customer/NewParcelScreen';
import { OrderDetailScreen } from '../screens/customer/OrderDetailScreen';
import { CheckoutScreen } from '../screens/customer/CheckoutScreen';
import { ChatScreen } from '../screens/shared/ChatScreen';
import { api } from '../api/client';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export function CustomerRootStack() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Tabs' | null>(null);

  useEffect(() => {
    api.getOnboarding()
      .then((s) => setInitialRoute(s.completedAt ? 'Tabs' : 'Onboarding'))
      .catch(() => setInitialRoute('Tabs'));
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Tabs" component={CustomerTabs} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="NewParcel" component={NewParcelScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
