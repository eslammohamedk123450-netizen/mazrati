/**
 * MAZRATI - Root Layout (Expo Router)
 * يوفر مزودي الحالة (Theme/Language/البيانات) لجميع الشاشات
 * + مراقبة التنقل عبر الإشعارات
 */

import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { CategoriesProvider } from '../contexts/CategoriesContext';
import { ItemsProvider } from '../contexts/ItemsContext';
import { EventsProvider } from '../contexts/EventsContext';
import { RemindersProvider } from '../contexts/RemindersContext';
import { ensureNotificationSetup } from '../services/reminderService';

// عرض الإشعارات المحلية داخل التطبيق
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** توجيه المستخدم إلى الشاشة المرتبطة عند النقر على إشعار */
function useNotificationObserver() {
  const router = useRouter();

  useEffect(() => {
    ensureNotificationSetup();

    const redirect = (notification) => {
      const url = notification?.request?.content?.data?.url;
      if (typeof url === 'string' && url) {
        router.push(url);
      }
    };

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification);
    });

    // التعامل مع الإشعار الذي فتح التطبيق
    Notifications.getLastNotificationResponse()
      .then((response) => {
        if (response?.notification) redirect(response.notification);
      })
      .catch(() => {});

    return () => responseSub.remove();
  }, [router]);
}

const RootNavigator = () => {
  useNotificationObserver();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="categories/[id]" />
      <Stack.Screen name="categories/add" />
      <Stack.Screen name="items/[id]" />
      <Stack.Screen name="items/add" />
      <Stack.Screen name="events/[id]" />
      <Stack.Screen name="events/add" />
      <Stack.Screen name="media-gallery" />
      <Stack.Screen name="search" />
      <Stack.Screen name="backup" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="reminders/add" />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <CategoriesProvider>
          <ItemsProvider>
            <EventsProvider>
              <RemindersProvider>
                <StatusBar barStyle="default" />
                <RootNavigator />
              </RemindersProvider>
            </EventsProvider>
          </ItemsProvider>
        </CategoriesProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}