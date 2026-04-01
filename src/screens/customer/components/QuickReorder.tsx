import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../../theme';

interface ReorderItem {
  id: string;
  name: string;
  price: number;
  unit: string;
}

const RECENT_ITEMS: ReorderItem[] = [
  { id: '1', name: 'Арматура А500С d12', price: 125000, unit: 'тонна' },
  { id: '2', name: 'Лист г/к 3мм', price: 148000, unit: 'тонна' },
  { id: '3', name: 'Профтруба 40x40', price: 170000, unit: 'тонна' },
  { id: '4', name: 'Швеллер 12П', price: 158000, unit: 'тонна' },
];

function formatTenge(amount: number): string {
  return amount.toLocaleString('ru-RU');
}

interface QuickReorderProps {
  onAddItem?: (item: ReorderItem) => void;
}

export default function QuickReorder({ onAddItem }: QuickReorderProps) {
  const renderItem = ({ item }: { item: ReorderItem }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          {formatTenge(item.price)} ₸/{item.unit}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => onAddItem?.(item)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Заказать снова</Text>
      <FlatList
        data={RECENT_ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
  card: {
    width: 140,
    backgroundColor: colors.bg,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 120,
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
});
