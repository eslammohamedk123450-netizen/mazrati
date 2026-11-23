/**
 * MAZRATI - QuickActionButton
 * زر إجراء سريع (أيقونة + عنوان)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

const QuickActionButton = ({ icon, label, onPress, style }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.label, { color: theme.colors.text }]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default QuickActionButton;
