import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import api from '../../services/api';
import { NewsArticle } from '../../types';

export default function NewsDetailScreen({ route }: any) {
  const { id } = route.params;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/news/${id}`);
        setArticle(data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  if (!article) return <Text style={styles.error}>Новость не найдена</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        {article.title}
      </Text>
      <Text variant="bodySmall" style={styles.date}>
        {new Date(article.publishedAt).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>
      <Text variant="bodyLarge" style={styles.body}>
        {article.content}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  loader: { flex: 1, justifyContent: 'center' },
  error: { textAlign: 'center', marginTop: 40, color: '#888' },
  title: { fontWeight: 'bold' },
  date: { color: '#888', marginTop: 8, marginBottom: 20 },
  body: { lineHeight: 24, color: '#333' },
});
