/**
 * MAZRATI - Add/Edit Item Screen
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
import { useItems } from '../../contexts/ItemsContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { ITEM_STATUSES, ITEM_TYPES } from '../../services/itemService';

const AddEditItemScreen = () => {
  const { theme } = useTheme();
  const { createItem, updateItem, getItemById } = useItems();
  const { categories } = useCategories();
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.id;
  const preCategoryId = params.categoryId;
  const isEdit = !!editId;

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [categoryId, setCategoryId] = useState(preCategoryId || '');
  const [type, setType] = useState('custom');
  const [status, setStatus] = useState('active');
  const [customNumber, setCustomNumber] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [primaryImage, setPrimaryImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        const item = await getItemById(editId);
        if (item) {
          setName(item.name);
          setNameEn(item.nameEn || '');
          setCategoryId(item.categoryId);
          setType(item.type);
          setStatus(item.status);
          setCustomNumber(item.customNumber || '');
          setDescription(item.description || '');
          setImages(item.images || []);
          setPrimaryImage(item.primaryImage);
        }
        setLoading(false);
      };
      load();
    }
  }, [isEdit, editId, getItemById]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'اسم العنصر إجباري';
    if (!categoryId) newErrors.category = 'القسم إجباري';
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
      const uri = result.assets[0].uri;
      setImages((prev) => [...prev, uri]);
      if (!primaryImage) setPrimaryImage(uri);
    }
  };

  const removeImage = (uri) => {
    setImages((prev) => prev.filter((img) => img !== uri));
    if (primaryImage === uri) {
      setPrimaryImage(images.length > 1 ? images.find((img) => img !== uri) : null);
    }
  };

  const setAsPrimary = (uri) => {
    setPrimaryImage(uri);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        name,
        nameEn,
        categoryId,
        type,
        status,
        customNumber,
        description,
        images,
        primaryImage,
      };
      if (isEdit) {
        await updateItem(editId, data);
        Alert.alert('تم', 'تم تحديث العنصر بنجاح');
      } else {
        await createItem(data);
        Alert.alert('تم', 'تم إضافة العنصر بنجاح');
      }
      router.back();
    } catch (err) {
      Alert.alert('خطأ', 'تعذر حفظ العنصر');
      console.error('Save item error:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedType = ITEM_TYPES.find((t) => t.key === type);
  const selectedStatus = ITEM_STATUSES.find((s) => s.key === status);

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
            {isEdit ? 'تعديل عنصر' : 'إضافة عنصر'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={[styles.headerButtonText, { color: theme.colors.primary, fontWeight: '700' }]}>حفظ</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>اسم العنصر *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: errors.name ? '#D32F2F' : theme.colors.border, color: theme.colors.text }]}
            placeholder="أدخل اسم العنصر"
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
            placeholder="Item name in English"
            placeholderTextColor={theme.colors.secondaryText}
            value={nameEn}
            onChangeText={setNameEn}
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>القسم *</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: theme.colors.surface, borderColor: errors.category ? '#D32F2F' : theme.colors.border }]}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={[styles.pickerText, { color: selectedCategory ? theme.colors.text : theme.colors.secondaryText }]}>
              {selectedCategory ? selectedCategory.name : 'اختر قسمًا'}
            </Text>
            <Text style={{ color: theme.colors.secondaryText }}>▼</Text>
          </TouchableOpacity>
          {errors.category ? <Text style={styles.error}>{errors.category}</Text> : null}
          {showCategoryPicker ? (
            <View style={[styles.pickerList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.pickerItem, categoryId === cat.id && { backgroundColor: theme.colors.primary + '15' }]}
                  onPress={() => { setCategoryId(cat.id); setShowCategoryPicker(false); }}
                >
                  <Text style={[styles.pickerItemText, { color: theme.colors.text }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        {/* Type */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>نوع العنصر</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => setShowTypePicker(!showTypePicker)}
          >
            <Text style={[styles.pickerText, { color: theme.colors.text }]}>{selectedType?.label}</Text>
            <Text style={{ color: theme.colors.secondaryText }}>▼</Text>
          </TouchableOpacity>
          {showTypePicker ? (
            <View style={[styles.pickerList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {ITEM_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.pickerItem, type === t.key && { backgroundColor: theme.colors.primary + '15' }]}
                  onPress={() => { setType(t.key); setShowTypePicker(false); }}
                >
                  <Text style={[styles.pickerItemText, { color: theme.colors.text }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        {/* Status */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>الحالة</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => setShowStatusPicker(!showStatusPicker)}
          >
            <Text style={[styles.pickerText, { color: theme.colors.text }]}>{selectedStatus?.label}</Text>
            <Text style={{ color: theme.colors.secondaryText }}>▼</Text>
          </TouchableOpacity>
          {showStatusPicker ? (
            <View style={[styles.pickerList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {ITEM_STATUSES.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.pickerItem, status === s.key && { backgroundColor: theme.colors.primary + '15' }]}
                  onPress={() => { setStatus(s.key); setShowStatusPicker(false); }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }} />
                    <Text style={[styles.pickerItemText, { color: theme.colors.text }]}>{s.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        {/* Custom Number */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>الرقم الخاص (اختياري)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="أدخل رقم خاص (يمكن أن يتكرر)"
            placeholderTextColor={theme.colors.secondaryText}
            value={customNumber}
            onChangeText={setCustomNumber}
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

        {/* Images */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>الصور</Text>
          <TouchableOpacity
            style={[styles.imagePickerButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={pickImage}
          >
            <Text style={styles.imagePickerIcon}>📷</Text>
            <Text style={[styles.imagePickerText, { color: theme.colors.secondaryText }]}>إضافة صورة</Text>
          </TouchableOpacity>
          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.imageThumb}>
                  <Image source={{ uri }} style={styles.thumbImage} />
                  <TouchableOpacity style={styles.removeThumb} onPress={() => removeImage(uri)}>
                    <Text style={styles.removeThumbText}>✕</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryBadge, primaryImage === uri && styles.primaryBadgeActive]}
                    onPress={() => setAsPrimary(uri)}
                  >
                    <Text style={styles.primaryBadgeText}>{primaryImage === uri ? '★' : '☆'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
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
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 100, textAlignVertical: 'top' },
  error: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerText: { fontSize: 15 },
  pickerList: { borderWidth: 1, borderRadius: 12, marginTop: 4, overflow: 'hidden' },
  pickerItem: { paddingVertical: 12, paddingHorizontal: 14 },
  pickerItemText: { fontSize: 14 },
  imagePickerButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePickerIcon: { fontSize: 24 },
  imagePickerText: { fontSize: 14 },
  imageList: { marginTop: 12 },
  imageThumb: { marginRight: 10, position: 'relative' },
  thumbImage: { width: 90, height: 90, borderRadius: 10 },
  removeThumb: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeThumbText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadgeActive: { backgroundColor: '#F57C00' },
  primaryBadgeText: { color: '#FFFFFF', fontSize: 12 },
});

export default AddEditItemScreen;
