/**
 * MAZRATI - Add/Edit Category Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useCategories } from '../../contexts/CategoriesContext';

const COLOR_OPTIONS = [
  { color: '#2E7D46', label: 'أخضر' },
  { color: '#6EBD7D', label: 'أخضر فاتح' },
  { color: '#174B2A', label: 'أخضر داكن' },
  { color: '#4A9E6B', label: 'أخضر زيتوني' },
  { color: '#F57C00', label: 'برتقالي' },
  { color: '#D32F2F', label: 'أحمر' },
  { color: '#1976D2', label: 'أزرق' },
  { color: '#7B1FA2', label: 'بنفسجي' },
];

const ICON_OPTIONS = [
  { icon: '📁', value: 'folder' },
  { icon: '🐾', value: 'paw' },
  { icon: '🌿', value: 'leaf' },
  { icon: '🔧', value: 'tools' },
  { icon: '📦', value: 'package' },
  { icon: '🐄', value: 'cow' },
  { icon: '🌱', value: 'plant' },
  { icon: '🚜', value: 'tractor' },
];

const AddEditCategoryScreen = () => {
  const { theme } = useTheme();
  const { createCategory, updateCategory, getCategoryById } = useCategories();
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.id;
  const isEdit = !!editId;

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [color, setColor] = useState('#2E7D46');
  const [icon, setIcon] = useState('folder');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        const cat = await getCategoryById(editId);
        if (cat) {
          setName(cat.name);
          setNameEn(cat.nameEn || '');
          setDescription(cat.description || '');
          setImage(cat.image);
          setColor(cat.color || '#2E7D46');
          setIcon(cat.icon || 'folder');
        }
        setLoading(false);
      };
      load();
    }
  }, [isEdit, editId, getCategoryById]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'اسم القسم إجباري';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('صلاحية', 'يرجى السماح بالوصول إلى المعرض');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const data = {
        name,
        nameEn,
        description,
        image,
        color,
        icon,
      };
      if (isEdit) {
        await updateCategory(editId, data);
        Alert.alert('تم', 'تم تحديث القسم بنجاح');
      } else {
        await createCategory(data);
        Alert.alert('تم', 'تم إضافة القسم بنجاح');
      }
      router.back();
    } catch (err) {
      Alert.alert('خطأ', 'تعذر حفظ القسم. يرجى المحاولة مرة أخرى.');
      console.error('Save category error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>إلغاء</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {isEdit ? 'تعديل قسم' : 'إضافة قسم'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerButton}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={[styles.headerButtonText, { color: theme.colors.primary, fontWeight: '700' }]}>
                حفظ
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>اسم القسم *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: errors.name ? '#D32F2F' : theme.colors.border, color: theme.colors.text },
            ]}
            placeholder="أدخل اسم القسم"
            placeholderTextColor={theme.colors.secondaryText}
            value={name}
            onChangeText={setName}
          />
          {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}
        </View>

        {/* English Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>الاسم بالإنجليزية (اختياري)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="Category name in English"
            placeholderTextColor={theme.colors.secondaryText}
            value={nameEn}
            onChangeText={setNameEn}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>الوصف (اختياري)</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="أدخل وصفًا مختصرًا"
            placeholderTextColor={theme.colors.secondaryText}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Color */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>اللون</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: opt.color },
                  color === opt.color && styles.colorSelected,
                ]}
                onPress={() => setColor(opt.color)}
              />
            ))}
          </View>
        </View>

        {/* Icon */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>الرمز</Text>
          <View style={styles.iconRow}>
            {ICON_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.iconCircle,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  icon === opt.value && { borderColor: theme.colors.primary, borderWidth: 2 },
                ]}
                onPress={() => setIcon(opt.value)}
              >
                <Text style={styles.iconText}>{opt.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Image */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>صورة القسم (اختياري)</Text>
          {image ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImage} onPress={removeImage}>
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.imagePicker, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={pickImage}
            >
              <Text style={styles.imagePickerIcon}>📷</Text>
              <Text style={[styles.imagePickerText, { color: theme.colors.secondaryText }]}>
                اختر صورة من المعرض
              </Text>
            </TouchableOpacity>
          )}
          {image ? (
            <TouchableOpacity style={styles.changeImage} onPress={pickImage}>
              <Text style={[styles.changeImageText, { color: theme.colors.primary }]}>تغيير الصورة</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerButton: { padding: 8 },
  headerButtonText: { fontSize: 15, fontWeight: '600' },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  imagePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  imagePickerIcon: { fontSize: 32 },
  imagePickerText: { fontSize: 14 },
  imagePreview: { position: 'relative' },
  previewImage: { width: '100%', height: 200, borderRadius: 12 },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  changeImage: { marginTop: 8, alignSelf: 'flex-start' },
  changeImageText: { fontSize: 14, fontWeight: '600' },
});

export default AddEditCategoryScreen;
