import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { Order } from '../../types';
import { colors } from '../../theme';

const formatTenge = (v: number) => new Intl.NumberFormat('ru-RU').format(v);
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Ожидает', color: colors.warning, icon: 'clock-outline' },
  confirmed: { label: 'Подтверждён', color: colors.bonusGreen, icon: 'check-circle' },
  cancelled: { label: 'Отменён', color: colors.danger, icon: 'close-circle' },
};

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/orders', { params: { limit: 50 } });
      setOrders(data.items || []);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <FlatList
      style={styles.container}
      data={orders}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const st = statusMap[item.status] || statusMap.pending;
        return (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.orderId}>#{'\u00A0'}{item.id.substring(0, 8)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: st.color + '18' }]}>
                <MaterialCommunityIcons name={st.icon} size={14} color={st.color} />
                <Text style={[styles.statusText, { color: st.color }]}> {st.label}</Text>
              </View>
            </View>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>

            {/* Товары */}
            {item.items.map((it, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{it.productName}</Text>
                <Text style={styles.itemQty}>{it.quantity} {it.unit}</Text>
              </View>
            ))}

            {/* Итог */}
            <View style={styles.footer}>
              <View>
                <Text style={styles.totalLabel}>Итого</Text>
                <Text style={styles.totalValue}>{formatTenge(Number(item.finalAmount))} тг</Text>
              </View>
              {Number(item.totalBonusEarned) > 0 && (
                <View style={styles.cashbackBadge}>
                  <MaterialCommunityIcons name="star" size={12} color={colors.bonusGreen} />
                  <Text style={styles.cashbackText}> +{formatTenge(Number(item.totalBonusEarned))} тг</Text>
                </View>
              )}
            </View>

            {Number(item.bonusDiscount) > 0 && (
              <Text style={styles.discountNote}>
                Оплачено бонусами: {formatTenge(Number(item.bonusDiscount))} тг
              </Text>
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.empty}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#ddd" />
          <Text style={styles.emptyText}>Заказов пока нет</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontWeight: '700', color: colors.text, fontSize: 15 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 2, marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemName: { flex: 1, color: colors.textSecondary, fontSize: 13 },
  itemQty: { color: colors.textMuted, fontSize: 13, marginLeft: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderLight },
  totalLabel: { color: colors.textMuted, fontSize: 12 },
  totalValue: { fontWeight: '700', color: colors.text, fontSize: 16 },
  cashbackBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bonusGreenBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  cashbackText: { color: colors.bonusGreen, fontWeight: '600', fontSize: 12 },
  discountNote: { color: colors.warning, fontSize: 12, marginTop: 6 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: colors.textMuted, marginTop: 8 },
});
