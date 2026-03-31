import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, Card, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../../services/api';
import { Customer, Wallet } from '../../types';
import { colors, spacing, borderRadius } from '../../theme';

type OperationType = 'accrual' | 'debit';

interface ScannedCustomer {
  customer: Customer;
  wallet: Wallet;
}

export default function ScannerScreen() {
  const [scanning, setScanning] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedCustomer | null>(null);
  const [amount, setAmount] = useState('');
  const [opType, setOpType] = useState<OperationType>('accrual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualId, setManualId] = useState('');
  const [permission, requestPermission] = useCameraPermissions();

  const handleScan = async (customerId: string) => {
    try {
      setScanning(false);
      const { data } = await api.get<ScannedCustomer>(`/seller/customer/${customerId}`);
      setScannedData(data);
    } catch {
      const msg = 'Клиент не найден';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Ошибка', msg);
      }
    }
  };

  const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
    if (isProcessing) return;
    try {
      const parsed = JSON.parse(data);
      if (parsed.customerId) {
        handleScan(parsed.customerId);
      } else {
        handleScan(data);
      }
    } catch {
      handleScan(data);
    }
  }, [isProcessing]);

  const handleConfirm = async () => {
    if (!scannedData || !amount) return;
    try {
      setIsProcessing(true);
      await api.post('/seller/transaction', {
        customerId: scannedData.customer.id,
        walletId: scannedData.wallet.id,
        type: opType,
        amount: parseFloat(amount),
      });

      const msg = opType === 'accrual'
        ? `Начислено ${amount} ₸`
        : `Списано ${amount} ₸`;

      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Успех', msg);
      }

      setScannedData(null);
      setAmount('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ошибка операции';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Ошибка', msg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setScannedData(null);
    setAmount('');
    setManualId('');
  };

  // If customer is scanned, show transaction form
  if (scannedData) {
    const { customer, wallet } = scannedData;
    return (
      <View style={styles.container}>
        <Card style={styles.customerCard}>
          <Card.Content style={styles.customerContent}>
            <MaterialCommunityIcons name="account-check" size={48} color={colors.success} />
            <Text style={styles.customerName}>
              {customer.user?.firstName} {customer.user?.lastName}
            </Text>
            <Text style={styles.customerBalance}>
              Баланс: {wallet.balance.toLocaleString()} ₸
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.form}>
          <SegmentedButtons
            value={opType}
            onValueChange={(v) => setOpType(v as OperationType)}
            buttons={[
              { value: 'accrual', label: 'Начисление', icon: 'plus' },
              { value: 'debit', label: 'Списание', icon: 'minus' },
            ]}
          />

          <TextInput
            label="Сумма (₸)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            outlineColor={colors.textMuted}
            activeOutlineColor={opType === 'accrual' ? colors.success : colors.accent}
          />

          {opType === 'debit' && parseFloat(amount) > wallet.balance && (
            <Text style={styles.warning}>Сумма превышает баланс клиента</Text>
          )}

          <Button
            mode="contained"
            onPress={handleConfirm}
            loading={isProcessing}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            style={styles.confirmButton}
            buttonColor={opType === 'accrual' ? colors.success : colors.accent}
            textColor="#FFFFFF"
          >
            {opType === 'accrual' ? 'Начислить' : 'Списать'} {amount ? `${amount} ₸` : ''}
          </Button>

          <Button mode="text" onPress={handleReset} textColor={colors.textSecondary}>
            Отмена
          </Button>
        </View>
      </View>
    );
  }

  // Scanner view
  return (
    <View style={styles.container}>
      <View style={styles.scannerArea}>
        {scanning ? (
          permission?.granted ? (
            <View style={styles.cameraContainer}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={handleBarCodeScanned}
              />
              <View style={styles.cameraOverlay}>
                <View style={styles.scanFrame} />
              </View>
              <Button
                mode="contained"
                onPress={() => setScanning(false)}
                buttonColor={colors.accent}
                textColor="#FFFFFF"
                style={{ marginTop: spacing.md }}
              >
                Отмена
              </Button>
            </View>
          ) : (
            <View style={styles.permissionContainer}>
              <MaterialCommunityIcons name="camera-off" size={64} color={colors.textMuted} />
              <Text style={styles.permissionText}>
                Для сканирования QR-кода необходим доступ к камере
              </Text>
              <Button
                mode="contained"
                onPress={requestPermission}
                buttonColor={colors.primary}
                style={{ marginTop: spacing.md }}
              >
                Разрешить камеру
              </Button>
              <Button
                mode="text"
                onPress={() => setScanning(false)}
                textColor={colors.textSecondary}
                style={{ marginTop: spacing.sm }}
              >
                Отмена
              </Button>
            </View>
          )
        ) : (
          <View style={styles.scanPrompt}>
            <MaterialCommunityIcons name="qrcode-scan" size={80} color={colors.primary} />
            <Text style={styles.scanTitle}>Сканер QR</Text>
            <Text style={styles.scanHint}>
              Нажмите кнопку для сканирования QR-кода клиента
            </Text>
            <Button
              mode="contained"
              onPress={() => setScanning(true)}
              style={styles.scanButton}
              buttonColor={colors.primary}
              icon="camera"
            >
              Сканировать
            </Button>
            <Button
              mode="text"
              onPress={() => setShowManual(!showManual)}
              textColor={colors.textSecondary}
              style={{ marginTop: spacing.sm }}
            >
              {showManual ? 'Скрыть ручной ввод' : 'Ввести ID вручную'}
            </Button>
          </View>
        )}
      </View>

      {/* Manual ID input fallback */}
      {showManual && !scanning && (
        <Card style={styles.manualCard}>
          <Card.Content>
            <Text style={styles.manualTitle}>Введите ID клиента</Text>
            <View style={styles.manualRow}>
              <TextInput
                value={manualId}
                onChangeText={setManualId}
                placeholder="ID клиента"
                mode="outlined"
                style={styles.manualInput}
                dense
                outlineColor={colors.textMuted}
                activeOutlineColor={colors.primary}
              />
              <Button
                mode="contained"
                onPress={() => handleScan(manualId)}
                disabled={!manualId}
                buttonColor={colors.primary}
                compact
              >
                Найти
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
    padding: spacing.md,
  },
  scannerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    width: '100%',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: borderRadius.md,
  },
  permissionContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  permissionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  scanPrompt: {
    alignItems: 'center',
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  scanHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  scanButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
  },
  manualCard: {
    backgroundColor: colors.bg,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  manualTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  manualRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  manualInput: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  customerCard: {
    backgroundColor: colors.bg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  customerContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  customerName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  customerBalance: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '600',
    marginTop: 4,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.bg,
  },
  warning: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  confirmButton: {
    borderRadius: borderRadius.sm,
    paddingVertical: 4,
  },
});
