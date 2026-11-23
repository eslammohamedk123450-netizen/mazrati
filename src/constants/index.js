/**
 * MAZRATI - الثوابت العامة للتطبيق
 */

export const APP_NAME = 'مزرعتي';
export const APP_NAME_EN = 'MAZRATI';
export const APP_DESCRIPTION =
  'تطبيق شخصي لإدارة وتوثيق الحيوانات والنباتات والمعدات والمنتجات وأي عناصر أخرى.';
export const APP_VERSION = '1.0.0';

// المسارات (Routes) في Expo Router
export const ROUTES = {
  HOME: '/',
  CATEGORIES: '/categories',
  CALENDAR: '/calendar',
  ACTIVITY: '/activity',
  SETTINGS: '/settings',
  CATEGORY_DETAILS: '/categories/[id]',
  ADD_CATEGORY: '/categories/add',
  ITEM_DETAILS: '/items/[id]',
  ADD_ITEM: '/items/add',
  EVENT_DETAILS: '/events/[id]',
  ADD_EVENT: '/events/add',
  MEDIA_GALLERY: '/media-gallery',
  SEARCH: '/search',
  BACKUP: '/backup',
  REPORTS: '/reports',
  REMINDERS_ADD: '/reminders/add',
};

// مفاتيح التخزين المحلي (AsyncStorage)
export const STORAGE_KEYS = {
  THEME_MODE: '@mazrati_theme_mode',
  LANGUAGE: '@mazrati_language',
  FIRST_LAUNCH: '@mazrati_first_launch',
};

// defaults
export const DEFAULT_THEME_MODE = 'system'; // light | dark | system
export const DEFAULT_LANGUAGE = 'ar'; // ar | en

// اتجاه النص حسب اللغة
export const DIRECTIONS = {
  ar: 'rtl',
  en: 'ltr',
};

export default {
  APP_NAME,
  APP_NAME_EN,
  APP_DESCRIPTION,
  APP_VERSION,
  ROUTES,
  STORAGE_KEYS,
  DEFAULT_THEME_MODE,
  DEFAULT_LANGUAGE,
  DIRECTIONS,
};
