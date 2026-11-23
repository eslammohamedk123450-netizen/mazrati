/**
 * MAZRATI - Categories Screen
 * صفحة الأقسام (Categories Management)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { useItems } from '../../contexts/ItemsContext';
import AppEmptyState from '../../components/AppEmptyState';

const SORT_OPTIONS = [
  { key: 'newest', label: 'الأحدث' },
  { key: 'name', label: 'أبجدي' },
  { key: 'itemCount', label: 'عدد العناصر' },
];

const CategoriesScreen = () => {
  const { theme } = useTheme();
  const { categories, loading, refresh, deleteCategory } = useCategories();
  const { items } = useItems();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterHasItems, setFilterHasItems] = useState(false);
  const [filterEmpty, setFilterEmpty] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  }, [refresh]);

  // Filtered & sorted categories
  const filteredCategories = useMemo(() => {
    let results = [...categories];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.nameEn && c.nameEn.toLowerCase().includes(q))
      );
    }

    // Filter: has items
    if (filterHasItems) {
      results = results.filter((c) => items.filter((i) => i.categoryId === c.id).length > 0);
    }

    // Filter: empty
    if (filterEmpty) {
      results = results.filter((c) => items.filter((i) => i.categoryId === c.id).length === 0);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'itemCount':
        results.sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0));
        break;
    }

    return results;
  }, [categories, searchQuery, filterHasItems, filterEmpty, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const getItemCount = (catId) => items.filter((i) => i.categoryId === catId).length;
    const withItems = categories.filter((c) => getItemCount(c.id) > 0).length;
    const empty = categories.length - withItems;
    const totalItems = items.length;
    return {
      total: categories.length,
      totalItems,
      withItems,
      empty,
    };
  }, [categories, items]);

  const handleDelete = useCallback(
    (category) => {
      const itemCount = category.itemCount || 0;
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
              await deleteCategory(category.id);
            },
          },
        ]
      );
    },
    [deleteCategory]
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => router.push(`/categories/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>{item.icon === 'paw' ? '🐾' : item.icon === 'leaf' ? '🌿' : item.icon === 'tools' ? '🔧' : item.icon === 'package' ? '📦' : '📁'}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description ? (
            <Text style={[styles.cardDesc, { color: theme.colors.secondaryText }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => {
            Alert.alert(item.name, 'اختر إجراء', [
              { text: 'عرض التفاصيل', onPress: () => router.push(`/categories/${item.id}`) },
              { text: 'تعديل', onPress: () => router.push(`/categories/${item.id}?edit=true`) },
              { text: 'حذف', style: 'destructive', onPress: () => handleDelete(item) },
              { text: 'إلغاء', style: 'cancel' },
            ]);
          }}
        >
          <Text style={[styles.optionsIcon, { color: theme.colors.secondaryText }]}>⋮</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.cardStat}>
          <Text style={[styles.cardStatLabel, { color: theme.colors.secondaryText }]}>العناصر</Text>
          <Text style={[styles.cardStatValue, { color: theme.colors.primary }]}>{items.filter((i) => i.categoryId === item.id).length}</Text>
        </View>
        <Text style={[styles.cardDate, { color: theme.colors.secondaryText }]}>
          {new Date(item.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>الأقسام</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.secondaryText }]}>
            نظّم كل ما تريد متابعته في مكان واحد
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/categories/add')}
        >
          <Text style={styles.addButtonText}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>إجمالي</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.totalItems}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>عناصر</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.withItems}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>مملوءة</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.empty}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>فارغة</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="بحث عن قسم..."
          placeholderTextColor={theme.colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={[styles.clearIcon, { color: theme.colors.secondaryText }]}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters & Sort */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { borderColor: theme.colors.border },
            filterHasItems && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
          ]}
          onPress={() => { setFilterHasItems(!filterHasItems); setFilterEmpty(false); }}
        >
          <Text style={[styles.filterText, { color: filterHasItems ? '#FFFFFF' : theme.colors.text }]}>
            مملوءة
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { borderColor: theme.colors.border },
            filterEmpty && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
          ]}
          onPress={() => { setFilterEmpty(!filterEmpty); setFilterHasItems(false); }}
        >
          <Text style={[styles.filterText, { color: filterEmpty ? '#FFFFFF' : theme.colors.text }]}>
            فارغة
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, { borderColor: theme.colors.border }]}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Text style={[styles.sortText, { color: theme.colors.text }]}>
            ↕ {SORT_OPTIONS.find((s) => s.key === sortBy)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      {showSortMenu ? (
        <View style={[styles.sortMenu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.sortOption}
              onPress={() => { setSortBy(opt.key); setShowSortMenu(false); }}
            >
              <Text style={[styles.sortOptionText, { color: sortBy === opt.key ? theme.colors.primary : theme.colors.text }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* List */}
      {filteredCategories.length === 0 ? (
        <AppEmptyState
          icon={searchQuery || filterHasItems || filterEmpty ? '🔍' : '🗂️'}
          title={
            searchQuery || filterHasItems || filterEmpty
              ? 'لا توجد نتائج'
              : 'لا توجد أقسام'
          }
          description={
            searchQuery || filterHasItems || filterEmpty
              ? 'جرّب تغيير البحث أو الفلاتر'
              : 'أضف قسمًا جديدًا للبدء'
          }
          actionLabel={!searchQuery && !filterHasItems && !filterEmpty ? 'إضافة قسم' : undefined}
          onAction={() => router.push('/categories/add')}
        />
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  statChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15 },
  clearIcon: { fontSize: 16, padding: 4 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 'auto',
  },
  sortText: { fontSize: 13, fontWeight: '600' },
  sortMenu: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sortOption: { paddingVertical: 12, paddingHorizontal: 16 },
  sortOptionText: { fontSize: 14, fontWeight: '500' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(46,125,70,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: { fontSize: 24 },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardDesc: { fontSize: 12, lineHeight: 16 },
  optionsButton: { padding: 4 },
  optionsIcon: { fontSize: 20, fontWeight: '700' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  cardStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardStatLabel: { fontSize: 12 },
  cardStatValue: { fontSize: 14, fontWeight: '700' },
  cardDate: { fontSize: 11 },
});

export default CategoriesScreen;
