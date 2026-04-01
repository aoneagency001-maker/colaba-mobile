import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';

interface WelcomeBonusBannerProps {
  onLearnMore?: () => void;
}

export default function WelcomeBonusBanner({ onLearnMore }: WelcomeBonusBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{'🎉'}</Text>
        <Text style={styles.title}>Добро пожаловать в StalFed Bonus!</Text>
        <Text style={styles.subtitle}>
          Отсканируйте первый QR-код и получите 200 тг на счёт
        </Text>
        {onLearnMore && (
          <TouchableOpacity onPress={onLearnMore} style={styles.learnMoreBtn}>
            <Text style={styles.learnMoreText}>Как это работает?</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.iconArea}>
        <MaterialCommunityIcons name="gift-outline" size={56} color="rgba(255,255,255,0.4)" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#1a1a4e',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  emoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
  },
  learnMoreBtn: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  iconArea: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: spacing.md,
  },
});
