/**
 * MAZRATI - Category Details Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { useItems } from '../../contexts/ItemsContext';
import { useEvents } from '../../contexts/EventsContext';

const CategoryDetailsScreen = () => {
  const { theme } = useTheme();
  const { getCategoryById, deleteCategory } = useCategories();
  const { items, getItemsByCategory } = useItems();
  const { getEventsByItem } = useEvents();
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = params.id;

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const cat = await getCategoryById(categoryId);
      setCategory(cat);
      setLoading(false);
    };
    load();
  }, [categoryId, getCategoryById]);

  const handleEdit = () => {
    router.push(`/categories/add?id=${categoryId}`);
  };

  const handleDelete = () => {
    const itemCount = category?.itemCount || 0;
    Alert.alert(
      'حذف قسم',
      itemCount > 0
        ? `هذا القسم يحتوي على ${itemCount} عنصر. هل أنت متأكد من حذفه؟`
        : 'هل أنت متأكد من حذف هذا القسم؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(categoryId);
            router.back();
          },
        },
      ]
    );
  };

  const handleAddItem = () => {
    router.push(`/items/add?categoryId=${categoryId}`);
  };

  const handleItemPress = (itemId) => {
    router.push(`/items/${itemId}`);
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>القسم غير موجود</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: theme.colors.primary }]}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const iconEmoji =
    category.icon === 'paw' ? '🐾' :
    category.icon === 'leaf' ? '🌿' :
    category.icon === 'tools' ? '🔧' :
    category.icon === 'package' ? '📦' :
    '📁';

  const categoryItems = items.filter((i) => i.categoryId === categoryId);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Image */}
      {category.image ? (
        <Image source={{ uri: category.image }} style={styles.coverImage} />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: category.color + '20' }]}>
          <Text style={styles.coverIcon}>{iconEmoji}</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.infoSection}>
        <View style={styles.titleRow}>
          <View style={[styles.colorDot, { backgroundColor: category.color }]} />
          <Text style={[styles.title, { color: theme.colors.text }]}>{category.name}</Text>
        </View>
        {category.description ? (
          <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
            {category.description}
          </Text>
        ) : null}

        {/* Meta */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>العناصر</Text>
            <Text style={[styles.metaValue, { color: theme.colors.text }]}>{categoryItems.length}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>تاريخ الإنشاء</Text>
            <Text style={[styles.metaValue, { color: theme.colors.text }]}>
              {new Date(category.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          {category.updatedAt ? (
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>آخر تحديث</Text>
              <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                {new Date(category.updatedAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleEdit}
          >
            <Text style={styles.actionButtonText}>✏️ تعديل</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
            onPress={handleAddItem}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>+ إضافة عنصر</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Items List */}
      <View style={styles.itemsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>العناصر</Text>
        {categoryItems.length === 0 ? (
          <View style={[styles.emptyItems, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>لا توجد عناصر</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.secondaryText }]}>
              أضف أول عنصر لهذا القسم
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddItem}
            >
              <Text style={styles.emptyButtonText}>+ إضافة عنصر</Text>
            </TouchableOpacity>
          </View>
        ) : (
          categoryItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => handleItemPress(item.id)}
            >
              <Text style={styles.itemIcon}>📦</Text>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
                {item.description ? (
                  <Text style={[styles.itemDesc, { color: theme.colors.secondaryText }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑️ حذف القسم</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16, marginBottom: 12 },
  backLink: { fontSize: 14, fontWeight: '600' },
  coverImage: { width: '100%', height: 220 },
  coverPlaceholder: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverIcon: { fontSize: 64 },
  infoSection: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  colorDot: { width: 16, height: 16, borderRadius: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  metaItem: { minWidth: 100 },
  metaLabel: { fontSize: 12, marginBottom: 2 },
  metaValue: { fontSize: 14, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  itemsSection: { padding: 16, paddingTop: 0 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  emptyItems: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptyDesc: { fontSize: 13, textAlign: 'center' },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  itemIcon: { fontSize: 24 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600' },
  itemDesc: { fontSize: 12, marginTop: 2 },
  dangerSection: { padding: 16, paddingTop: 0 },
  deleteButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(211,47,47,0.1)',
  },
  deleteButtonText: { color: '#D32F2F', fontSize: 14, fontWeight: '600' },
});

export default CategoryDetailsScreen;
