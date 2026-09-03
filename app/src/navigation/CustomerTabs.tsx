import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomerTabParamList } from './types';
import { HomeScreen } from '../screens/customer/HomeScreen';
import { TrackingScreen } from '../screens/customer/TrackingScreen';
import { OrdersScreen } from '../screens/customer/OrdersScreen';
import { ProfileScreen } from '../screens/customer/ProfileScreen';
import { Icon } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const ICON_BY_ROUTE = { Send: 'send', Track: 'track', Orders: 'orders', You: 'profile' } as const;

export function CustomerTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Send"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent700,
        tabBarInactiveTintColor: colors.neutral500,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.divider, height: 78, paddingTop: 9 },
        tabBarLabel: ({ color }) => (
          <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color }}>
            {route.name === 'Send' ? 'Send' : route.name === 'Track' ? 'Track' : route.name === 'Orders' ? 'Orders' : 'You'}
          </Text>
        ),
        tabBarIcon: ({ color }) => <Icon name={ICON_BY_ROUTE[route.name]} size={22} color={color} />,
      })}
    >
      <Tab.Screen name="Send" component={HomeScreen} />
      <Tab.Screen name="Track" component={TrackingScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="You" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
