/**
 * MAZRATI - ActivityItem
 * عنصر نشاط حديث (أيقونة + عنوان + وصف + وقت)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

const ActivityItem = ({ activity, onPress }) => {
  const { theme } = useTheme();

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={activity.title}
      accessibilityRole="button"
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
        <Text style={styles.icon}>{activity.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {activity.title}
        </Text>
        <Text style={[styles.description, { color: theme.colors.secondaryText }]} numberOfLines={2}>
          {activity.description}
        </Text>
      </View>
      <Text style={[styles.time, { color: theme.colors.secondaryText }]}>
        {formatTime(activity.time)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  time: {
    fontSize: 11,
    textAlign: 'left',
  },
});

export default ActivityItem;
