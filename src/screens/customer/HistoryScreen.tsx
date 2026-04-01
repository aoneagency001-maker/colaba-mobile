import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, SectionList, RefreshControl } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWalletStore } from '../../store/wallet';
import { Transaction, TransactionType } from '../../types';
import { colors, spacing, borderRadius } from '../../theme';

type FilterType = 'all' | 'accrual' | 'debit' | 'burn';

interface Section {
  title: string;
  data: Transaction[];
}

/** Classify a date string into a human-readable group label. */
function dateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay() + (startOfToday.getDay() === 0 ? -6 : 1));

  if (date >= startOfToday) return 'Сегодня';
  if (date >= startOfYesterday) return 'Вчера';
  if (date >= startOfWeek) return 'На этой неделе';
  return 'Ранее';
}

/** Group a flat list of transactions into labelled sections. */
function groupByDate(txs: Transaction[]): Section[] {
  const order = ['Сегодня', 'Вчера', 'На этой неделе', 'Ранее'];
  const map = new Map<string, Transaction[]>();

  for (const tx of txs) {
    const label = dateGroup(tx.createdAt);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(tx);
  }

  return order.filter((label) => map.has(label)).map((label) => ({ title: label, data: map.get(label)! }));
}

export default function HistoryScreen() {
  const { transactions, isLoading, loadHistory } = useWalletStore();
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? transactions : transactions.filter((tx) => tx.type === filter)),
    [transactions, filter],
  );

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  const formatAmount = (tx: Transaction) => {
    const isPositive = tx.type === TransactionType.ACCRUAL || tx.type === TransactionType.REFERRAL;
    const sign = isPositive ? '+' : '-';
    const color = isPositive ? colors.success : tx.type === TransactionType.BURN ? '#FF8800' : colors.accent;
    return { text: `${sign}${tx.amount.toLocaleString('ru-RU')} тг`, color };
  };

  const txIcon = (type: TransactionType): { name: 'arrow-down' | 'arrow-up' | 'clock-outline'; bg: string } => {
    if (type === TransactionType.ACCRUAL || type === TransactionType.REFERRAL) {
      return { name: 'arrow-down', bg: colors.success };
    }
    if (type === TransactionType.BURN) {
      return { name: 'clock-outline', bg: '#FF8800' };
    }
    return { name: 'arrow-up', bg: colors.accent };
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  const renderItem = ({ item }: { item: Transaction }) => {
    const { text, color } = formatAmount(item);
    const icon = txIcon(item.type);

    return (
      <View style={styles.txRow}>
        <View style={[styles.txIconCircle, { backgroundColor: icon.bg + '20' }]}>
          <MaterialCommunityIcons name={icon.name} size={18} color={icon.bg} />
        </View>
        <View style={styles.txMiddle}>
          <Text style={styles.txDescription} numberOfLines={1}>
            {item.description ||
              (item.type === TransactionType.ACCRUAL
                ? 'Начисление'
                : item.type === TransactionType.DEBIT
                ? 'Списание'
                : item.type === TransactionType.BURN
                ? 'Сгорание'
                : 'Реферал')}
          </Text>
          <Text style={styles.txDate}>
            {new Date(item.createdAt).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text style={[styles.txAmount, { color }]}>{text}</Text>
      </View>
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

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadHistory} />}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
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

  /* Section headers */
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },

  /* Transaction rows */
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  txIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  txMiddle: {
    flex: 1,
    marginRight: spacing.md,
  },
  txDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  txDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },

  /* Empty state */
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
