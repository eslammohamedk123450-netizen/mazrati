/**
 * MAZRATI - Settings Screen (Placeholder)
 * تتضمن تبديل الوضع (فاتح/داكن/نظام) لاختبار Theme Provider
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const { mode, resolvedMode, setThemeMode, theme } = useTheme();

  const options = [
    { value: 'light', label: 'فاتح' },
    { value: 'dark', label: 'داكن' },
    { value: 'system', label: 'نظام' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>⚙️ الإعدادات</Text>
      <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
        صفحة الإعدادات - قيد الإنشاء
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          وضع العرض
        </Text>
        <View style={styles.optionsRow}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.option,
                {
                  backgroundColor:
                    mode === opt.value ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setThemeMode(opt.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: mode === opt.value ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.current, { color: theme.colors.secondaryText }]}>
          الوضع الحالي: {resolvedMode === 'dark' ? 'داكن' : 'فاتح'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  section: { width: '100%', maxWidth: 360 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  optionsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  option: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionText: { fontSize: 14, fontWeight: '600' },
  current: { fontSize: 12, textAlign: 'center' },
});
