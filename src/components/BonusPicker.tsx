import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../theme';

function formatTenge(amount: number): string {
  return amount.toLocaleString('ru-RU');
}

const BONUS_PRESETS = [0, 1000, 5000, 10000];

interface BonusPickerProps {
  maxBonus: number;
  value: number;
  onChange: (value: number) => void;
}

export default function BonusPicker({ maxBonus, value, onChange }: BonusPickerProps) {
  // Build options: predefined amounts that fit within maxBonus, plus "all"
  const presets = BONUS_PRESETS.filter((v) => v <= maxBonus && v !== maxBonus);
  const options = [...presets, maxBonus];
  // Deduplicate (in case maxBonus matches a preset)
  const unique = [...new Set(options)];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Списать бонусы</Text>
      <View style={styles.pickerRow}>
        {unique.map((opt) => {
          const isActive = value === opt;
          const label = opt === maxBonus && opt !== 0 ? 'Всё' : `${formatTenge(opt)} тг`;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.pickerOption, isActive && styles.pickerOptionActive]}
              onPress={() => onChange(opt)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.pickerText, isActive && styles.pickerTextActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.summary}>
        Списать: {formatTenge(value)} тг из {formatTenge(maxBonus)} тг
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pickerOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    backgroundColor: colors.bg,
  },
  pickerOptionActive: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  pickerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pickerTextActive: {
    color: '#FFFFFF',
  },
  summary: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
