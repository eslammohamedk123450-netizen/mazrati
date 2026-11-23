/**
 * MAZRATI - Reminder Service
 * خدمة التذكيرات مع حفظ محلي في AsyncStorage + جدولة إشعارات محلية
 *
 * ملاحظة: تستخدم expo-notifications (موجودة في package.json).
 * الإشعارات المحلية تعمل في Expo Go، أما الإشعارات عن بُعد فتتطلب Development Build.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const REMINDERS_KEY = '@mazrati_reminders';
const NOTIF_MAP_KEY = '@mazrati_reminder_notifications';
const CHANNEL_ID = 'mazrati-reminders';

export const REMINDER_REPEATS = [
  { key: 'none', label: 'مرة واحدة' },
  { key: 'daily', label: 'يوميًا' },
  { key: 'weekly', label: 'أسبوعيًا' },
  { key: 'monthly', label: 'شهريًا' },
];

export const REMINDER_STATUSES = [
  { key: 'pending', label: 'قيد الانتظار' },
  { key: 'done', label: 'مكتمل' },
];

// ===== أدوات التاريخ =====
const pad = (n) => String(n).padStart(2, '0');

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** تحويل تاريخ + وقت إلى كائن Date محلي (بدون تحويل UTC) */
export const toLocalDate = (dateStr, timeStr = '00:00') => {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const [hh, mm] = String(timeStr || '00:00').split(':').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
};

/** حساب درجة الإلحاح: urgent / soon / later / past */
export const getUrgency = (dateStr, timeStr, now = new Date()) => {
  const target = toLocalDate(dateStr, timeStr);
  if (!target) return 'later';
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'past';
  if (diffDays <= 1) return 'urgent';
  if (diffDays <= 7) return 'soon';
  return 'later';
};

// ===== التخزين =====
const readAll = async () => {
  try {
    const raw = await AsyncStorage.getItem(REMINDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read reminders:', error);
    return [];
  }
};

const writeAll = async (reminders) => {
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  return reminders;
};

const readNotifMap = async () => {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeNotifMap = async (map) => {
  await AsyncStorage.setItem(NOTIF_MAP_KEY, JSON.stringify(map));
};

// ===== الإشعارات =====
export const ensureNotificationSetup = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'تذكيرات مزرعتي',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#2E7D46',
      });
    }
  } catch (error) {
    console.warn('Notification channel setup failed:', error);
  }
};

export const getNotificationPermissionStatus = async () => {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings.granted || settings.status === 'granted';
  } catch {
    return false;
  }
};

export const requestNotificationPermission = async () => {
  try {
    await ensureNotificationSetup();
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return true;
    const { granted } = await Notifications.requestPermissionsAsync();
    return !!granted;
  } catch (error) {
    console.warn('Notification permission request failed:', error);
    return false;
  }
};

/** إلغاء إشعار مجدول لتذكير معيّن */
const cancelReminderNotification = async (reminderId, map) => {
  const identifier = map[reminderId];
  if (!identifier) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.warn('Failed to cancel notification:', error);
  }
  delete map[reminderId];
};

/** جدولة إشعار محلي للتذكير إذا كان موعده في المستقبل */
const scheduleReminderNotification = async (reminder, map) => {
  if (reminder.status === 'done') return;
  const target = toLocalDate(reminder.date, reminder.time);
  if (!target) return;

  const repeat = reminder.repeat && reminder.repeat !== 'none' ? reminder.repeat : null;
  if (!repeat && target.getTime() <= Date.now()) return;

  try {
    const granted = await getNotificationPermissionStatus();
    if (!granted) return;

    const trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    };

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title || 'تذكير من مزرعتي',
        body: reminder.description || 'لديك تذكير مستحق',
        sound: true,
        data: {
          url: reminder.itemId ? `/items/${reminder.itemId}` : '/calendar',
          reminderId: reminder.id,
        },
      },
      trigger,
    });
    map[reminder.id] = identifier;
  } catch (error) {
    console.warn('Failed to schedule notification:', error);
  }
};

// ===== CRUD =====
export const getReminders = async () => {
  const reminders = await readAll();
  return reminders.sort((a, b) => {
    const da = toLocalDate(a.date, a.time)?.getTime() ?? 0;
    const db = toLocalDate(b.date, b.time)?.getTime() ?? 0;
    return da - db;
  });
};

export const getReminderById = async (id) => {
  const reminders = await readAll();
  return reminders.find((r) => r.id === id) || null;
};

export const getUpcomingReminders = async (limit = 5) => {
  const now = Date.now();
  const reminders = await readAll();
  return reminders
    .filter((r) => r.status !== 'done')
    .filter((r) => {
      const t = toLocalDate(r.date, r.time)?.getTime() ?? 0;
      return t >= now;
    })
    .sort((a, b) => toLocalDate(a.date, a.time) - toLocalDate(b.date, b.time))
    .slice(0, limit)
    .map((r) => ({ ...r, urgency: getUrgency(r.date, r.time) }));
};

export const getOverdueReminders = async () => {
  const now = Date.now();
  const reminders = await readAll();
  return reminders
    .filter((r) => r.status !== 'done')
    .filter((r) => (toLocalDate(r.date, r.time)?.getTime() ?? 0) < now)
    .map((r) => ({ ...r, urgency: 'past' }));
};

export const getRemindersForDate = async (dateStr) => {
  const reminders = await readAll();
  return reminders
    .filter((r) => r.date === dateStr)
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));
};

export const createReminder = async (data) => {
  const reminders = await readAll();
  const newReminder = {
    id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: (data.title || '').trim(),
    description: data.description || '',
    date: data.date,
    time: data.time || '09:00',
    repeat: data.repeat || 'none',
    itemId: data.itemId || null,
    categoryId: data.categoryId || null,
    eventId: data.eventId || null,
    status: 'pending',
    notificationId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const map = await readNotifMap();
  await scheduleReminderNotification(newReminder, map);
  newReminder.notificationId = map[newReminder.id] || null;
  await writeNotifMap(map);

  reminders.push(newReminder);
  await writeAll(reminders);
  return newReminder;
};

export const updateReminder = async (id, updates) => {
  const reminders = await readAll();
  const index = reminders.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const map = await readNotifMap();
  await cancelReminderNotification(id, map);

  const updated = {
    ...reminders[index],
    ...updates,
    title: updates.title ? updates.title.trim() : reminders[index].title,
    notificationId: null,
    updatedAt: new Date().toISOString(),
  };

  await scheduleReminderNotification(updated, map);
  updated.notificationId = map[id] || null;
  await writeNotifMap(map);

  reminders[index] = updated;
  await writeAll(reminders);
  return updated;
};

export const toggleReminderDone = async (id) => {
  const reminder = await getReminderById(id);
  if (!reminder) return null;
  return updateReminder(id, { status: reminder.status === 'done' ? 'pending' : 'done' });
};

export const deleteReminder = async (id) => {
  const reminders = await readAll();
  const map = await readNotifMap();
  await cancelReminderNotification(id, map);
  await writeNotifMap(map);
  await writeAll(reminders.filter((r) => r.id !== id));
  return true;
};

export const resetReminders = async () => {
  const map = await readNotifMap();
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Failed to cancel all notifications:', error);
  }
  await writeNotifMap({});
  await AsyncStorage.removeItem(REMINDERS_KEY);
  return true;
};

export default {
  REMINDER_REPEATS,
  REMINDER_STATUSES,
  getReminders,
  getReminderById,
  getUpcomingReminders,
  getOverdueReminders,
  getRemindersForDate,
  createReminder,
  updateReminder,
  toggleReminderDone,
  deleteReminder,
  resetReminders,
  ensureNotificationSetup,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  getUrgency,
  toLocalDate,
  todayKey,
};
