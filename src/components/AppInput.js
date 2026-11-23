/**
 * MAZRATI - AppInput
 * حقل إدخال متعدد الاستخدامات مع تسمية ورسالة خطأ
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, I18nManager } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AppInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  icon,
  style,
  inputStyle,
  editable = true,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error
              ? '#D32F2F'
              : isFocused
              ? theme.colors.primary
              : theme.colors.border,
          },
        ]}
      >
        {icon ? (
          <Text style={[styles.icon, { color: theme.colors.secondaryText }]}>{icon}</Text>
        ) : null}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              textAlign: I18nManager.isRTL ? 'right' : 'left',
            },
            multiline && { height: numberOfLines * 24, textAlignVertical: 'top' },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.secondaryText}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error ? (
        <Text style={[styles.error, { color: '#D32F2F' }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default AppInput;
