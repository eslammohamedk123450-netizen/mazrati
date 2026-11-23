/**
 * MAZRATI - Settings Screen
 * إعدادات المظهر والتنبيهات والبيانات والوصول إلى الأدوات المساندة.
 */
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { requestNotificationPermission, getNotificationPermissionStatus } from '../../services/reminderService';
import { APP_NAME, APP_VERSION } from '../../constants';

const SettingRow = ({ icon, title, subtitle, onPress, color }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: color || theme.colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.rowSubtitle, { color: theme.colors.secondaryText }]}>{subtitle}</Text> : null}
      </View>
      <Text style={[styles.chevron, { color: theme.colors.secondaryText }]}>‹</Text>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { mode, resolvedMode, setThemeMode, theme } = useTheme();
  const router = useRouter();
  const [notificationState, setNotificationState] = useState(null);
  const options = [
    { value: 'light', label: 'فاتح', icon: '☀️' },
    { value: 'dark', label: 'داكن', icon: '🌙' },
    { value: 'system', label: 'النظام', icon: '◐' },
  ];

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationState(granted);
    Alert.alert(granted ? 'تم التفعيل' : 'لم يتم منح الإذن', granted ? 'ستظهر إشعارات التذكيرات القادمة.' : 'يمكن منح الإذن من إعدادات الجهاز.');
  };

  const checkNotifications = async () => {
    const granted = await getNotificationPermissionStatus();
    setNotificationState(granted);
    Alert.alert('حالة الإشعارات', granted ? 'الإشعارات مفعّلة.' : 'الإشعارات غير مفعّلة.');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.colors.text }]}>الإعدادات</Text>
      <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>تحكم في تجربة مزرعتي وبياناتك المحلية</Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>المظهر</Text>
      <View style={[styles.themeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.optionsRow}>
          {options.map((opt) => {
            const selected = mode === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, { backgroundColor: selected ? theme.colors.primary : theme.colors.background, borderColor: selected ? theme.colors.primary : theme.colors.border }]}
                onPress={() => setThemeMode(opt.value)}
              >
                <Text style={styles.optionIcon}>{opt.icon}</Text>
                <Text style={[styles.optionText, { color: selected ? '#FFFFFF' : theme.colors.text }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.current, { color: theme.colors.secondaryText }]}>الوضع الفعلي: {resolvedMode === 'dark' ? 'داكن' : 'فاتح'}</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>الإشعارات</Text>
      <SettingRow icon="🔔" title="تفعيل إشعارات التذكيرات" subtitle={notificationState === true ? 'مفعّلة' : notificationState === false ? 'غير مفعّلة' : 'التحقق من حالة الإذن'} onPress={enableNotifications} />
      <SettingRow icon="✓" title="فحص حالة الإشعارات" subtitle="تحديث حالة إذن النظام" onPress={checkNotifications} />

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>البيانات والأدوات</Text>
      <SettingRow icon="💾" title="النسخ الاحتياطي والاستعادة" subtitle="تصدير واستعادة بيانات مزرعتي" onPress={() => router.push('/backup')} />
      <SettingRow icon="📊" title="التقارير" subtitle="إحصاءات مبنية على بياناتك المحلية" onPress={() => router.push('/reports')} />
      <SettingRow icon="🖼️" title="معرض الوسائط" subtitle="استعراض صور وتسجيلات العناصر" onPress={() => router.push('/media-gallery')} />
      <SettingRow icon="🔎" title="البحث الشامل" subtitle="البحث في الأقسام والعناصر والأحداث" onPress={() => router.push('/search')} />

      <View style={[styles.about, { backgroundColor: theme.colors.secondarySurface || theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.aboutTitle, { color: theme.colors.text }]}>{APP_NAME} | MAZRATI</Text>
        <Text style={[styles.aboutText, { color: theme.colors.secondaryText }]}>تطبيق محلي لإدارة وتوثيق ممتلكاتك وعناصرك دون الحاجة إلى اتصال بالإنترنت.</Text>
        <Text style={[styles.version, { color: theme.colors.secondaryText }]}>الإصدار {APP_VERSION}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'right' },
  subtitle: { fontSize: 14, marginTop: 6, marginBottom: 24, textAlign: 'right' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 14, marginBottom: 10, textAlign: 'right' },
  themeCard: { borderWidth: 1, borderRadius: 16, padding: 12 },
  optionsRow: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, minHeight: 72, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  optionIcon: { fontSize: 20 },
  optionText: { fontSize: 13, fontWeight: '700' },
  current: { textAlign: 'center', fontSize: 12, marginTop: 10 },
  row: { minHeight: 68, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  rowIcon: { fontSize: 22, width: 36, textAlign: 'center' },
  rowCopy: { flex: 1, marginHorizontal: 10 },
  rowTitle: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  rowSubtitle: { fontSize: 12, marginTop: 3, textAlign: 'right' },
  chevron: { fontSize: 26, transform: [{ rotate: '180deg' }] },
  about: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 22 },
  aboutTitle: { fontSize: 16, fontWeight: '800', textAlign: 'right' },
  aboutText: { fontSize: 13, lineHeight: 21, marginTop: 8, textAlign: 'right' },
  version: { fontSize: 12, marginTop: 10, textAlign: 'right' },
});
