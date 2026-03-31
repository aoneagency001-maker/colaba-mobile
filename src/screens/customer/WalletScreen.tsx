import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWalletStore } from '../../store/wallet';
import { TransactionType } from '../../types';
import { colors, spacing, borderRadius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function WalletScreen({ navigation }: Props) {
  const { activeWallet, transactions, expiringLots, isLoading, loadWallets, loadHistory, loadExpiring } =
    useWalletStore();

  useEffect(() => {
    loadWallets().then(() => {
      loadHistory();
      loadExpiring();
    });
  }, []);

  const onRefresh = async () => {
    await loadWallets();
    await Promise.all([loadHistory(), loadExpiring()]);
  };

  const formatAmount = (amount: number, type: TransactionType) => {
    const sign = type === TransactionType.ACCRUAL || type === TransactionType.REFERRAL ? '+' : '-';
    const color =
      type === TransactionType.ACCRUAL || type === TransactionType.REFERRAL
        ? colors.success
        : colors.accent;
    return { sign, color, text: `${sign}${amount.toLocaleString()} ₸` };
  };

  const recentTransactions = transactions.slice(0, 5);
  const totalExpiring = expiringLots.reduce((sum, lot) => sum + lot.remaining, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Баланс бонусов</Text>
        <Text style={styles.balanceAmount}>
          {(activeWallet?.balance ?? 0).toLocaleString()} ₸
        </Text>
        {activeWallet?.company && (
          <Text style={styles.companyName}>{activeWallet.company.name}</Text>
        )}
        <Button
          mode="contained"
          onPress={() => navigation.navigate('QrCode')}
          style={styles.qrButton}
          buttonColor="#FFFFFF"
          textColor={colors.primary}
          icon="qrcode"
        >
          Показать QR
        </Button>
      </View>

      {/* Expiring Warning */}
      {totalExpiring > 0 && (
        <Card
          style={styles.warningCard}
          onPress={() => navigation.navigate('Expiring')}
        >
          <Card.Content style={styles.warningContent}>
            <MaterialCommunityIcons name="clock-alert-outline" size={24} color="#FF8800" />
            <View style={styles.warningText}>
              <Text style={styles.warningTitle}>Сгорают скоро</Text>
              <Text style={styles.warningAmount}>
                {totalExpiring.toLocaleString()} ₸ — {expiringLots.length} лотов
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
          </Card.Content>
        </Card>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Последние операции</Text>
          <Button
            mode="text"
            onPress={() => navigation.getParent()?.navigate('History')}
            textColor={colors.primary}
            compact
          >
            Все
          </Button>
        </View>

        {recentTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>Операций пока нет</Text>
            </Card.Content>
          </Card>
        ) : (
          recentTransactions.map((tx) => {
            const { color, text } = formatAmount(tx.amount, tx.type);
            return (
              <Card key={tx.id} style={styles.txCard}>
                <Card.Content style={styles.txContent}>
                  <View style={styles.txLeft}>
                    <Chip
                      compact
                      textStyle={{ fontSize: 11, color: colors.bg }}
                      style={[
                        styles.txChip,
                        {
                          backgroundColor:
                            tx.type === TransactionType.ACCRUAL
                              ? colors.success
                              : tx.type === TransactionType.BURN
                              ? '#FF8800'
                              : colors.accent,
                        },
                      ]}
                    >
                      {tx.type === TransactionType.ACCRUAL
                        ? 'Начисление'
                        : tx.type === TransactionType.DEBIT
                        ? 'Списание'
                        : tx.type === TransactionType.BURN
                        ? 'Сгорание'
                        : 'Реферал'}
                    </Chip>
                    <Text style={styles.txDate}>
                      {new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                    </Text>
                  </View>
                  <Text style={[styles.txAmount, { color }]}>{text}</Text>
                </Card.Content>
              </Card>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: spacing.sm,
  },
  companyName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.md,
  },
  qrButton: {
    borderRadius: borderRadius.sm,
  },
  warningCard: {
    margin: spacing.md,
    backgroundColor: '#FFF8E1',
    borderRadius: borderRadius.md,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8800',
  },
  warningAmount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyCard: {
    backgroundColor: colors.bg,
    borderRadius: borderRadius.md,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
  txCard: {
    backgroundColor: colors.bg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  txContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txLeft: {
    flex: 1,
  },
  txChip: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  txDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  txAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
});
