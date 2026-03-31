import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { Transaction, TransactionType } from '../../types';
import { colors, spacing, borderRadius } from '../../theme';

export default function OperationsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOperations = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Transaction[]>('/seller/transactions/today');
      setTransactions(data);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  const totalAccruals = transactions
    .filter((t) => t.type === TransactionType.ACCRUAL)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = transactions
    .filter((t) => t.type === TransactionType.DEBIT)
    .reduce((sum, t) => sum + t.amount, 0);

  const renderItem = ({ item }: { item: Transaction }) => {
    const isAccrual = item.type === TransactionType.ACCRUAL;
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.left}>
            <Chip
              compact
              textStyle={{ fontSize: 11, color: '#FFF' }}
              style={[
                styles.chip,
                { backgroundColor: isAccrual ? colors.success : colors.accent },
              ]}
            >
              {isAccrual ? 'Начисление' : 'Списание'}
            </Chip>
            {item.description && (
              <Text style={styles.description} numberOfLines={1}>
                {item.description}
              </Text>
            )}
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Text
            style={[
              styles.amount,
              { color: isAccrual ? colors.success : colors.accent },
            ]}
          >
            {isAccrual ? '+' : '-'}{item.amount.toLocaleString()} ₸
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="arrow-up-circle" size={24} color={colors.success} />
          <Text style={styles.summaryLabel}>Начислено</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            +{totalAccruals.toLocaleString()} ₸
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="arrow-down-circle" size={24} color={colors.accent} />
          <Text style={styles.summaryLabel}>Списано</Text>
          <Text style={[styles.summaryValue, { color: colors.accent }]}>
            -{totalDebits.toLocaleString()} ₸
          </Text>
        </View>
      </View>

      <Text style={styles.listTitle}>
        Операции за сегодня ({transactions.length})
      </Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadOperations} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clipboard-text-off" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Операций за сегодня нет</Text>
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
    flexDirection: 'row',
    backgroundColor: colors.bg,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgLight,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: colors.bgLight,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: spacing.md,
    paddingBottom: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
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
  time: {
    fontSize: 12,
    color: colors.textMuted,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
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
