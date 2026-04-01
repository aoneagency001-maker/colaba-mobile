import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import api from '../../services/api';
import { NewsArticle } from '../../types';

export default function NewsScreen({ navigation }: any) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = async () => {
    try {
      const params: any = { limit: 20 };
      if (category) params.category = category;
      const { data } = await api.get('/news', { params });
      setNews(data.items);
    } catch {}
  };

  useEffect(() => {
    loadNews();
  }, [category]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  }, [category]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'promo': return 'Акция';
      case 'event': return 'Событие';
      case 'update': return 'Обновление';
      default: return cat;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {[null, 'promo', 'event', 'update'].map((cat) => (
          <Chip
            key={cat || 'all'}
            selected={category === cat}
            onPress={() => setCategory(cat)}
            style={styles.chip}
          >
            {cat ? getCategoryLabel(cat) : 'Все'}
          </Chip>
        ))}
      </View>

      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('NewsDetail', { id: item.id })}
          >
            {item.previewImageUrl && (
              <Card.Cover source={{ uri: item.previewImageUrl }} />
            )}
            <Card.Content style={styles.cardContent}>
              <Chip compact style={styles.categoryChip}>
                {getCategoryLabel(item.category)}
              </Chip>
              <Text variant="titleMedium" style={styles.title}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={styles.date}>
                {formatDate(item.publishedAt)}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Новостей пока нет</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filters: { flexDirection: 'row', padding: 12, gap: 8 },
  chip: {},
  list: { paddingHorizontal: 12, paddingBottom: 12 },
  card: { marginBottom: 12, backgroundColor: '#fff' },
  cardContent: { paddingTop: 12 },
  categoryChip: { alignSelf: 'flex-start', marginBottom: 8 },
  title: { fontWeight: 'bold' },
  date: { color: '#888', marginTop: 8 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});
