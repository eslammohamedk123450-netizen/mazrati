/**
 * MAZRATI - Reports Screen
 * شاشة التقارير والإحصاءات
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCategories } from '../contexts/CategoriesContext';
import { useItems } from '../contexts/ItemsContext';
import { useEvents } from '../contexts/EventsContext';
import { useReminders } from '../contexts/RemindersContext';
import { buildReport, reportToText, getPeriodRange } from '../services/reportService';
import { useRouter } from 'expo-router';

const ReportsScreen = () => {
  const { theme } = useTheme();
  const { categories, loading: categoriesLoading } = useCategories();
  const { items, loading: itemsLoading } = useItems();
  const { events, loading: eventsLoading } = useEvents();
  const { reminders, loading: remindersLoading } = useReminders();
  const router = useRouter();

  const loading = categoriesLoading || itemsLoading || eventsLoading || remindersLoading;

  const [period, setPeriod] = useState('all');
  const [report, setReport] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = useCallback(async (selectedPeriod) => {
    setGenerating(true);
    try {
      const data = await buildReport({ categories, items, events, reminders }, selectedPeriod);
      setReport(data);
    } catch (error) {
      console.error('Report generation error:', error);
    } finally {
      setGenerating(false);
    }
  }, [categories, items, events, reminders]);

  useEffect(() => {
    if (!loading) {
      handleGenerate('all');
    }
  }, [loading, handleGenerate]);

  const periods = [
    { key: 'today', label: 'اليوم' },
    { key: 'week', label: 'هذا الأسبوع' },
    { key: 'month', label: 'هذا الشهر' },
    { key: 'year', label: 'هذا العام' },
    { key: 'all', label: 'كل الوقت' },
  ];

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderCountRow = (label, value, color) => (
    <View style={[styles.countRow, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.countLabel, { color: theme.colors.text }]}>{label}</Text>
      <Text style={[styles.countValue, { color: color || theme.colors.text }]}>{value}</Text>
    </View>
  );

  const renderGroup = (title, rows, color) => (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
      {rows.map((row, idx) => renderCountRow(row.label, row.value, color || theme.colors.text))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.colors.text }]}>📊 التقارير</Text>
      <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
        إحصائيات مباشرة من البيانات المحلية
      </Text>

      <View style={[styles.periodSelector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.periodButton,
              period === p.key && styles.periodButtonActive,
            ]}
            onPress={() => {
              setPeriod(p.key);
              handleGenerate(p.key);
            }}
          >
            <Text style={[styles.periodText, period === p.key && styles.periodTextActive, period === p.key && { color: '#FFFFFF' }]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {generating ? (
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : report ? (
        <>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>الإحصائيات العامة</Text>
            {renderCountRow('الأقسام', report.totals.categories, theme.colors.primary)}
            {renderCountRow('العناصر', report.totals.items, theme.colors.primary)}
            {renderCountRow('الأحداث', report.totals.events, theme.colors.primary)}
            {renderCountRow('التذكيرات', report.totals.reminders, theme.colors.primary)}
          </View>

          {report.itemsByCategory.length > 0
            ? renderGroup('العناصر حسب القسم', report.itemsByCategory.map((c) => ({ label: `${c.name}: ${c.count}`, value: c.count })))
            : null}

          {report.itemsByStatus.length > 0
            ? renderGroup('العناصر حسب الحالة', report.itemsByStatus.map((s) => ({ label: `${s.label}: ${s.count}`, value: s.count })))
            : null}

          {report.eventsByType.length > 0
            ? renderGroup('الأحداث حسب النوع', report.eventsByType.map((t) => ({ label: `${t.label}: ${t.count}`, value: t.count })))
            : null}

          {renderCountRow('أحداث في الفترة', report.totals.periodEvents, '#1976D2')}
          {renderCountRow('تذكيرات في الفترة', report.totals.periodReminders, '#F57C00')}

          {report.recentEvents.length > 0 ? (
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>أحدث الأحداث</Text>
              {report.recentEvents.map((e) => (
                <View key={e.id} style={styles.eventRow}>
                  <Text style={styles.eventDate}>{e.date}</Text>
                  <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{e.title}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
        onPress={async () => {
          const text = reportToText(report || buildReport({ categories, items, events, reminders }, 'all'));
          Alert.alert('تقرير', text);
        }}
        disabled={!report}
      >
        <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>عرض التقرير النصي</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  periodSelector: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  periodButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  periodButtonActive: {},
  periodText: { fontSize: 13, fontWeight: '600' },
  periodTextActive: {},
  countRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  countLabel: { fontSize: 14 },
  countValue: { fontSize: 14, fontWeight: '700' },
  eventRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  eventDate: { fontSize: 13, color: '#1976D2', fontWeight: '600' },
  eventTitle: { fontSize: 14, fontWeight: '600' },
  secondaryButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { fontSize: 15, fontWeight: '600' },
});

export default ReportsScreen;