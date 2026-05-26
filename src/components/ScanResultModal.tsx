import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  background_color,
  primary_color,
  white_color,
} from '../constants/custome_colors';

type ScanResultAction = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

type ScanResultModalProps = {
  visible: boolean;
  success: boolean;
  title: string;
  message: string;
  actions?: ScanResultAction[];
};

const ScanResultModal = ({
  visible,
  success,
  title,
  message,
  actions = [],
}: ScanResultModalProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.statusPill,
                success ? styles.successPill : styles.errorPill,
              ]}>
              <Text style={styles.statusPillText}>
                {success ? 'SUCCESS' : 'ERROR'}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {actions.length > 0 && (
            <View style={styles.actionsRow}>
              {actions.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={[
                    styles.actionButton,
                    action.variant === 'secondary'
                      ? styles.secondaryButton
                      : styles.primaryButton,
                  ]}
                  activeOpacity={0.85}
                  onPress={action.onPress}>
                  <Text
                    style={[
                      styles.actionButtonText,
                      action.variant === 'secondary'
                        ? styles.secondaryButtonText
                        : styles.primaryButtonText,
                    ]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: background_color,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: primary_color,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  headerRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  statusPill: {
    minWidth: 104,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  successPill: {
    backgroundColor: primary_color,
  },
  errorPill: {
    backgroundColor: '#8B2E2E',
  },
  statusPillText: {
    color: white_color,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: white_color,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    color: '#E5E7EB',
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    minWidth: 116,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  primaryButton: {
    backgroundColor: primary_color,
    borderColor: primary_color,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: white_color,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: white_color,
  },
  secondaryButtonText: {
    color: white_color,
  },
});

export default ScanResultModal;
