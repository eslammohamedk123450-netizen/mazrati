/**
 * MAZRATI - Backup Service
 * نسخ واستعادة البيانات المحلية بصيغة JSON داخل AsyncStorage.
 *
 * ملاحظة: التصدير إلى ملف/مشاركة خارجية يتطلب expo-file-system + expo-sharing
 * (غير مثبتتين حالياً)؛ لذلك يُعرض محتوى النسخة للنسخ اليدوي ويُقبل لصق JSON للاستعادة.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_VERSION } from '../constants';

const BACKUP_VERSION = 1;

export const BACKUP_KEYS = {
  categories: '@mazrati_categories',
  items: '@mazrati_items',
  events: '@mazrati_events',
  reminders: '@mazrati_reminders',
  theme: '@mazrati_theme_mode',
  language: '@mazrati_language',
  notifications: '@mazrati_reminder_notifications',
};

const readKey = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

/** إنشاء نسخة احتياطية كاملة (كائن JSON) */
export const createBackup = async () => {
  const [categories, items, events, reminders] = await Promise.all([
    readKey(BACKUP_KEYS.categories, []),
    readKey(BACKUP_KEYS.items, []),
    readKey(BACKUP_KEYS.events, []),
    readKey(BACKUP_KEYS.reminders, []),
  ]);

  const theme = await AsyncStorage.getItem(BACKUP_KEYS.theme);
  const language = await AsyncStorage.getItem(BACKUP_KEYS.language);

  return {
    app: 'MAZRATI',
    version: APP_VERSION,
    backupVersion: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    counts: {
      categories: categories.length,
      items: items.length,
      events: events.length,
      reminders: reminders.length,
    },
    data: { categories, items, events, reminders },
    settings: {
      theme: theme || null,
      language: language || null,
    },
  };
};

export const exportBackupAsString = async () => {
  const backup = await createBackup();
  return JSON.stringify(backup, null, 2);
};

/** التحقق من صحة ملف النسخة قبل الاستعادة */
export const validateBackup = (raw) => {
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { valid: false, error: 'محتوى النسخة ليس JSON صالحًا' };
    }
  }
  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'بنية النسخة غير صحيحة' };
  }
  if (parsed.app !== 'MAZRATI') {
    return { valid: false, error: 'هذه النسخة لا تنتمي لتطبيق مزرعتي' };
  }
  if (!parsed.data || typeof parsed.data !== 'object') {
    return { valid: false, error: 'النسخة لا تحتوي على بيانات' };
  }
  for (const key of ['categories', 'items', 'events', 'reminders']) {
    if (parsed.data[key] && !Array.isArray(parsed.data[key])) {
      return { valid: false, error: `حقل ${key} يجب أن يكون قائمة` };
    }
  }
  return { valid: true, backup: parsed };
};

/** استعادة النسخة (تستبدل البيانات الحالية) */
export const restoreBackup = async (raw) => {
  const result = validateBackup(raw);
  if (!result.valid) throw new Error(result.error);
  const { backup } = result;

  const pairs = [
    [BACKUP_KEYS.categories, backup.data.categories],
    [BACKUP_KEYS.items, backup.data.items],
    [BACKUP_KEYS.events, backup.data.events],
    [BACKUP_KEYS.reminders, backup.data.reminders],
  ];

  for (const [key, value] of pairs) {
    if (Array.isArray(value)) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  }

  if (backup.settings?.theme) {
    await AsyncStorage.setItem(BACKUP_KEYS.theme, backup.settings.theme);
  }
  if (backup.settings?.language) {
    await AsyncStorage.setItem(BACKUP_KEYS.language, backup.settings.language);
  }

  return {
    restored: {
      categories: backup.data.categories?.length || 0,
      items: backup.data.items?.length || 0,
      events: backup.data.events?.length || 0,
      reminders: backup.data.reminders?.length || 0,
    },
  };
};

/** مسح كل بيانات التطبيق (بدون حذف الإعدادات) */
export const clearAllData = async () => {
  await AsyncStorage.multiRemove([
    BACKUP_KEYS.categories,
    BACKUP_KEYS.items,
    BACKUP_KEYS.events,
    BACKUP_KEYS.reminders,
    BACKUP_KEYS.notifications,
    '@mazrati_categories_seeded',
    '@mazrati_items_seeded',
    '@mazrati_events_seeded',
  ]);
};

export default {
  BACKUP_KEYS,
  createBackup,
  exportBackupAsString,
  validateBackup,
  restoreBackup,
  clearAllData,
};
