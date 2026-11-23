/**
 * MAZRATI - AppModal
 * نافذة منبثقة (Modal) بسيطة مع تراكب خلفية
 */

import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AppModal = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
            style,
          ]}
        >
          {title || showCloseButton ? (
            <View style={styles.header}>
              {title ? (
                <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
              ) : null}
              {showCloseButton ? (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={[styles.closeIcon, { color: theme.colors.secondaryText }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
          <View style={styles.body}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
  },
  body: {
    padding: 20,
  },
});

export default AppModal;
