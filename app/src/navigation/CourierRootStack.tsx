import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourierStackParamList } from './types';
import { CourierTabs } from './CourierTabs';
import { ChatScreen } from '../screens/shared/ChatScreen';

const Stack = createNativeStackNavigator<CourierStackParamList>();

export function CourierRootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={CourierTabs} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
