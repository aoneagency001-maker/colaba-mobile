import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { Product } from '../../types';
import { useCartStore } from '../../store/cart';
import { colors } from '../../theme';

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

  const hasImage = product.images && product.images.length > 0 && product.images[0];
  const price = Number(product.price);
  const bonusPerUnit =
    product.bonusType === 'percent'
      ? (price * Number(product.bonusValue)) / 100
      : Number(product.bonusValue);

  return (
    <ScrollView style={styles.container}>
      {/* Картинка товара — полный размер */}
      {hasImage ? (
        <Image
          source={{ uri: product.images[0] }}
          style={styles.heroImage}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.heroImage, styles.heroPlaceholder]}>
          <MaterialCommunityIcons name="image-off" size={48} color="#ddd" />
        </View>
      )}

      <View style={styles.content}>
        {/* Категория */}
        {product.category?.name && (
          <Text style={styles.category}>{product.category.name}</Text>
        )}

        {/* Название */}
        <Text style={styles.name}>{product.name}</Text>

        {/* Цена */}
        <View style={styles.priceSection}>
          {price > 0 ? (
            <>
              <Text style={styles.price}>{formatPrice(price)}</Text>
              {product.unit && <Text style={styles.unit}> / {product.unit}</Text>}
            </>
          ) : (
            <Text style={styles.priceRequest}>Цена по запросу</Text>
          )}
        </View>

        {/* Кэшбэк */}
        <View style={styles.bonusBanner}>
          <View style={styles.bonusRow}>
            <MaterialCommunityIcons name="percent" size={16} color={colors.bonusGreen} />
            <Text style={styles.bonusValue}>
              {' '}{product.bonusValue}% кэшбэк
              {Number(product.bonusMultiplier) > 1 ? ` x${product.bonusMultiplier}` : ''}
            </Text>
          </View>
          {price > 0 && (
            <Text style={styles.bonusCalc}>
              = {formatPrice(Math.round(bonusPerUnit * Number(product.bonusMultiplier)))} бонусов за {product.unit || 'шт'}
            </Text>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Описание */}
        {product.description && (
          <>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.description}>{product.description}</Text>
          </>
        )}

        {/* Состав */}
        {product.composition && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Марка стали / ГОСТ</Text>
            <Text style={styles.description}>{product.composition}</Text>
          </>
        )}

        {/* Кнопка */}
        <Button
          mode="contained"
          onPress={() => addItem(product)}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
          buttonColor={colors.primary}
          textColor="#fff"
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

  // Hero image
  heroImage: { width: '100%', height: 250, backgroundColor: '#f8f8f8' },
  heroPlaceholder: { justifyContent: 'center', alignItems: 'center' },

  // Info
  category: { color: colors.textMuted, fontSize: 13, marginBottom: 4 },
  name: { fontSize: 20, fontWeight: '700', color: colors.text, lineHeight: 26 },
  priceSection: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  price: { fontSize: 24, fontWeight: '800', color: colors.primary },
  unit: { fontSize: 16, color: colors.textMuted },
  priceRequest: { fontSize: 18, fontWeight: '700', color: colors.warning },

  // Bonus
  bonusBanner: { marginTop: 14, backgroundColor: colors.bonusGreenBg, padding: 14, borderRadius: 12 },
  bonusRow: { flexDirection: 'row', alignItems: 'center' },
  bonusValue: { fontSize: 16, fontWeight: '700', color: colors.bonusGreen },
  bonusCalc: { fontSize: 13, color: '#388e3c', marginTop: 4 },

  divider: { marginVertical: 20 },
  sectionTitle: { fontWeight: '700', fontSize: 15, color: colors.text, marginBottom: 8 },
  description: { color: '#555', lineHeight: 22, fontSize: 14 },
  addButton: { marginTop: 24, borderRadius: 12 },
  addButtonContent: { paddingVertical: 8 },
});
