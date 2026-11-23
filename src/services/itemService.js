/**
 * MAZRATI - Item Service
 * خدمة إدارة العناصر مع حفظ محلي في AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEMS_KEY = '@mazrati_items';
const SEEDED_KEY = '@mazrati_items_seeded';

// حالات العنصر (افتراضية)
export const ITEM_STATUSES = [
  { key: 'active', label: 'نشط', color: '#2E7D46' },
  { key: 'inactive', label: 'غير نشط', color: '#718074' },
  { key: 'monitoring', label: 'قيد المتابعة', color: '#F57C00' },
  { key: 'completed', label: 'مكتمل', color: '#1976D2' },
  { key: 'paused', label: 'متوقف', color: '#D32F2F' },
  { key: 'archived', label: 'مؤرشف', color: '#9E9E9E' },
];

// أنواع العناصر (افتراضية)
export const ITEM_TYPES = [
  { key: 'animal', label: 'حيوان' },
  { key: 'plant', label: 'نبات' },
  { key: 'equipment', label: 'معدات' },
  { key: 'device', label: 'جهاز' },
  { key: 'product', label: 'منتج' },
  { key: 'vehicle', label: 'مركبة' },
  { key: 'property', label: 'ممتلكات' },
  { key: 'inventory', label: 'مخزون' },
  { key: 'custom', label: 'مخصص' },
];

// بيانات تجريبية (seed)
const SEED_ITEMS = [
  {
    id: 'item_101',
    categoryId: '1',
    name: 'بقرة هولشتاين',
    nameEn: 'Holstein Cow',
    type: 'animal',
    status: 'active',
    internalNumber: 'ITM-001',
    customNumber: 'BC-2024-001',
    description: 'بقرة حلوب عالية الإنتاجية',
    images: [],
    primaryImage: null,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'item_102',
    categoryId: '1',
    name: 'أغنام محلية',
    nameEn: 'Local Sheep',
    type: 'animal',
    status: 'active',
    internalNumber: 'ITM-002',
    customNumber: '',
    description: 'أغنام للتسمين',
    images: [],
    primaryImage: null,
    createdAt: '2026-01-20T10:30:00Z',
    updatedAt: '2026-01-20T10:30:00Z',
  },
  {
    id: 'item_103',
    categoryId: '2',
    name: 'نخيل تمور',
    nameEn: 'Date Palm',
    type: 'plant',
    status: 'active',
    internalNumber: 'ITM-003',
    customNumber: '',
    description: 'نخيل للتمور',
    images: [],
    primaryImage: null,
    createdAt: '2026-02-01T14:00:00Z',
    updatedAt: '2026-02-01T14:00:00Z',
  },
  {
    id: 'item_104',
    categoryId: '3',
    name: 'جرار زراعي',
    nameEn: 'Tractor',
    type: 'equipment',
    status: 'active',
    internalNumber: 'ITM-004',
    customNumber: 'TR-001',
    description: 'جرار حراثة',
    images: [],
    primaryImage: null,
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
  },
];

const seedItems = async () => {
  try {
    const seeded = await AsyncStorage.getItem(SEEDED_KEY);
    if (!seeded) {
      await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(SEED_ITEMS));
      await AsyncStorage.setItem(SEEDED_KEY, 'true');
    }
  } catch (error) {
    console.error('Failed to seed items:', error);
  }
};

export const getItems = async () => {
  await seedItems();
  try {
    const data = await AsyncStorage.getItem(ITEMS_KEY);
    return data ? JSON.parse(data) : [...SEED_ITEMS];
  } catch (error) {
    console.error('Failed to get items:', error);
    return [...SEED_ITEMS];
  }
};

export const getItemById = async (id) => {
  const items = await getItems();
  return items.find((i) => i.id === id) || null;
};

export const getItemsByCategory = async (categoryId) => {
  const items = await getItems();
  return items.filter((i) => i.categoryId === categoryId);
};

const generateInternalNumber = async () => {
  const items = await getItems();
  const maxNum = items.reduce((max, item) => {
    const match = item.internalNumber?.match(/ITM-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return Math.max(max, num);
    }
    return max;
  }, 0);
  return `ITM-${String(maxNum + 1).padStart(3, '0')}`;
};

export const createItem = async (itemData) => {
  const items = await getItems();
  const internalNumber = await generateInternalNumber();
  const newItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    categoryId: itemData.categoryId,
    name: itemData.name.trim(),
    nameEn: itemData.nameEn || '',
    type: itemData.type || 'custom',
    status: itemData.status || 'active',
    internalNumber,
    customNumber: itemData.customNumber || '',
    description: itemData.description || '',
    images: itemData.images || [],
    primaryImage: itemData.primaryImage || (itemData.images && itemData.images.length > 0 ? itemData.images[0] : null),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(newItem);
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  return newItem;
};

export const updateItem = async (id, updates) => {
  const items = await getItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;

  // Preserve internalNumber
  const { internalNumber, ...safeUpdates } = updates;
  items[index] = {
    ...items[index],
    ...safeUpdates,
    name: updates.name ? updates.name.trim() : items[index].name,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  return items[index];
};

export const deleteItem = async (id) => {
  const items = await getItems();
  const filtered = items.filter((i) => i.id !== id);
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(filtered));
  return true;
};

export const moveItem = async (id, newCategoryId) => {
  return updateItem(id, { categoryId: newCategoryId });
};

export const searchItems = async (query, filters = {}) => {
  const items = await getItems();
  let results = [...items];

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    results = results.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.customNumber && i.customNumber.toLowerCase().includes(q)) ||
        i.internalNumber.toLowerCase().includes(q)
    );
  }

  if (filters.categoryId) {
    results = results.filter((i) => i.categoryId === filters.categoryId);
  }

  if (filters.type) {
    results = results.filter((i) => i.type === filters.type);
  }

  if (filters.status) {
    results = results.filter((i) => i.status === filters.status);
  }

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'updated':
        results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      default:
        break;
    }
  }

  return results;
};

export const getItemStats = async () => {
  const items = await getItems();
  const byStatus = {};
  ITEM_STATUSES.forEach((s) => {
    byStatus[s.key] = items.filter((i) => i.status === s.key).length;
  });
  const byType = {};
  ITEM_TYPES.forEach((t) => {
    byType[t.key] = items.filter((i) => i.type === t.key).length;
  });
  return {
    total: items.length,
    byStatus,
    byType,
  };
};

export const resetItems = async () => {
  await AsyncStorage.removeItem(ITEMS_KEY);
  await AsyncStorage.removeItem(SEEDED_KEY);
  await seedItems();
};

export default {
  ITEM_STATUSES,
  ITEM_TYPES,
  getItems,
  getItemById,
  getItemsByCategory,
  createItem,
  updateItem,
  deleteItem,
  moveItem,
  searchItems,
  getItemStats,
  resetItems,
};
