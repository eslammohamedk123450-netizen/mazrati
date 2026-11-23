/**
 * MAZRATI - AppSearchBar
 * شريط بحث (Search Bar) متعدد الاستخدامات
 */

import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, I18nManager } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AppSearchBar = ({
  value,
  onChangeText,
  placeholder = 'بحث...',
  onClear,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        style,
      ]}
    >
      <Text style={[styles.icon, { color: theme.colors.secondaryText }]}>🔍</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            textAlign: I18nManager.isRTL ? 'right' : 'left',
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.secondaryText}
        value={value}
        onChangeText={onChangeText}
      />
      {value ? (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.clear, { color: theme.colors.secondaryText }]}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clear: {
    fontSize: 16,
    padding: 4,
  },
});

export default AppSearchBar;
