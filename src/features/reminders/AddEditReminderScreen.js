/**
 * MAZRATI - Add/Edit Reminder Screen
 * إضافة وتعديل التذكيرات
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useItems } from '../../contexts/ItemsContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { useReminders } from '../../contexts/RemindersContext';
import { REMINDER_REPEATS } from '../../services/reminderService';

const AddEditReminderScreen = () => {
  const { theme } = useTheme();
  const { createReminder, updateReminder, getReminderById } = useReminders();
  const { items } = useItems();
  const { categories } = useCategories();
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.id;
  const preItemId = params.itemId;
  const isEdit = !!editId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [repeat, setRepeat] = useState('none');
  const [itemId, setItemId] = useState(preItemId || '');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        const r = await getReminderById(editId);
        if (r) {
          setTitle(r.title);
          setDescription(r.description || '');
          setDate(r.date);
          setTime(r.time);
          setRepeat(r.repeat || 'none');
          setItemId(r.itemId || '');
          setCategoryId(r.categoryId || '');
        }
        setLoading(false);
      };
      load();
    }
  }, [isEdit, editId, getReminderById]);

  // تحديث categoryId عند اختيار item
  useEffect(() => {
    if (itemId) {
      const item = items.find((i) => i.id === itemId);
      if (item) setCategoryId(item.categoryId);
    }
  }, [itemId, items]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'عنوان التذكير إجباري';
    if (!date) newErrors.date = 'التاريخ إجباري';
    if (!time) newErrors.time = 'الوقت إجباري';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        title,
        description,
        date,
        time,
        repeat,
        itemId: itemId || null,
        categoryId: categoryId || null,
      };
      if (isEdit) {
        await updateReminder(editId, data);
        Alert.alert('تم', 'تم تحديث التذكير بنجاح');
      } else {
        await createReminder(data);
        Alert.alert('تم', 'تم إضافة التذكير بنجاح');
      }
      router.back();
    } catch (err) {
      Alert.alert('خطأ', 'تعذر حفظ التذكير');
      console.error('Save reminder error:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedItem = items.find((i) => i.id === itemId);
  const selectedRepeat = REMINDER_REPEATS.find((r) => r.key === repeat);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>إلغاء</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {isEdit ? 'تعديل تذكير' : 'إضافة تذكير'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={[styles.headerButtonText, { color: theme.colors.primary, fontWeight: '700' }]}>حفظ</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>عنوان التذكير *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: errors.title ? '#D32F2F' : theme.colors.border, color: theme.colors.text }]}
            placeholder="مثال: تطعيم الماشية"
            placeholderTextColor={theme.colors.secondaryText}
            value={title}
            onChangeText={setTitle}
          />
          {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>الوصف (اختياري)</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="تفاصيل إضافية..."
            placeholderTextColor={theme.colors.secondaryText}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Date & Time */}
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <Text style={[styles.label, { color: theme.colors.text }]}>التاريخ *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: errors.date ? '#D32F2F' : theme.colors.border, color: theme.colors.text }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.secondaryText}
              value={date}
              onChangeText={setDate}
            />
            {errors.date ? <Text style={styles.error}>{errors.date}</Text> : null}
          </View>
          <View style={styles.fieldHalf}>
            <Text style={[styles.label, { color: theme.colors.text }]}>الوقت *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: errors.time ? '#D32F2F' : theme.colors.border, color: theme.colors.text }]}
              placeholder="HH:MM"
              placeholderTextColor={theme.colors.secondaryText}
              value={time}
              onChangeText={setTime}
            />
            {errors.time ? <Text style={styles.error}>{errors.time}</Text> : null}
          </View>
        </View>

        {/* Repeat */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>التكرار</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => setShowRepeatPicker(!showRepeatPicker)}
          >
            <Text style={[styles.pickerText, { color: theme.colors.text }]}>{selectedRepeat?.label}</Text>
            <Text style={{ color: theme.colors.secondaryText }}>▼</Text>
          </TouchableOpacity>
          {showRepeatPicker ? (
            <View style={[styles.pickerList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {REMINDER_REPEATS.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.pickerItem, repeat === r.key && { backgroundColor: theme.colors.primary + '15' }]}
                  onPress={() => { setRepeat(r.key); setShowRepeatPicker(false); }}
                >
                  <Text style={[styles.pickerItemText, { color: theme.colors.text }]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        {/* Item (optional) */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>العنصر المرتبط (اختياري)</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => setShowItemPicker(!showItemPicker)}
          >
            <Text style={[styles.pickerText, { color: selectedItem ? theme.colors.text : theme.colors.secondaryText }]}>
              {selectedItem ? selectedItem.name : 'اختر عنصرًا (أو اتركه عامًا)'}
            </Text>
            <Text style={{ color: theme.colors.secondaryText }}>▼</Text>
          </TouchableOpacity>
          {showItemPicker ? (
            <View style={[styles.pickerList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[styles.pickerItem]}
                onPress={() => { setItemId(''); setShowItemPicker(false); }}
              >
                <Text style={[styles.pickerItemText, { color: theme.colors.secondaryText }]}>— تذكير عام (بدون عنصر) —</Text>
              </TouchableOpacity>
              {items.map((it) => (
                <TouchableOpacity
                  key={it.id}
                  style={[styles.pickerItem, itemId === it.id && { backgroundColor: theme.colors.primary + '15' }]}
                  onPress={() => { setItemId(it.id); setShowItemPicker(false); }}
                >
                  <Text style={[styles.pickerItemText, { color: theme.colors.text }]}>{it.name} ({it.internalNumber})</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerButton: { padding: 8 },
  headerButtonText: { fontSize: 15, fontWeight: '600' },
  field: { marginBottom: 20 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  fieldHalf: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  error: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  pickerText: { fontSize: 15 },
  pickerList: { borderWidth: 1, borderRadius: 12, marginTop: 4, overflow: 'hidden', maxHeight: 200 },
  pickerItem: { paddingVertical: 12, paddingHorizontal: 14 },
  pickerItemText: { fontSize: 14 },
});

export default AddEditReminderScreen;