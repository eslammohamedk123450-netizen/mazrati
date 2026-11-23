/**
 * MAZRATI - Add/Edit Event Screen
 * with Audio Recording (expo-av)
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { Audio } from 'expo-av';
import { useTheme } from '../../contexts/ThemeContext';
import { useEvents } from '../../contexts/EventsContext';
import { useItems } from '../../contexts/ItemsContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { EVENT_TYPES } from '../../services/eventService';

const AddEditEventScreen = () => {
  const { theme } = useTheme();
  const { createEvent, updateEvent, getEventById } = useEvents();
  const { items } = useItems();
  const { categories } = useCategories();
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.id;
  const preItemId = params.itemId;
  const isEdit = !!editId;

  const [title, setTitle] = useState('');
  const [itemId, setItemId] = useState(preItemId || '');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('note');
  const [customType, setCustomType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [audioUri, setAudioUri] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const recordingTimer = useRef(null);

  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        const evt = await getEventById(editId);
        if (evt) {
          setTitle(evt.title);
          setItemId(evt.itemId || '');
          setCategoryId(evt.categoryId || '');
          setType(evt.type);
          setCustomType(evt.customType || '');
          setDate(evt.date);
          setTime(evt.time);
          setDescription(evt.description || '');
          setImages(evt.images || []);
          setAudioUri(evt.audioUri);
        }
        setLoading(false);
      };
      load();
    }
  }, [isEdit, editId, getEventById]);

  // Auto-set categoryId when item changes
  useEffect(() => {
    if (itemId) {
      const item = items.find((i) => i.id === itemId);
      if (item) setCategoryId(item.categoryId);
    }
  }, [itemId, items]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'عنوان الحدث إجباري';
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
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris]);
    }
  };

  const removeImage = (uri) => {
    setImages((prev) => prev.filter((img) => img !== uri));
  };

  // Audio Recording
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('صلاحية', 'يرجى السماح بالوصول إلى الميكروفون');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      Alert.alert('خطأ', 'تعذر بدء التسجيل');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      clearInterval(recordingTimer.current);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      Alert.alert('خطأ', 'تعذر إيقاف التسجيل');
      console.error('Stop recording error:', err);
    }
  };

  const deleteRecording = () => {
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    setAudioUri(null);
    setIsPlaying(false);
  };

  const playRecording = async () => {
    if (!audioUri) return;
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      Alert.alert('خطأ', 'تعذر تشغيل التسجيل');
      console.error('Play error:', err);
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        title,
        itemId: itemId || null,
        categoryId: categoryId || null,
        type,
        customType: type === 'custom' ? customType : '',
        date,
        time,
        description,
        images,
        audioUri,
      };
      if (isEdit) {
        await updateEvent(editId, data);
        Alert.alert('تم', 'تم تحديث الحدث بنجاح');
      } else {
        await createEvent(data);
        Alert.alert('تم', 'تم تسجيل الحدث بنجاح');
      }
      router.back();
    } catch (err) {
      Alert.alert('خطأ', 'تعذر حفظ الحدث');
      console.error('Save event error:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedItem = items.find((i) => i.id === itemId);

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
            {isEdit ? 'تعديل حدث' : 'تسجيل حدث'}
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
          <Text style={[styles.label, { color: theme.colors.text }]}>عنوان الحدث *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: errors.title ? '#D32F2F' : theme.colors.border, color: theme.colors.text }]}
            placeholder="أدخل عنوان الحدث"
            placeholderTextColor={theme.colors.secondaryText}
            value={title}
            onChangeText={setTitle}
          />
          {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}
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
                <Text style={[styles.pickerItemText, { color: theme.colors.secondaryText }]}>— حدث عام (بدون عنصر) —</Text>
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

        {/* Type */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>نوع الحدث</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => setShowTypePicker(!showTypePicker)}
          >
            <Text style={[styles.pickerText, { color: theme.colors.text }]}>
              {EVENT_TYPES.find((t) => t.key === type)?.label}
            </Text>
            <Text style={{ color: theme.colors.secondaryText }}>▼</Text>
          </TouchableOpacity>
          {showTypePicker ? (
            <View style={[styles.pickerList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {EVENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.pickerItem, type === t.key && { backgroundColor: theme.colors.primary + '15' }]}
                  onPress={() => { setType(t.key); setShowTypePicker(false); }}
                >
                  <Text style={[styles.pickerItemText, { color: theme.colors.text }]}>{t.icon} {t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        {type === 'custom' ? (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.text }]}>اسم النوع المخصص</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="أدخل اسم النوع"
              placeholderTextColor={theme.colors.secondaryText}
              value={customType}
              onChangeText={setCustomType}
            />
          </View>
        ) : null}

        {/* Date */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>التاريخ</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.secondaryText}
            value={date}
            onChangeText={setDate}
          />
        </View>

        {/* Time */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>الوقت</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="HH:MM"
            placeholderTextColor={theme.colors.secondaryText}
            value={time}
            onChangeText={setTime}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>الوصف والتفاصيل</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="أدخل تفاصيل الحدث..."
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
            <Text style={[styles.imagePickerText, { color: theme.colors.secondaryText }]}>إضافة صور</Text>
          </TouchableOpacity>
          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.imageThumb}>
                  <Image source={{ uri }} style={styles.thumbImage} />
                  <TouchableOpacity style={styles.removeThumb} onPress={() => removeImage(uri)}>
                    <Text style={styles.removeThumbText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : null}
        </View>

        {/* Audio Recording */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>تسجيل صوتي</Text>
          {audioUri ? (
            <View style={[styles.audioPlayer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={isPlaying ? stopPlayback : playRecording}
              >
                <Text style={styles.playButtonText}>{isPlaying ? '⏹' : '▶️'}</Text>
              </TouchableOpacity>
              <Text style={[styles.audioLabel, { color: theme.colors.text }]}>تسجيل صوتي</Text>
              <TouchableOpacity onPress={deleteRecording}>
                <Text style={{ color: '#D32F2F', fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.recordingArea}>
              {isRecording ? (
                <View style={styles.recordingActive}>
                  <Text style={styles.recordingDot}>🔴</Text>
                  <Text style={[styles.recordingTime, { color: theme.colors.text }]}>
                    {formatDuration(recordingDuration)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.stopButton, { backgroundColor: '#D32F2F' }]}
                    onPress={stopRecording}
                  >
                    <Text style={styles.stopButtonText}>⏹ إيقاف</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.recordButton, { backgroundColor: theme.colors.primary }]}
                  onPress={startRecording}
                >
                  <Text style={styles.recordButtonText}>🎙️ بدء التسجيل</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 100, textAlignVertical: 'top' },
  error: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  pickerText: { fontSize: 15 },
  pickerList: { borderWidth: 1, borderRadius: 12, marginTop: 4, overflow: 'hidden', maxHeight: 200 },
  pickerItem: { paddingVertical: 12, paddingHorizontal: 14 },
  pickerItemText: { fontSize: 14 },
  imagePickerButton: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePickerIcon: { fontSize: 24 },
  imagePickerText: { fontSize: 14 },
  imageList: { marginTop: 12 },
  imageThumb: { marginRight: 10, position: 'relative' },
  thumbImage: { width: 80, height: 80, borderRadius: 10 },
  removeThumb: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  removeThumbText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  recordingArea: { alignItems: 'center', paddingVertical: 16 },
  recordingActive: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recordingDot: { fontSize: 16 },
  recordingTime: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  recordButton: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  recordButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  stopButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  stopButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  audioPlayer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 12 },
  playButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(46,125,70,0.1)', alignItems: 'center', justifyContent: 'center' },
  playButtonText: { fontSize: 18 },
  audioLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
});

export default AddEditEventScreen;
