import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import api from '../../services/api';
import { Product } from '../../types';
import { useCartStore } from '../../store/cart';

export default function ProductDetailScreen({ route }: any) {
  const { id } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU').format(price) + ' тг';

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Товар не найден</Text>
      </View>
    );
  }

  const bonusPerUnit =
    product.bonusType === 'percent'
      ? (product.price * product.bonusValue) / 100
      : product.bonusValue;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.name}>
          {product.name}
        </Text>
        <Text variant="bodyMedium" style={styles.category}>
          {product.category?.name}
        </Text>

        <View style={styles.priceSection}>
          <Text variant="headlineMedium" style={styles.price}>
            {formatPrice(product.price)}
          </Text>
          {product.unit && (
            <Text variant="bodyLarge" style={styles.unit}>
              / {product.unit}
            </Text>
          )}
        </View>

        <View style={styles.bonusBanner}>
          <Text style={styles.bonusTitle}>Кэшбэк с покупки</Text>
          <Text style={styles.bonusValue}>
            {product.bonusValue}%
            {product.bonusMultiplier > 1
              ? ` x${product.bonusMultiplier} (акция!)`
              : ''}
          </Text>
          <Text style={styles.bonusCalc}>
            = {formatPrice(Math.round(bonusPerUnit * product.bonusMultiplier))} бонусов за {product.unit || 'шт'}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {product.description && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Описание
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {product.description}
            </Text>
          </>
        )}

        {product.composition && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Состав / Марка стали
            </Text>
            <Text variant="bodyMedium">{product.composition}</Text>
          </>
        )}

        <Button
          mode="contained"
          onPress={() => addItem(product)}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
        >
          Добавить в корзину
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  name: { fontWeight: 'bold' },
  category: { color: '#888', marginTop: 4 },
  priceSection: { flexDirection: 'row', alignItems: 'baseline', marginTop: 16 },
  price: { fontWeight: 'bold', color: '#1a1a2e' },
  unit: { color: '#888', marginLeft: 4 },
  bonusBanner: {
    marginTop: 16,
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
  },
  bonusTitle: { fontSize: 14, color: '#2e7d32' },
  bonusValue: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32', marginTop: 4 },
  bonusCalc: { fontSize: 13, color: '#388e3c', marginTop: 4 },
  divider: { marginVertical: 20 },
  sectionTitle: { fontWeight: '600', marginBottom: 8 },
  description: { color: '#555', lineHeight: 22 },
  addButton: { marginTop: 24 },
  addButtonContent: { paddingVertical: 8 },
});
