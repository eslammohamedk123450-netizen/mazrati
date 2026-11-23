/**
 * MAZRATI - AppEmptyState
 * حالة فارغة (Empty State) مع أيقونة ونص وزر اختياري
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AppEmptyState = ({ icon, title, description, actionLabel, onAction, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon ? (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      ) : null}
      {title ? (
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      ) : null}
      {description ? (
        <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
          {description}
        </Text>
      ) : null}
      {actionLabel ? (
        <View style={styles.actionContainer}>
          <Text
            style={[styles.actionText, { color: theme.colors.primary }]}
            onPress={onAction}
          >
            {actionLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionContainer: {
    marginTop: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppEmptyState;
