import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWalletStore } from '../../store/wallet';
import { BonusLot } from '../../types';
import { colors, spacing, borderRadius } from '../../theme';

export default function ExpiringScreen() {
  const { expiringLots, isLoading, loadExpiring } = useWalletStore();

  useEffect(() => {
    loadExpiring();
  }, []);

  const getDaysLeft = (expiresAt: string) => {
    const now = new Date();
    const exp = new Date(expiresAt);
    const diff = exp.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 7) return colors.accent;
    if (daysLeft <= 30) return '#FF8800';
    return colors.success;
  };

  const renderLot = ({ item }: { item: BonusLot }) => {
    const daysLeft = getDaysLeft(item.expiresAt);
    const urgencyColor = getUrgencyColor(daysLeft);
    const usedPercent = item.amount > 0 ? item.remaining / item.amount : 0;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={[styles.amount, { color: urgencyColor }]}>
                {item.remaining.toLocaleString()} ₸
              </Text>
              <Text style={styles.original}>
                из {item.amount.toLocaleString()} ₸
              </Text>
            </View>
            <View style={styles.right}>
              <View style={[styles.daysBox, { backgroundColor: urgencyColor + '20' }]}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={urgencyColor} />
                <Text style={[styles.daysText, { color: urgencyColor }]}>
                  {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}
                </Text>
              </View>
            </View>
          </View>

          <ProgressBar
            progress={usedPercent}
            color={urgencyColor}
            style={styles.progressBar}
          />

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Начислено</Text>
            <Text style={styles.dateValue}>
              {new Date(item.createdAt).toLocaleDateString('ru-RU')}
            </Text>
            <Text style={styles.dateLabel}>Истекает</Text>
            <Text style={styles.dateValue}>
              {new Date(item.expiresAt).toLocaleDateString('ru-RU')}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const totalExpiring = expiringLots.reduce((sum, lot) => sum + lot.remaining, 0);

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Всего сгорает</Text>
        <Text style={styles.summaryAmount}>{totalExpiring.toLocaleString()} ₸</Text>
        <Text style={styles.summaryCount}>{expiringLots.length} лотов</Text>
      </View>

      <FlatList
        data={expiringLots}
        keyExtractor={(item) => item.id}
        renderItem={renderLot}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadExpiring} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="check-circle" size={48} color={colors.success} />
            <Text style={styles.emptyText}>Нет сгорающих бонусов</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  summary: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  summaryCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  list: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.bg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: {},
  right: {},
  amount: {
    fontSize: 22,
    fontWeight: '700',
  },
  original: {
    fontSize: 12,
    color: colors.textMuted,
  },
  daysBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  daysText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBar: {
    marginVertical: spacing.sm,
    height: 4,
    borderRadius: 2,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  dateValue: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  empty: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
  },
});
