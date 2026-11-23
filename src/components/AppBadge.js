/**
 * MAZRATI - AppBadge
 * شارة صغيرة تعرض رقمًا أو حالة
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AppBadge = ({ children, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }, style]}>
      <Text style={[styles.text, { color: '#FFFFFF' }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AppBadge;
