/**
 * MAZRATI - Event Service
 * خدمة إدارة الأحداث (Events & Records) مع حفظ محلي
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const EVENTS_KEY = '@mazrati_events';
const SEEDED_KEY = '@mazrati_events_seeded';

export const EVENT_TYPES = [
  { key: 'note', label: 'ملاحظة عامة', icon: '📝' },
  { key: 'health', label: 'حدث صحي', icon: '🏥' },
  { key: 'treatment', label: 'علاج', icon: '💊' },
  { key: 'vaccination', label: 'تحصين', icon: '💉' },
  { key: 'purchase', label: 'شراء', icon: '🛒' },
  { key: 'sale', label: 'بيع', icon: '💰' },
  { key: 'maintenance', label: 'صيانة', icon: '🔧' },
  { key: 'production', label: 'إنتاج', icon: '📊' },
  { key: 'transfer', label: 'نقل', icon: '🚚' },
  { key: 'status_change', label: 'تغيير حالة', icon: '🔄' },
  { key: 'photo', label: 'إضافة صورة', icon: '📷' },
  { key: 'followup', label: 'متابعة', icon: '👁️' },
  { key: 'custom', label: 'حدث مخصص', icon: '📌' },
];

const SEED_EVENTS = [
  {
    id: 'evt_201',
    itemId: 'item_101',
    categoryId: '1',
    title: 'تسميد النباتات',
    type: 'note',
    date: '2026-03-10',
    time: '09:00',
    description: 'إضافة سماد عضوي للنخيل',
    images: [],
    audioUri: null,
    reminderId: null,
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'evt_202',
    itemId: 'item_101',
    categoryId: '1',
    title: 'تطعيم الماشية',
    type: 'vaccination',
    date: '2026-03-15',
    time: '10:30',
    description: 'التطعيم الموسمي للأبقار',
    images: [],
    audioUri: null,
    reminderId: null,
    createdAt: '2026-03-15T10:30:00Z',
    updatedAt: '2026-03-15T10:30:00Z',
  },
];

const seedEvents = async () => {
  try {
    const seeded = await AsyncStorage.getItem(SEEDED_KEY);
    if (!seeded) {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(SEED_EVENTS));
      await AsyncStorage.setItem(SEEDED_KEY, 'true');
    }
  } catch (error) {
    console.error('Failed to seed events:', error);
  }
};

export const getEvents = async () => {
  await seedEvents();
  try {
    const data = await AsyncStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [...SEED_EVENTS];
  } catch (error) {
    console.error('Failed to get events:', error);
    return [...SEED_EVENTS];
  }
};

export const getEventById = async (id) => {
  const events = await getEvents();
  return events.find((e) => e.id === id) || null;
};

export const getEventsByItem = async (itemId) => {
  const events = await getEvents();
  return events
    .filter((e) => e.itemId === itemId)
    .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
};

export const getEventsByCategory = async (categoryId) => {
  const events = await getEvents();
  return events.filter((e) => e.categoryId === categoryId);
};

export const createEvent = async (eventData) => {
  const events = await getEvents();
  const newEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    itemId: eventData.itemId || null,
    categoryId: eventData.categoryId || null,
    title: eventData.title.trim(),
    type: eventData.type || 'note',
    customType: eventData.customType || '',
    date: eventData.date,
    time: eventData.time,
    description: eventData.description || '',
    images: eventData.images || [],
    audioUri: eventData.audioUri || null,
    reminderId: eventData.reminderId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  events.push(newEvent);
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  return newEvent;
};

export const updateEvent = async (id, updates) => {
  const events = await getEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  events[index] = {
    ...events[index],
    ...updates,
    title: updates.title ? updates.title.trim() : events[index].title,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  return events[index];
};

export const deleteEvent = async (id) => {
  const events = await getEvents();
  const filtered = events.filter((e) => e.id !== id);
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
  return true;
};

export const searchEvents = async (query, filters = {}) => {
  const events = await getEvents();
  let results = [...events];

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
    );
  }

  if (filters.itemId) {
    results = results.filter((e) => e.itemId === filters.itemId);
  }

  if (filters.categoryId) {
    results = results.filter((e) => e.categoryId === filters.categoryId);
  }

  if (filters.type) {
    results = results.filter((e) => e.type === filters.type);
  }

  if (filters.dateFrom) {
    results = results.filter((e) => e.date >= filters.dateFrom);
  }

  if (filters.dateTo) {
    results = results.filter((e) => e.date <= filters.dateTo);
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

  return results;
};

export const getEventStats = async () => {
  const events = await getEvents();
  return {
    total: events.length,
    byType: EVENT_TYPES.reduce((acc, t) => {
      acc[t.key] = events.filter((e) => e.type === t.key).length;
      return acc;
    }, {}),
  };
};

export const resetEvents = async () => {
  await AsyncStorage.removeItem(EVENTS_KEY);
  await AsyncStorage.removeItem(SEEDED_KEY);
  await seedEvents();
};

export default {
  EVENT_TYPES,
  getEvents,
  getEventById,
  getEventsByItem,
  getEventsByCategory,
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents,
  getEventStats,
  resetEvents,
};
