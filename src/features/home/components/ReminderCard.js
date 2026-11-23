/**
 * MAZRATI - ReminderCard
 * بطاقة تذكير قادم (عنوان + تاريخ/وقت + فئة + مؤشر قرب)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

const ReminderCard = ({ reminder, onPress }) => {
  const { theme } = useTheme();

  const urgencyColors = {
    urgent: '#D32F2F',
    soon: '#F57C00',
    later: theme.colors.primary,
  };

  const urgencyLabels = {
    urgent: 'عاجل',
    soon: 'قريباً',
    later: 'لاحقاً',
  };

  const urgencyColor = urgencyColors[reminder.urgency] || theme.colors.primary;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={reminder.title}
      accessibilityRole="button"
    >
      <View style={[styles.urgencyBar, { backgroundColor: urgencyColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {reminder.title}
          </Text>
          <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor + '20' }]}>
            <Text style={[styles.urgencyText, { color: urgencyColor }]}>
              {urgencyLabels[reminder.urgency]}
            </Text>
          </View>
        </View>
        <Text style={[styles.description, { color: theme.colors.secondaryText }]} numberOfLines={1}>
          {reminder.description}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: theme.colors.secondaryText }]}>
            📅 {formatDate(reminder.date)}  ⏰ {reminder.time}
          </Text>
          {reminder.category ? (
            <Text style={[styles.category, { color: theme.colors.primary }]}>
              {reminder.category}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  urgencyBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ReminderCard;
