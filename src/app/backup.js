/**
 * MAZRATI - Backup Screen
 * نسخ احتياطي واستعادة بيانات التطبيق (JSON)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { createBackup, exportBackupAsString, validateBackup, restoreBackup, clearAllData } from '../services/backupService';

const BackupScreen = () => {
  const { theme } = useTheme();
  const [backup, setBackup] = useState(null);
  const [restoredText, setRestoredText] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoringFromText, setRestoringFromText] = useState(false);

  const handleCreateBackup = async () => {
    try {
      const data = await createBackup();
      setBackup(data);
      Alert.alert('تم', `تم إنشاء نسخة احتياطية (نسخة ${data.backupVersion})`);
    } catch (error) {
      Alert.alert('خطأ', 'تعذر إنشاء نسخة احتياطية');
      console.error('Backup error:', error);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      const result = await restoreBackup(restoredText);
      setRestoring(false);
      setRestoredText('');
      Alert.alert('تم', `تم استعادة النسخة بنجاح (${result.restored.items} عنصراً)`);
    } catch (error) {
      setRestoring(false);
      Alert.alert('خطأ', error.message || 'تعذر استعادة النسخة');
      console.error('Restore error:', error);
    }
  };

  const handlePasteRestore = async () => {
    try {
      setRestoringFromText(true);
      setRestoring(true);
      await handleRestore();
      setRestoringFromText(false);
    } catch (error) {
      setRestoringFromText(false);
      setRestoring(false);
      Alert.alert('خطأ', 'خطأ غير متوقع');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'مسح البيانات',
      'هل أنت متأكد من مسح جميع بيانات التطبيق؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('تم', 'تم مسح البيانات بنجاح');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>💾 نسخ احتياطي</Text>
        <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
          احفظ بيانات الأقسام والعناصر والأحداث والتذكيرات في نسخة احتياطية واحدة.
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>إنشاء نسخة احتياطية</Text>
          <Text style={[styles.cardText, { color: theme.colors.secondaryText }]}>
            تتضمن النسخة الحالية من جميع بياناتك والأقسام والعناصر والأحداث والتذكيرات.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCreateBackup}
          >
            <Text style={styles.primaryButtonText}>إنشاء نسخة احتياطية</Text>
          </TouchableOpacity>
        </View>

        {backup ? (
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>بيانات النسخة</Text>
            <Text style={[styles.cardText, { color: theme.colors.secondaryText }]}>
              تم إنشاء النسخة بنجاح. الأرقام بالأسفل هي عدد السجلات المحفوظة.
            </Text>
            <Text style={[styles.backupMeta, { color: theme.colors.secondaryText }]}>
              {JSON.stringify(backup.counts)}
            </Text>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>استعادة من نسخة احتياطية</Text>
          <Text style={[styles.cardText, { color: theme.colors.secondaryText }]}>
            الصق محتوى ملف النسخة الاحتياطية (JSON) الذي حصلت عليه من نسخة سابقة.
          </Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="لصق نص النسخة الاحتياطية هنا..."
            placeholderTextColor={theme.colors.secondaryText}
            value={restoredText}
            onChangeText={setRestoredText}
            multiline
            numberOfLines={6}
          />
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
            onPress={handlePasteRestore}
            disabled={restoring || !restoredText.trim()}
          >
            {restoring ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>استعادة</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.dangerButton, { borderColor: '#D32F2F' }]}
          onPress={handleClearData}
        >
          <Text style={[styles.dangerButtonText, { color: '#D32F2F' }]}>مسح جميع البيانات</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  cardText: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  backupMeta: { fontSize: 13 },
  primaryButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  secondaryButtonText: { fontSize: 15, fontWeight: '600' },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, minHeight: 100, textAlignVertical: 'top' },
  dangerButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  dangerButtonText: { fontSize: 15, fontWeight: '700' },
});

export default BackupScreen;