/**
 * MAZRATI - Item Details Screen
 * ملف العنصر الشخصي (Item Profile)
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { useItems } from '../../contexts/ItemsContext';
import { useEvents } from '../../contexts/EventsContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { ITEM_STATUSES } from '../../services/itemService';
import { EVENT_TYPES } from '../../services/eventService';

const ItemDetailsScreen = () => {
  const { theme } = useTheme();
  const { getItemById, deleteItem, moveItem, updateItem } = useItems();
  const { getEventsByItem } = useEvents();
  const { categories } = useCategories();
  const router = useRouter();
  const params = useLocalSearchParams();
  const itemId = params.id;
  const isEdit = params.edit === 'true';

  const [item, setItem] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const it = await getItemById(itemId);
    setItem(it);
    if (it) {
      const evs = await getEventsByItem(itemId);
      setEvents(evs);
    }
    setLoading(false);
  }, [itemId, getItemById, getEventsByItem]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // If edit param, redirect to edit screen
  useEffect(() => {
    if (isEdit && item) {
      router.replace(`/items/add?id=${itemId}`);
    }
  }, [isEdit, item, itemId, router]);

  const handleEdit = () => {
    router.push(`/items/add?id=${itemId}`);
  };

  const handleAddEvent = () => {
    router.push(`/events/add?itemId=${itemId}`);
  };

  const handleMove = () => {
    Alert.alert('نقل إلى قسم', 'اختر قسمًا جديدًا', [
      ...categories
        .filter((c) => c.id !== item?.categoryId)
        .map((cat) => ({
          text: cat.name,
          onPress: async () => {
            await moveItem(itemId, cat.id);
            loadData();
            Alert.alert('تم', `تم نقل "${item?.name}" إلى "${cat.name}"`);
          },
        })),
      { text: 'إلغاء', style: 'cancel' },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'حذف عنصر',
      `هل أنت متأكد من حذف "${item?.name}"؟\nسيتم حذف ${events.length} حدث مرتبط.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'أرشفة',
          onPress: async () => {
            await updateItem(itemId, { status: 'archived' });
            loadData();
          },
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await deleteItem(itemId);
            router.back();
          },
        },
      ]
    );
  };

  const handleEventPress = (eventId) => {
    router.push(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>العنصر غير موجود</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: theme.colors.primary }]}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const category = categories.find((c) => c.id === item.categoryId);
  const statusInfo = ITEM_STATUSES.find((s) => s.key === item.status);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Primary Image */}
      {item.primaryImage ? (
        <Image source={{ uri: item.primaryImage }} style={styles.coverImage} />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={styles.coverIcon}>📦</Text>
        </View>
      )}

      {/* Image Gallery */}
      {item.images && item.images.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery} contentContainerStyle={styles.galleryContent}>
          {item.images.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.galleryThumb} />
          ))}
        </ScrollView>
      ) : null}

      {/* Info */}
      <View style={styles.infoSection}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: (statusInfo?.color || '#718074') + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo?.color || '#718074' }]}>
              {statusInfo?.label || item.status}
            </Text>
          </View>
        </View>
        {item.nameEn ? (
          <Text style={[styles.nameEn, { color: theme.colors.secondaryText }]}>{item.nameEn}</Text>
        ) : null}

        {/* Meta Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>الرقم الداخلي</Text>
            <Text style={[styles.metaValue, { color: theme.colors.text }]}>{item.internalNumber}</Text>
          </View>
          {item.customNumber ? (
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>الرقم الخاص</Text>
              <Text style={[styles.metaValue, { color: theme.colors.text }]}>{item.customNumber}</Text>
            </View>
          ) : null}
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>القسم</Text>
            <Text style={[styles.metaValue, { color: theme.colors.text }]}>{category?.name || 'غير محدد'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>النوع</Text>
            <Text style={[styles.metaValue, { color: theme.colors.text }]}>
              {ITEM_TYPES_LABELS[item.type] || item.type}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>تاريخ الإنشاء</Text>
            <Text style={[styles.metaValue, { color: theme.colors.text }]}>
              {new Date(item.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>آخر تحديث</Text>
            <Text style={[styles.metaValue, { color: theme.colors.text }]}>
              {new Date(item.updatedAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {item.description ? (
          <View style={styles.descSection}>
            <Text style={[styles.descLabel, { color: theme.colors.text }]}>الوصف</Text>
            <Text style={[styles.descText, { color: theme.colors.secondaryText }]}>{item.description}</Text>
          </View>
        ) : null}

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>ملخص النشاط</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{events.length}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.secondaryText }]}>الأحداث</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{item.images?.length || 0}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.secondaryText }]}>الصور</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {events.length > 0 ? new Date(events[0].date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }) : '-'}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.secondaryText }]}>آخر حدث</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.primary }]} onPress={handleEdit}>
            <Text style={styles.actionButtonText}>✏️ تعديل</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]} onPress={handleAddEvent}>
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>📅 تسجيل حدث</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]} onPress={handleMove}>
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>🔄 نقل</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'rgba(211,47,47,0.1)' }]} onPress={handleDelete}>
            <Text style={[styles.actionButtonText, { color: '#D32F2F' }]}>🗑️ حذف</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.timelineSection}>
        <View style={styles.timelineHeader}>
          <Text style={[styles.timelineTitle, { color: theme.colors.text }]}>السجل الزمني</Text>
          <TouchableOpacity onPress={handleAddEvent}>
            <Text style={[styles.addEventLink, { color: theme.colors.primary }]}>+ تسجيل حدث</Text>
          </TouchableOpacity>
        </View>

        {events.length === 0 ? (
          <View style={[styles.emptyTimeline, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>لا توجد أحداث</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.secondaryText }]}>
              سجّل أول حدث لهذا العنصر
            </Text>
            <TouchableOpacity style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]} onPress={handleAddEvent}>
              <Text style={styles.emptyButtonText}>+ تسجيل حدث</Text>
            </TouchableOpacity>
          </View>
        ) : (
          events.map((event, index) => {
            const typeInfo = EVENT_TYPES.find((t) => t.key === event.type);
            return (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => handleEventPress(event.id)}
                activeOpacity={0.7}
              >
                <View style={styles.eventIcon}>
                  <Text style={styles.eventIconText}>{typeInfo?.icon || '📌'}</Text>
                </View>
                <View style={styles.eventContent}>
                  <Text style={[styles.eventTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={[styles.eventType, { color: theme.colors.secondaryText }]}>
                    {typeInfo?.label || event.type}
                  </Text>
                  {event.description ? (
                    <Text style={[styles.eventDesc, { color: theme.colors.secondaryText }]} numberOfLines={2}>
                      {event.description}
                    </Text>
                  ) : null}
                  <Text style={[styles.eventDate, { color: theme.colors.secondaryText }]}>
                    {new Date(event.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })} • {event.time}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.secondaryText, fontSize: 16 }}>›</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// Helper for item type labels
const ITEM_TYPES_LABELS = {
  animal: 'حيوان',
  plant: 'نبات',
  equipment: 'معدات',
  device: 'جهاز',
  product: 'منتج',
  vehicle: 'مركبة',
  property: 'ممتلكات',
  inventory: 'مخزون',
  custom: 'مخصص',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16, marginBottom: 12 },
  backLink: { fontSize: 14, fontWeight: '600' },
  coverImage: { width: '100%', height: 240 },
  coverPlaceholder: {
    width: '100%',
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverIcon: { fontSize: 64 },
  gallery: { paddingVertical: 8 },
  galleryContent: { paddingHorizontal: 16, gap: 8 },
  galleryThumb: { width: 70, height: 70, borderRadius: 10 },
  infoSection: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  nameEn: { fontSize: 14, marginBottom: 12 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  metaItem: { minWidth: 120 },
  metaLabel: { fontSize: 12, marginBottom: 2 },
  metaValue: { fontSize: 14, fontWeight: '600' },
  descSection: { marginBottom: 16 },
  descLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  descText: { fontSize: 14, lineHeight: 20 },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '700' },
  summaryLabel: { fontSize: 11, marginTop: 2 },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  timelineSection: { padding: 16, paddingTop: 0 },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineTitle: { fontSize: 17, fontWeight: '700' },
  addEventLink: { fontSize: 14, fontWeight: '600' },
  emptyTimeline: {
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
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(46,125,70,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventIconText: { fontSize: 22 },
  eventContent: { flex: 1, gap: 2 },
  eventTitle: { fontSize: 14, fontWeight: '600' },
  eventType: { fontSize: 11 },
  eventDesc: { fontSize: 12, lineHeight: 16 },
  eventDate: { fontSize: 11, marginTop: 2 },
});

export default ItemDetailsScreen;
