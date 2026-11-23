/**
 * MAZRATI - Home Screen
 * الصفحة الرئيسية (Home Screen) - تنفيذ كامل
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { useItems } from '../../contexts/ItemsContext';
import { useEvents } from '../../contexts/EventsContext';
import MockDataService from '../../services/mockData';
import { EVENT_TYPES } from '../../services/eventService';
import StatsCard from './components/StatsCard';
import QuickActionButton from './components/QuickActionButton';
import ActivityItem from './components/ActivityItem';
import ReminderCard from './components/ReminderCard';
import AppEmptyState from '../../components/AppEmptyState';

const HomeScreen = () => {
  const { theme } = useTheme();
  const { isRTL } = useLanguage();
  const { categories } = useCategories();
  const { items } = useItems();
  const { events } = useEvents();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isMounted = useRef(true);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [statsData, remindersData, unread] = await Promise.all([
        MockDataService.getHomeStats(),
        MockDataService.getUpcomingReminders(5),
        MockDataService.getUnreadNotificationsCount(),
      ]);
      if (isMounted.current) {
        setStats({
          ...statsData,
          categoriesCount: categories.length,
        });
        setActivities(events.slice(0, 5).map((e) => ({
          id: e.id,
          type: 'event_logged',
          title: e.title,
          description: e.description || 'حدث مسجل',
          icon: EVENT_TYPES.find((t) => t.key === e.type)?.icon || '📌',
          time: e.createdAt,
          relatedId: e.itemId,
          relatedType: e.itemId ? 'item' : 'event',
        })));
        setReminders(remindersData);
        setUnreadCount(unread);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('تعذر تحميل البيانات. يرجى المحاولة مرة أخرى.');
        console.error('Home data load error:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [events]);

  useEffect(() => {
    isMounted.current = true;
    loadData();
    return () => {
      isMounted.current = false;
    };
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // منع النقرات المتكررة
  const navigatingRef = useRef(false);
  const safeNavigate = useCallback((path) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    router.push(path);
    setTimeout(() => {
      navigatingRef.current = false;
    }, 500);
  }, [router]);

  const handleNotificationPress = useCallback(() => {
    safeNavigate('/search'); // placeholder
  }, [safeNavigate]);

  const handleSearchPress = useCallback(() => {
    safeNavigate('/search');
  }, [safeNavigate]);

  const handleStatPress = useCallback((route) => {
    safeNavigate(route);
  }, [safeNavigate]);

  const handleQuickAction = useCallback((route) => {
    safeNavigate(route);
  }, [safeNavigate]);

  const handleActivityPress = useCallback((activity) => {
    if (activity.relatedType === 'item') {
      safeNavigate(`/items/${activity.relatedId}`);
    } else if (activity.relatedType === 'category') {
      safeNavigate(`/categories/${activity.relatedId}`);
    } else if (activity.relatedType === 'event') {
      safeNavigate(`/events/${activity.relatedId}`);
    } else {
      safeNavigate('/activity');
    }
  }, [safeNavigate]);

  const handleReminderPress = useCallback((reminder) => {
    if (reminder.relatedItemId) {
      safeNavigate(`/items/${reminder.relatedItemId}`);
    } else {
      safeNavigate('/calendar');
    }
  }, [safeNavigate]);

  const todayDate = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Loading state
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
          جاري تحميل البيانات...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={loadData}
        >
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🌾</Text>
          <View>
            <Text style={[styles.appName, { color: theme.colors.text }]}>مزرعتي</Text>
            <Text style={[styles.welcomeText, { color: theme.colors.secondaryText }]}>
              مرحباً بك
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleSearchPress}
            accessibilityLabel="بحث"
            accessibilityRole="button"
          >
            <Text style={styles.headerIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleNotificationPress}
            accessibilityLabel="إشعارات"
            accessibilityRole="button"
          >
            <Text style={styles.headerIcon}>🔔</Text>
            {unreadCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: '#D32F2F' }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {/* Date */}
      <Text style={[styles.dateText, { color: theme.colors.secondaryText }]}>{todayDate}</Text>

      {/* Welcome Card */}
      <View style={[styles.welcomeCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.welcomeCardContent}>
          <Text style={styles.welcomeCardTitle}>مرحباً في مزرعتي 🌱</Text>
          <Text style={styles.welcomeCardDesc}>
            تطبيقك الشخصي لإدارة وتوثيق الحيوانات والنباتات والمعدات والمنتجات
          </Text>
          <TouchableOpacity
            style={styles.welcomeCardButton}
            onPress={() => handleQuickAction('/items/add')}
            activeOpacity={0.8}
          >
            <Text style={[styles.welcomeCardButtonText, { color: theme.colors.primary }]}>
              + إضافة عنصر
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>الإحصائيات</Text>
        <View style={styles.statsGrid}>
          <StatsCard
            icon="🗂️"
            value={categories.length}
            label="الأقسام"
            onPress={() => handleStatPress('/categories')}
          />
          <StatsCard
            icon="📦"
            value={items.length}
            label="العناصر"
            onPress={() => handleStatPress('/items')}
          />
          <StatsCard
            icon="📅"
            value={events.length}
            label="الأحداث"
            onPress={() => handleStatPress('/activity')}
          />
          <StatsCard
            icon="🔔"
            value={stats?.remindersCount ?? 0}
            label="التذكيرات"
            onPress={() => handleStatPress('/calendar')}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>إجراءات سريعة</Text>
        <View style={styles.quickActionsRow}>
          <QuickActionButton
            icon="🗂️"
            label="إضافة قسم"
            onPress={() => handleQuickAction('/categories/add')}
          />
          <QuickActionButton
            icon="📦"
            label="إضافة عنصر"
            onPress={() => handleQuickAction('/items/add')}
          />
          <QuickActionButton
            icon="📅"
            label="تسجيل حدث"
            onPress={() => handleQuickAction('/events/add')}
          />
          <QuickActionButton
            icon="🔔"
            label="إضافة تذكير"
            onPress={() => handleQuickAction('/calendar')}
          />
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>آخر النشاطات</Text>
          <TouchableOpacity onPress={() => safeNavigate('/activity')}>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>عرض الكل</Text>
          </TouchableOpacity>
        </View>
        {activities.length === 0 ? (
          <AppEmptyState
            icon="📋"
            title="لا توجد نشاطات"
            description="ستظهر هنا أحدث التغييرات والنشاطات"
          />
        ) : (
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onPress={() => handleActivityPress(activity)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Upcoming Reminders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>التذكيرات القادمة</Text>
          <TouchableOpacity onPress={() => safeNavigate('/calendar')}>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>عرض التقويم</Text>
          </TouchableOpacity>
        </View>
        {reminders.length === 0 ? (
          <AppEmptyState
            icon="🔔"
            title="لا توجد تذكيرات"
            description="أضف تذكيرًا لمتابعة المهام المهمة"
            actionLabel="إضافة تذكير"
            onAction={() => handleQuickAction('/calendar')}
          />
        ) : (
          <View>
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onPress={() => handleReminderPress(reminder)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    fontSize: 32,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
  },
  welcomeText: {
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'right',
  },
  welcomeCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  welcomeCardContent: {
    gap: 8,
  },
  welcomeCardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  welcomeCardDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
  welcomeCardButton: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  welcomeCardButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 4,
  },
});

export default HomeScreen;
