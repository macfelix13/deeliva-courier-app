import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CourierTabParamList } from './types';
import { JobsScreen } from '../screens/courier/JobsScreen';
import { DeliveryScreen } from '../screens/courier/DeliveryScreen';
import { CourierProfileScreen } from '../screens/courier/CourierProfileScreen';
import { Icon } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

const Tab = createBottomTabNavigator<CourierTabParamList>();

const ICON_BY_ROUTE = { Jobs: 'jobs', Active: 'active', You: 'profile' } as const;

export function CourierTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Jobs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent700,
        tabBarInactiveTintColor: colors.neutral500,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.divider, height: 78, paddingTop: 9 },
        tabBarLabel: ({ color }) => (
          <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color }}>
            {route.name}
          </Text>
        ),
        tabBarIcon: ({ color }) => <Icon name={ICON_BY_ROUTE[route.name]} size={22} color={color} />,
      })}
    >
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Active" component={DeliveryScreen} />
      <Tab.Screen name="You" component={CourierProfileScreen} />
    </Tab.Navigator>
  );
}
