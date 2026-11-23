/**
 * MAZRATI - AppLoading
 * مؤشر تحميل (Spinner) مع دعم الوضع (فاتح/داكن)
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AppLoading = ({ size = 'large', color, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator
        size={size}
        color={color || theme.colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default AppLoading;
