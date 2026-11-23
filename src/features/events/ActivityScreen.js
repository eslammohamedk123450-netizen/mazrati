/**
 * MAZRATI - Activity Screen (Events Log)
 * سجل الأحداث العام
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useEvents } from '../../contexts/EventsContext';
import { useItems } from '../../contexts/ItemsContext';
import { EVENT_TYPES } from '../../services/eventService';
import AppEmptyState from '../../components/AppEmptyState';

const ActivityScreen = () => {
  const { theme } = useTheme();
  const { events, loading, refresh, deleteEvent } = useEvents();
  const { items } = useItems();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState(null);
  const [filterItemId, setFilterItemId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  }, [refresh]);

  const getItemName = useCallback(
    (itemId) => {
      const item = items.find((i) => i.id === itemId);
      return item ? item.name : '';
    },
    [items]
  );

  const filteredEvents = useMemo(() => {
    let results = [...events];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q))
      );
    }

    if (filterType) {
      results = results.filter((e) => e.type === filterType);
    }

    if (filterItemId) {
      results = results.filter((e) => e.itemId === filterItemId);
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

    return results;
  }, [events, searchQuery, filterType, filterItemId]);

  const handleDelete = useCallback(
    (event) => {
      Alert.alert('حذف حدث', 'هل أنت متأكد من حذف هذا الحدث؟', [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await deleteEvent(event.id);
          },
        },
      ]);
    },
    [deleteEvent]
  );

  const renderEvent = ({ item }) => {
    const typeInfo = EVENT_TYPES.find((t) => t.key === item.type);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => router.push(`/events/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={styles.typeIconText}>{typeInfo?.icon || '📌'}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.cardType, { color: theme.colors.secondaryText }]}>
              {typeInfo?.label || item.type}
            </Text>
            {item.description ? (
              <Text style={[styles.cardDesc, { color: theme.colors.secondaryText }]} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.cardMeta}>
              <Text style={[styles.cardDate, { color: theme.colors.secondaryText }]}>
                {new Date(item.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })} • {item.time}
              </Text>
              {item.itemId ? (
                <Text style={[styles.cardItem, { color: theme.colors.primary }]}>
                  📦 {getItemName(item.itemId)}
                </Text>
              ) : null}
            </View>
          </View>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
            <Text style={{ color: '#D32F2F', fontSize: 16 }}>🗑️</Text>
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>السجل</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.secondaryText }]}>
            إجمالي: {events.length} حدث
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/events/add')}
        >
          <Text style={styles.addButtonText}>+ تسجيل</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="بحث عن حدث..."
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
          🔧 فلاتر {showFilters ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {showFilters ? (
        <View style={styles.filtersPanel}>
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>نوع الحدث:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, { borderColor: theme.colors.border }, !filterType && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              onPress={() => setFilterType(null)}
            >
              <Text style={[styles.filterText, { color: !filterType ? '#FFFFFF' : theme.colors.text }]}>الكل</Text>
            </TouchableOpacity>
            {EVENT_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.filterChip, { borderColor: theme.colors.border }, filterType === t.key && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                onPress={() => setFilterType(t.key)}
              >
                <Text style={[styles.filterText, { color: filterType === t.key ? '#FFFFFF' : theme.colors.text }]}>
                  {t.icon} {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>العنصر:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, { borderColor: theme.colors.border }, !filterItemId && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              onPress={() => setFilterItemId(null)}
            >
              <Text style={[styles.filterText, { color: !filterItemId ? '#FFFFFF' : theme.colors.text }]}>الكل</Text>
            </TouchableOpacity>
            {items.map((it) => (
              <TouchableOpacity
                key={it.id}
                style={[styles.filterChip, { borderColor: theme.colors.border }, filterItemId === it.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                onPress={() => setFilterItemId(it.id)}
              >
                <Text style={[styles.filterText, { color: filterItemId === it.id ? '#FFFFFF' : theme.colors.text }]}>
                  {it.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {filteredEvents.length === 0 ? (
        <AppEmptyState
          icon={searchQuery || filterType || filterItemId ? '🔍' : '📋'}
          title={searchQuery || filterType || filterItemId ? 'لا توجد نتائج' : 'لا توجد أحداث'}
          description={
            searchQuery || filterType || filterItemId
              ? 'جرّب تغيير البحث أو الفلاتر'
              : 'سجّل أول حدث للبدء'
          }
          actionLabel={!searchQuery && !filterType && !filterItemId ? 'تسجيل حدث' : undefined}
          onAction={() => router.push('/events/add')}
        />
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEvent}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  addButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15 },
  clearIcon: { fontSize: 16, padding: 4 },
  filterToggle: { marginHorizontal: 16, marginBottom: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  filterToggleText: { fontSize: 14, fontWeight: '600' },
  filtersPanel: { paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  filterLabel: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  filterScroll: { marginBottom: 4 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginRight: 6 },
  filterText: { fontSize: 12, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  typeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeIconText: { fontSize: 22 },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardType: { fontSize: 12 },
  cardDesc: { fontSize: 12, lineHeight: 16 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  cardDate: { fontSize: 11 },
  cardItem: { fontSize: 11, fontWeight: '600' },
  deleteButton: { padding: 4 },
});

export default ActivityScreen;
