/**
 * MAZRATI - AppCard
 * بطاقة متعددة الاستخدامات مع ظل خفيف وزوايا مستديرة
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AppCard = ({ children, onPress, style, padding = 'base' }) => {
  const { theme } = useTheme();

  const paddingValues = {
    none: 0,
    sm: 8,
    base: 16,
    lg: 20,
    xl: 24,
  };

  const paddingValue = paddingValues[padding] ?? paddingValues.base;

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          padding: paddingValue,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default AppCard;
