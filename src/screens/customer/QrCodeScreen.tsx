import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '../../store/auth';
import { colors, spacing, borderRadius } from '../../theme';

export default function QrCodeScreen({ navigation }: any) {
  const { customer, user } = useAuthStore();
  const customerId = customer?.id || 'unknown';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Ваш QR-код</Text>
        <Text style={styles.subtitle}>
          Покажите продавцу для начисления или списания бонусов
        </Text>

        <View style={styles.qrPlaceholder}>
          <QRCode
            value={JSON.stringify({ customerId: customer?.id, odId: user?.id })}
            size={200}
            backgroundColor="white"
            color="#1a1a2e"
          />
        </View>

        <Text style={styles.shareHint}>
          Покажите этот код на кассе для сканирования
        </Text>

        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.phone}>{user?.phone}</Text>

        {customer?.referralCode && (
          <View style={styles.referralSection}>
            <Text style={styles.referralLabel}>Реферальный код</Text>
            <Text style={styles.referralCode}>{customer.referralCode}</Text>
          </View>
        )}
      </View>

      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        textColor={colors.primary}
      >
        Назад
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.bg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  qrPlaceholder: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  shareHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  phone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  referralSection: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bgLight,
    width: '100%',
  },
  referralLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  referralCode: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 3,
    marginTop: 4,
  },
  backButton: {
    marginTop: spacing.lg,
    borderColor: colors.primary,
  },
});
