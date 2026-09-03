import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useRole } from '../state/RoleContext';
import { CustomerRootStack } from './CustomerRootStack';
import { CourierRootStack } from './CourierRootStack';

export function RootNavigator() {
  const { role, ready } = useRole();
  if (!ready) return null;

  return (
    <NavigationContainer key={role}>
      {role === 'customer' ? <CustomerRootStack /> : <CourierRootStack />}
    </NavigationContainer>
  );
}
