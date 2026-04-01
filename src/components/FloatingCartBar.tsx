import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../theme';

function formatTenge(amount: number): string {
  return amount.toLocaleString('ru-RU');
}

interface FloatingCartBarProps {
  itemCount: number;
  totalAmount: number;
  cashbackAmount: number;
  onPress: () => void;
}

export default function FloatingCartBar({
  itemCount,
  totalAmount,
  cashbackAmount,
  onPress,
}: FloatingCartBarProps) {
  if (itemCount === 0) return null;

  return (
    <TouchableOpacity style={styles.bar} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.count}>{itemCount} поз.</Text>
      <Text style={styles.total}>{formatTenge(totalAmount)} тг</Text>
      <Text style={styles.cashback}>+{formatTenge(cashbackAmount)} тг</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 65,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cashback: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
});
