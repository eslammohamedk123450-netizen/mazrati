/**
 * MAZRATI - Category Service
 * خدمة إدارة الأقسام مع حفظ محلي في AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_CATEGORIES, MOCK_ITEMS } from './mockData';

const STORAGE_KEY = '@mazrati_categories';
const SEEDED_KEY = '@mazrati_categories_seeded';

// تهيئة البيانات (seeding) عند أول تشغيل
const seedCategories = async () => {
  try {
    const seeded = await AsyncStorage.getItem(SEEDED_KEY);
    if (!seeded) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CATEGORIES));
      await AsyncStorage.setItem(SEEDED_KEY, 'true');
    }
  } catch (error) {
    console.error('Failed to seed categories:', error);
  }
};

// جلب جميع الأقسام
export const getCategories = async () => {
  await seedCategories();
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [...MOCK_CATEGORIES];
  } catch (error) {
    console.error('Failed to get categories:', error);
    return [...MOCK_CATEGORIES];
  }
};

// جلب قسم بالمعرف
export const getCategoryById = async (id) => {
  const categories = await getCategories();
  return categories.find((c) => c.id === id) || null;
};

// إنشاء قسم جديد
export const createCategory = async (categoryData) => {
  const categories = await getCategories();
  const newCategory = {
    id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: categoryData.name.trim(),
    nameEn: categoryData.nameEn || '',
    description: categoryData.description || '',
    image: categoryData.image || null,
    color: categoryData.color || '#2E7D46',
    icon: categoryData.icon || 'folder',
    itemCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  return newCategory;
};

// تحديث قسم
export const updateCategory = async (id, updates) => {
  const categories = await getCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  categories[index] = {
    ...categories[index],
    ...updates,
    name: updates.name ? updates.name.trim() : categories[index].name,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  return categories[index];
};

// حذف قسم
export const deleteCategory = async (id) => {
  const categories = await getCategories();
  const filtered = categories.filter((c) => c.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// عدد العناصر في قسم
export const getCategoryItemCount = async (categoryId) => {
  // MOCK_ITEMS is the source; in future, read from item service
  return MOCK_ITEMS.filter((i) => i.categoryId === categoryId).length;
};

// إحصائيات الأقسام
export const getCategoryStats = async () => {
  const categories = await getCategories();
  const withItems = categories.filter((c) => (c.itemCount || 0) > 0).length;
  const empty = categories.length - withItems;
  const totalItems = categories.reduce((sum, c) => sum + (c.itemCount || 0), 0);
  return {
    totalCategories: categories.length,
    totalItems,
    categoriesWithItems: withItems,
    emptyCategories: empty,
  };
};

// البحث والتصفية
export const searchCategories = async (query, filters = {}) => {
  const categories = await getCategories();
  let results = [...categories];

  // بحث بالاسم أو الوصف
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(q))
    );
  }

  // تصفية: يحتوي على عناصر
  if (filters.hasItems) {
    results = results.filter((c) => (c.itemCount || 0) > 0);
  }

  // تصفية: فارغ
  if (filters.empty) {
    results = results.filter((c) => (c.itemCount || 0) === 0);
  }

  // ترتيب
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'itemCount':
        results.sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0));
        break;
      default:
        break;
    }
  }

  return results;
};

// إعادة تعيين البيانات (للتطوير)
export const resetCategories = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
  await AsyncStorage.removeItem(SEEDED_KEY);
  await seedCategories();
};

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryItemCount,
  getCategoryStats,
  searchCategories,
  resetCategories,
};
