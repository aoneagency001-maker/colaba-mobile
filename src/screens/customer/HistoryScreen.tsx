import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, SegmentedButtons } from 'react-native-paper';
import { useWalletStore } from '../../store/wallet';
import { Transaction, TransactionType } from '../../types';
import { colors, spacing, borderRadius } from '../../theme';

type FilterType = 'all' | 'accrual' | 'debit' | 'burn';

export default function HistoryScreen() {
  const { transactions, isLoading, loadHistory } = useWalletStore();
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((tx) => tx.type === filter);

  const formatAmount = (tx: Transaction) => {
    const isPositive = tx.type === TransactionType.ACCRUAL || tx.type === TransactionType.REFERRAL;
    const sign = isPositive ? '+' : '-';
    const color = isPositive ? colors.success : colors.accent;
    return { text: `${sign}${tx.amount.toLocaleString()} ₸`, color };
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const { text, color } = formatAmount(item);
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.left}>
            <Chip
              compact
              textStyle={{ fontSize: 11, color: colors.bg }}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    item.type === TransactionType.ACCRUAL
                      ? colors.success
                      : item.type === TransactionType.BURN
                      ? '#FF8800'
                      : colors.accent,
                },
              ]}
            >
              {item.type === TransactionType.ACCRUAL
                ? 'Начисление'
                : item.type === TransactionType.DEBIT
                ? 'Списание'
                : item.type === TransactionType.BURN
                ? 'Сгорание'
                : 'Реферал'}
            </Chip>
            {item.description && (
              <Text style={styles.description} numberOfLines={1}>
                {item.description}
              </Text>
            )}
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Text style={[styles.amount, { color }]}>{text}</Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(v) => setFilter(v as FilterType)}
          buttons={[
            { value: 'all', label: 'Все' },
            { value: 'accrual', label: 'Начисления' },
            { value: 'debit', label: 'Списания' },
            { value: 'burn', label: 'Сгорания' },
          ]}
          density="small"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadHistory} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Операций не найдено</Text>
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
  filterContainer: {
    padding: spacing.md,
    backgroundColor: colors.bg,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.bg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    marginRight: spacing.md,
  },
  chip: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
