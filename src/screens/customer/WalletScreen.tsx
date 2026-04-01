import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWalletStore } from '../../store/wallet';
import { TransactionType } from '../../types';
import { colors, spacing, borderRadius } from '../../theme';
import { WalletSkeleton } from '../../components/SkeletonLoader';
import WelcomeBonusBanner from '../../components/WelcomeBonusBanner';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

/** Format number as "12 500" (space-separated thousands). */
function formatTenge(value: number): string {
  return Math.round(value).toLocaleString('ru-RU');
}

/** Custom hook: animated counter that rolls up from previous value to target. */
function useAnimatedCounter(target: number, duration = 800): number {
  const [display, setDisplay] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const from = prevTarget.current;
    const to = target;
    prevTarget.current = target;

    if (from === to) {
      setDisplay(to);
      return;
    }

    const startTime = Date.now();
    let rafId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return display;
}

export default function WalletScreen({ navigation }: Props) {
  const { activeWallet, transactions, expiringLots, isLoading, loadWallets, loadHistory, loadExpiring } =
    useWalletStore();
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    loadWallets().then(() => {
      Promise.all([loadHistory(), loadExpiring()]).then(() => setInitialLoaded(true));
    });
  }, []);

  const onRefresh = async () => {
    await loadWallets();
    await Promise.all([loadHistory(), loadExpiring()]);
  };

  // --- UX 1: Animated Balance Counter ---
  const balance = activeWallet?.balance ?? 0;
  const displayBalance = useAnimatedCounter(balance);

  // --- UX 2: Cashback Preview ---
  const monthlyCashback = useMemo(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    return transactions
      .filter(
        (tx) =>
          (tx.type === TransactionType.ACCRUAL || tx.type === TransactionType.REFERRAL) &&
          new Date(tx.createdAt).getTime() >= thirtyDaysAgo,
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  // --- UX 3: Expiry Banner ---
  const totalExpiring = expiringLots.reduce((sum, lot) => sum + lot.remaining, 0);
  const soonestExpiry = useMemo(() => {
    if (expiringLots.length === 0) return null;
    const sorted = [...expiringLots].sort(
      (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    );
    const daysLeft = Math.ceil(
      (new Date(sorted[0].expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return daysLeft;
  }, [expiringLots]);

  // --- UX 8: Welcome Banner for new users ---
  const isNewUser = initialLoaded && balance === 0 && transactions.length === 0;

  // --- Recent transactions ---
  const recentTransactions = transactions.slice(0, 5);

  const formatAmount = useCallback((amount: number, type: TransactionType) => {
    const isPositive = type === TransactionType.ACCRUAL || type === TransactionType.REFERRAL;
    const sign = isPositive ? '+' : '-';
    const color = isPositive ? colors.success : type === TransactionType.BURN ? '#FF8800' : colors.accent;
    return { sign, color, text: `${sign}${amount.toLocaleString('ru-RU')} тг` };
  }, []);

  const txIcon = useCallback((type: TransactionType) => {
    if (type === TransactionType.ACCRUAL || type === TransactionType.REFERRAL) {
      return { name: 'arrow-down' as const, bg: colors.success };
    }
    if (type === TransactionType.BURN) {
      return { name: 'clock-outline' as const, bg: '#FF8800' };
    }
    return { name: 'arrow-up' as const, bg: colors.accent };
  }, []);

  // --- UX 7: Skeleton while initial data loads ---
  if (!initialLoaded && isLoading) {
    return (
      <View style={styles.container}>
        <WalletSkeleton />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      {/* ===== UX 8: Welcome Banner ===== */}
      {isNewUser && <WelcomeBonusBanner />}

      {/* ===== Balance Card ===== */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Бонусный баланс</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>{formatTenge(displayBalance)}</Text>
          <Text style={styles.balanceCurrency}> тг</Text>
        </View>
        {activeWallet?.company && (
          <Text style={styles.companyName}>{activeWallet.company.name}</Text>
        )}

        {/* Quick action buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('QrCode')}
          >
            <View style={styles.quickIconCircle}>
              <MaterialCommunityIcons name="qrcode" size={22} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Показать QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.getParent()?.navigate('History')}
          >
            <View style={styles.quickIconCircle}>
              <MaterialCommunityIcons name="history" size={22} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>История</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.getParent()?.navigate('Profile')}
          >
            <View style={styles.quickIconCircle}>
              <MaterialCommunityIcons name="account" size={22} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Профиль</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== UX 2: Monthly Cashback Badge ===== */}
      {monthlyCashback > 0 && (
        <View style={styles.cashbackBadge}>
          <MaterialCommunityIcons name="cash-plus" size={20} color={colors.success} />
          <Text style={styles.cashbackText}>
            +{formatTenge(monthlyCashback)} тг за этот месяц
          </Text>
        </View>
      )}

      {/* ===== UX 3: Expiry Banner ===== */}
      {totalExpiring > 0 && soonestExpiry !== null && soonestExpiry <= 30 && (
        <TouchableOpacity
          style={styles.expiryBanner}
          onPress={() => navigation.navigate('Expiring')}
          activeOpacity={0.8}
        >
          <Text style={styles.expiryText}>
            🔥 {formatTenge(totalExpiring)} тг сгорят через {soonestExpiry} дн. —{' '}
            <Text style={styles.expiryLink}>Потратить →</Text>
          </Text>
        </TouchableOpacity>
      )}

      {/* ===== Recent Transactions ===== */}
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
            const icon = txIcon(tx.type);
            return (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIconCircle, { backgroundColor: icon.bg + '20' }]}>
                  <MaterialCommunityIcons name={icon.name} size={18} color={icon.bg} />
                </View>
                <View style={styles.txMiddle}>
                  <Text style={styles.txDescription} numberOfLines={1}>
                    {tx.description ||
                      (tx.type === TransactionType.ACCRUAL
                        ? 'Начисление'
                        : tx.type === TransactionType.DEBIT
                        ? 'Списание'
                        : tx.type === TransactionType.BURN
                        ? 'Сгорание'
                        : 'Реферал')}
                  </Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.createdAt).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
                <Text style={[styles.txAmount, { color }]}>{text}</Text>
              </View>
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

  /* Balance Card */
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
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: spacing.sm,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  balanceCurrency: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  companyName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.md,
  },

  /* Quick Actions */
  quickActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    width: 72,
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },

  /* Cashback Badge */
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  cashbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },

  /* Expiry Banner */
  expiryBanner: {
    backgroundColor: '#FF8C00',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
  },
  expiryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  expiryLink: {
    textDecorationLine: 'underline',
    fontWeight: '700',
  },

  /* Section */
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

  /* Transaction Rows */
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
});
