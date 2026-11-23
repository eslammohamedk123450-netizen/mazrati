/**
 * MAZRATI - Calendar Screen
 * تقويم التذكيرات والأحداث
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useReminders } from '../../contexts/RemindersContext';
import { useEvents } from '../../contexts/EventsContext';
import { useItems } from '../../contexts/ItemsContext';
import { useCategories } from '../../contexts/CategoriesContext';
import AppEmptyState from '../../components/AppEmptyState';

const CalendarScreen = () => {
  const { theme } = useTheme();
  const { reminders, loading: remindersLoading, refresh: refreshReminders } = useReminders();
  const { events, loading: eventsLoading, refresh: refreshEvents } = useEvents();
  const { items } = useItems();
  const { categories } = useCategories();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const loading = remindersLoading || eventsLoading;

  // تجميع البيانات حسب التاريخ
  const itemsByDate = useMemo(() => {
    const map = {};

    // التذكيرات
    reminders.forEach((r) => {
      if (!r.date) return;
      const key = r.date;
      if (!map[key]) map[key] = { reminders: [], events: [] };
      map[key].reminders.push(r);
    });

    // الأحداث
    events.forEach((e) => {
      if (!e.date) return;
      const key = e.date;
      if (!map[key]) map[key] = { reminders: [], events: [] };
      map[key].events.push(e);
    });

    return map;
  }, [reminders, events]);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.slice(0, 5);
  };

  const getItemName = (itemId) => {
    if (!itemId) return '';
    const item = items.find((i) => i.id === itemId);
    return item ? item.name : '';
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return '';
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : '';
  };

  // التواريخ التي بها أحداث/تذكيرات
  const datesWithItems = useMemo(() => Object.keys(itemsByDate).sort(), [itemsByDate]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header مع اختيار التاريخ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={styles.todayButton}>
          <Text style={[styles.todayButtonText, { color: theme.colors.primary }]}>اليوم</Text>
        </TouchableOpacity>
        <Text style={[styles.currentDate, { color: theme.colors.text }]}>
          {formatDate(selectedDate)}
        </Text>
      </View>

      {/* قائمة التواريخ */}
      <View style={styles.dateList}>
        {datesWithItems.length === 0 ? (
          <AppEmptyState
            icon="📅"
            title="لا توجد أحداث أو تذكيرات"
            description="أضف تذكيرات أو أحداث لترى التقويم"
            actionLabel="إضافة تذكير"
            onAction={() => router.push('/reminders/add')}
          />
        ) : (
          <FlatList
            data={datesWithItems}
            keyExtractor={(d) => d}
            renderItem={({ item: dateKey }) => {
              const { reminders: dayReminders, events: dayEvents } = itemsByDate[dateKey];
              const isSelected = dateKey === selectedDate.toISOString().split('T')[0];

              return (
                <TouchableOpacity
                  style={[
                    styles.dateCard,
                    { backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.surface },
                    { borderColor: isSelected ? theme.colors.primary : theme.colors.border },
                  ]}
                  onPress={() => setSelectedDate(new Date(dateKey))}
                >
                  <View style={styles.dateCardHeader}>
                    <Text style={[styles.dateCardDate, { color: theme.colors.text }]}>
                      {new Date(dateKey).toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </Text>
                    <View style={styles.dateCardBadges}>
                      {dayReminders.length > 0 && (
                        <Text style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                          🔔 {dayReminders.length}
                        </Text>
                      )}
                      {dayEvents.length > 0 && (
                        <Text style={[styles.badge, { backgroundColor: '#1976D2' }]}>
                          📅 {dayEvents.length}
                        </Text>
                      )}
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.dateCardDetails}>
                      {dayReminders.map((r) => (
                        <View key={r.id} style={styles.detailItem}>
                          <Text style={[styles.detailTime, { color: theme.colors.secondaryText }]}>
                            ⏰ {formatTime(r.time)}
                          </Text>
                          <Text style={[styles.detailTitle, { color: theme.colors.text }]}>{r.title}</Text>
                          {r.category ? (
                            <Text style={[styles.detailCategory, { color: theme.colors.primary }]}>
                              {r.category}
                            </Text>
                          ) : null}
                        </View>
                      ))}
                      {dayEvents.map((e) => (
                        <View key={e.id} style={styles.detailItem}>
                          <Text style={[styles.detailTime, { color: theme.colors.secondaryText }]}>
                            ⏰ {formatTime(e.time)}
                          </Text>
                          <Text style={[styles.detailTitle, { color: theme.colors.text }]}>{e.title}</Text>
                          {e.itemId ? (
                            <Text style={[styles.detailCategory, { color: theme.colors.secondaryText }]}>
                              {getItemName(e.itemId)}
                            </Text>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  todayButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  todayButtonText: { fontSize: 14, fontWeight: '600' },
  currentDate: { fontSize: 18, fontWeight: '700' },
  dateList: { flex: 1 },
  dateCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  dateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateCardDate: { fontSize: 16, fontWeight: '700' },
  dateCardBadges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
  dateCardDetails: { marginTop: 12, gap: 8 },
  detailItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  detailTime: { fontSize: 12 },
  detailTitle: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  detailCategory: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});

export default CalendarScreen;
