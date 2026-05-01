import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { extractPairingCode } from '../utils/pairing';

type DesktopQrScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onScanned: (code: string) => Promise<void> | void;
};

export const DesktopQrScannerModal = ({
  visible,
  onClose,
  onScanned,
}: DesktopQrScannerModalProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [submitting, setSubmitting] = React.useState(false);
  const [hasScanned, setHasScanned] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      setHasScanned(false);
      setSubmitting(false);
    }
  }, [visible]);

  const handleBarcode = async (rawValue: string) => {
    if (hasScanned || submitting) {
      return;
    }

    const code = extractPairingCode(rawValue);

    if (!code) {
      setHasScanned(true);
      Alert.alert('Invalid QR code', 'This QR code does not contain a desktop sync code.');
      setTimeout(() => setHasScanned(false), 1200);
      return;
    }

    setHasScanned(true);
    setSubmitting(true);

    try {
      await onScanned(code);
      onClose();
    } finally {
      setSubmitting(false);
      setHasScanned(false);
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Scan desktop QR</Text>
            <Pressable hitSlop={12} onPress={onClose}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>

          {!permission ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={colors.softTeal} />
            </View>
          ) : permission.granted ? (
            <View style={styles.cameraShell}>
              <CameraView
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={({ data }) => {
                  void handleBarcode(data);
                }}
                style={styles.camera}
              />
              <View pointerEvents="none" style={styles.scanFrame} />
              <Text style={styles.helper}>
                Point the camera at the QR code shown on `co2-score.online/sync`.
              </Text>
            </View>
          ) : (
            <View style={styles.stateBox}>
              <Text style={styles.helper}>
                Camera access is needed once so the app can scan the desktop pairing QR code.
              </Text>
              <Pressable onPress={() => void requestPermission()} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Allow camera</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(78,97,86,0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.softWhite,
    borderRadius: 20,
    gap: spacing.md,
    maxWidth: 420,
    padding: spacing.lg,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.forestInk,
    fontFamily: typography.title,
    fontSize: 20,
  },
  close: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  stateBox: {
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 220,
    justifyContent: 'center',
  },
  cameraShell: {
    gap: spacing.sm,
  },
  camera: {
    borderRadius: 18,
    height: 320,
    overflow: 'hidden',
    width: '100%',
  },
  scanFrame: {
    alignSelf: 'center',
    borderColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    borderWidth: 2,
    height: 190,
    marginTop: -255,
    width: 190,
  },
  helper: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.softTeal,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryButtonText: {
    color: colors.softWhite,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
});
