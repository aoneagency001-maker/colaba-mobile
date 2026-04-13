import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Button, IconButton, Divider } from 'react-native-paper';
import { useCartStore } from '../../store/cart';
import { colors } from '../../theme';

export default function CartScreen({ navigation }: any) {
  const { items, updateQuantity, removeItem, totalAmount, totalBonusEarned } =
    useCartStore();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU').format(price) + ' тг';

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="headlineSmall" style={styles.emptyText}>
          Корзина пуста
        </Text>
        <Text variant="bodyMedium" style={styles.emptyHint}>
          Добавьте товары из каталога
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CatalogTab')}
          style={styles.goButton}
        >
          Перейти в каталог
        </Button>
      </View>
    );
  }

  const total = totalAmount();
  const bonusEarned = totalBonusEarned();

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.info}>
                <Text variant="titleSmall">{item.product.name}</Text>
                <Text variant="bodySmall" style={styles.price}>
                  {formatPrice(item.product.price)} / {item.product.unit || 'шт'}
                </Text>
              </View>
              <View style={styles.qty}>
                <IconButton
                  icon="minus"
                  size={18}
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                />
                <Text variant="titleMedium">{item.quantity}</Text>
                <IconButton
                  icon="plus"
                  size={18}
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                />
              </View>
              <Text variant="titleSmall" style={styles.lineTotal}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
              <IconButton
                icon="delete-outline"
                size={20}
                onPress={() => removeItem(item.product.id)}
              />
            </Card.Content>
          </Card>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Divider style={styles.divider} />

            <View style={styles.row}>
              <Text variant="titleMedium">Итого:</Text>
              <Text variant="headlineSmall" style={styles.finalTotal}>
                {formatPrice(total)}
              </Text>
            </View>

            <View style={styles.bonusEarn}>
              <Text style={styles.bonusEarnText}>
                Вы получите кэшбэк: +{formatPrice(bonusEarned)}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={() => navigation.navigate('Checkout')}
              disabled={total <= 0}
              style={styles.orderButton}
              contentStyle={styles.orderButtonContent}
              buttonColor={colors.accent}
              textColor="#fff"
            >
              Перейти к оплате
            </Button>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontWeight: 'bold' },
  emptyHint: { color: '#888', marginTop: 8 },
  goButton: { marginTop: 24 },
  card: { marginHorizontal: 12, marginTop: 12, backgroundColor: '#fff' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  price: { color: '#888', marginTop: 2 },
  qty: { flexDirection: 'row', alignItems: 'center' },
  lineTotal: { width: 80, textAlign: 'right', fontWeight: 'bold' },
  footer: { padding: 16 },
  divider: { marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  total: { fontWeight: 'bold' },
  finalTotal: { fontWeight: 'bold', color: colors.primary },
  bonusEarn: {
    backgroundColor: colors.bonusGreenBg,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  bonusEarnText: { color: colors.bonusGreen, fontWeight: '600', textAlign: 'center' },
  orderButton: { marginTop: 16 },
  orderButtonContent: { paddingVertical: 8 },
});
