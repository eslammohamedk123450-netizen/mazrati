/**
 * MAZRATI - Reminders Tab
 * تذكيرات قادمة وسجلها
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useReminders } from '../../contexts/RemindersContext';
import AppEmptyState from '../../components/AppEmptyState';

const RemindersTab = () => {
  const { theme } = useTheme();
  const { reminders, loading, createReminder, toggleReminderDone } = useReminders();
  const router = useRouter();
  const [upcomingOpen, setUpcomingOpen] = useState(true);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const upcoming = reminders.filter((r) => r.status === 'pending').slice(0, 10);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>🔔 تذكيرات</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/reminders/add')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {upcoming.length === 0 ? (
        <AppEmptyState
          icon="🔔"
          title="لا توجد تذكيرات قادمة"
          description="أضف تذكيرًا لمتابعة المهام المهمة"
          actionLabel="إضافة تذكير"
          onAction={() => router.push('/reminders/add')}
        />
      ) : (
        <FlatList
          data={upcoming}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isDone = item.status === 'done';
            return (
              <TouchableOpacity
                style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => toggleReminderDone(item.id)}
              >
                <TouchableOpacity
                  style={[styles.doneBtn, { backgroundColor: isDone ? '#2E7D46' : theme.colors.border }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleReminderDone(item.id);
                  }}
                >
                  <Text style={styles.doneBtnText}>{isDone ? '✓' : ''}</Text>
                </TouchableOpacity>
                <View style={[styles.rowContent, { flexDirection: 'row', flex: 1, gap: 10 }]}>
                  <Text style={[styles.rowTitle, { color: isDone ? theme.colors.secondaryText : theme.colors.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={[styles.rowInfo, { gap: 4 }]}>
                    <Text style={[styles.rowMeta, { color: theme.colors.secondaryText }]}>
                      📅 {item.date} ⏰ {item.time}
                    </Text>
                    {item.category && (
                      <Text style={[styles.rowMeta, { color: theme.colors.primary }]}>
                        {item.category}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={[styles.separator]} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: '700' },
  addButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  doneBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  doneBtnText: { fontSize: 18 },
  rowContent: { flexDirection: 'row', flex: 1, gap: 10 },
  rowTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  rowInfo: { gap: 4 },
  rowMeta: { fontSize: 12 },
  separator: { height: 1, marginLeft: 56, marginRight: 16, marginBottom: 4 },
});

export default RemindersTab;