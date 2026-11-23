/**
 * MAZRATI - Items Screen
 * صفحة العناصر (Items Management)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useItems } from '../../contexts/ItemsContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { ITEM_STATUSES, ITEM_TYPES } from '../../services/itemService';
import AppEmptyState from '../../components/AppEmptyState';

const ItemsScreen = () => {
  const { theme } = useTheme();
  const { items, loading, refresh, deleteItem } = useItems();
  const { categories } = useCategories();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  }, [refresh]);

  const getCategoryName = useCallback(
    (categoryId) => {
      const cat = categories.find((c) => c.id === categoryId);
      return cat ? cat.name : 'غير محدد';
    },
    [categories]
  );

  const filteredItems = useMemo(() => {
    let results = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          i.internalNumber.toLowerCase().includes(q) ||
          (i.customNumber && i.customNumber.toLowerCase().includes(q))
      );
    }

    if (filterCategory) {
      results = results.filter((i) => i.categoryId === filterCategory);
    }

    if (filterType) {
      results = results.filter((i) => i.type === filterType);
    }

    if (filterStatus) {
      results = results.filter((i) => i.status === filterStatus);
    }

    switch (sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'updated':
        results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
    }

    return results;
  }, [items, searchQuery, filterCategory, filterType, filterStatus, sortBy]);

  const handleDelete = useCallback(
    (item) => {
      Alert.alert(
        'حذف عنصر',
        `هل أنت متأكد من حذف "${item.name}"؟`,
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'حذف',
            style: 'destructive',
            onPress: async () => {
              await deleteItem(item.id);
            },
          },
        ]
      );
    },
    [deleteItem]
  );

  const renderItem = ({ item }) => {
    const statusInfo = ITEM_STATUSES.find((s) => s.key === item.status);
    const typeInfo = ITEM_TYPES.find((t) => t.key === item.type);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => router.push(`/items/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          {item.primaryImage ? (
            <Image source={{ uri: item.primaryImage }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImagePlaceholder, { backgroundColor: theme.colors.background }]}>
              <Text style={styles.cardImageIcon}>📦</Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.secondaryText }]} numberOfLines={1}>
              {getCategoryName(item.categoryId)} • {typeInfo?.label || item.type}
            </Text>
            <View style={styles.cardMeta}>
              <Text style={[styles.cardNumber, { color: theme.colors.secondaryText }]}>
                {item.internalNumber}
              </Text>
              {item.customNumber ? (
                <Text style={[styles.cardCustomNumber, { color: theme.colors.secondaryText }]}>
                  • {item.customNumber}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: (statusInfo?.color || '#718074') + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo?.color || '#718074' }]}>
              {statusInfo?.label || item.status}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => router.push(`/items/${item.id}?edit=true`)}
          >
            <Text style={[styles.footerButtonText, { color: theme.colors.primary }]}>✏️ تعديل</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => router.push(`/items/${item.id}`)}
          >
            <Text style={[styles.footerButtonText, { color: theme.colors.primary }]}>👁️ عرض</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={[styles.footerButtonText, { color: '#D32F2F' }]}>🗑️ حذف</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>العناصر</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.secondaryText }]}>
            إجمالي: {items.length} عنصر
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/items/add')}
        >
          <Text style={styles.addButtonText}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="بحث عن عنصر..."
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

      {/* Filter toggle */}
      <TouchableOpacity
        style={[styles.filterToggle, { borderColor: theme.colors.border }]}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Text style={[styles.filterToggleText, { color: theme.colors.text }]}>
          🔧 فلاتر وترتيب {showFilters ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {showFilters ? (
        <View style={styles.filtersPanel}>
          {/* Category filter */}
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>القسم:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, { borderColor: theme.colors.border }, !filterCategory && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              onPress={() => setFilterCategory(null)}
            >
              <Text style={[styles.filterText, { color: !filterCategory ? '#FFFFFF' : theme.colors.text }]}>الكل</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filterChip, { borderColor: theme.colors.border }, filterCategory === cat.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                onPress={() => setFilterCategory(cat.id)}
              >
                <Text style={[styles.filterText, { color: filterCategory === cat.id ? '#FFFFFF' : theme.colors.text }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Type filter */}
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>النوع:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, { borderColor: theme.colors.border }, !filterType && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              onPress={() => setFilterType(null)}
            >
              <Text style={[styles.filterText, { color: !filterType ? '#FFFFFF' : theme.colors.text }]}>الكل</Text>
            </TouchableOpacity>
            {ITEM_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.filterChip, { borderColor: theme.colors.border }, filterType === t.key && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                onPress={() => setFilterType(t.key)}
              >
                <Text style={[styles.filterText, { color: filterType === t.key ? '#FFFFFF' : theme.colors.text }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Status filter */}
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>الحالة:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, { borderColor: theme.colors.border }, !filterStatus && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              onPress={() => setFilterStatus(null)}
            >
              <Text style={[styles.filterText, { color: !filterStatus ? '#FFFFFF' : theme.colors.text }]}>الكل</Text>
            </TouchableOpacity>
            {ITEM_STATUSES.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.filterChip, { borderColor: theme.colors.border }, filterStatus === s.key && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                onPress={() => setFilterStatus(s.key)}
              >
                <Text style={[styles.filterText, { color: filterStatus === s.key ? '#FFFFFF' : theme.colors.text }]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sort */}
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>الترتيب:</Text>
          <View style={styles.sortRow}>
            {[
              { key: 'newest', label: 'الأحدث' },
              { key: 'name', label: 'أبجدي' },
              { key: 'updated', label: 'آخر تحديث' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortChip, { borderColor: theme.colors.border }, sortBy === opt.key && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                onPress={() => setSortBy(opt.key)}
              >
                <Text style={[styles.sortText, { color: sortBy === opt.key ? '#FFFFFF' : theme.colors.text }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {/* List */}
      {filteredItems.length === 0 ? (
        <AppEmptyState
          icon={searchQuery || filterCategory || filterType || filterStatus ? '🔍' : '📦'}
          title={searchQuery || filterCategory || filterType || filterStatus ? 'لا توجد نتائج' : 'لا توجد عناصر'}
          description={
            searchQuery || filterCategory || filterType || filterStatus
              ? 'جرّب تغيير البحث أو الفلاتر'
              : 'أضف عنصرًا جديدًا للبدء'
          }
          actionLabel={!searchQuery && !filterCategory && !filterType && !filterStatus ? 'إضافة عنصر' : undefined}
          onAction={() => router.push('/items/add')}
        />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
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
  addButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
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
  filterToggle: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterToggleText: { fontSize: 14, fontWeight: '600' },
  filtersPanel: { paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  filterLabel: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  filterScroll: { marginBottom: 4 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  filterText: { fontSize: 12, fontWeight: '600' },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortText: { fontSize: 12, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardImage: { width: 56, height: 56, borderRadius: 12 },
  cardImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageIcon: { fontSize: 24 },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSubtitle: { fontSize: 12 },
  cardMeta: { flexDirection: 'row', gap: 4, marginTop: 2 },
  cardNumber: { fontSize: 11, fontWeight: '600' },
  cardCustomNumber: { fontSize: 11 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerButton: { paddingVertical: 4, paddingHorizontal: 8 },
  footerButtonText: { fontSize: 12, fontWeight: '600' },
});

export default ItemsScreen;
