/**
 * MAZRATI - Tabs Layout (Bottom Navigation)
 * شريط تنقل سفلي مع 5 تبويبات: الرئيسية، الأقسام، التقويم، السجل، الإعدادات
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const TabIcon = ({ icon }) => {
  return <Text style={{ fontSize: 22 }}>{icon}</Text>;
};

export default function TabsLayout() {
  const { theme } = useTheme();
  const { isRTL } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondaryText,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'الأقسام',
          tabBarIcon: ({ color }) => <TabIcon icon="🗂️" />,
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: 'العناصر',
          tabBarIcon: ({ color }) => <TabIcon icon="📦" />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'التقويم',
          tabBarIcon: ({ color }) => <TabIcon icon="📅" />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'السجل',
          tabBarIcon: ({ color }) => <TabIcon icon="📋" />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'تذكيرات',
          tabBarIcon: ({ color }) => <TabIcon icon="🔔" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" />,
        }}
      />
    </Tabs>
  );
}
