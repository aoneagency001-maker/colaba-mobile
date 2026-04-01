import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';

// Animated shimmer effect
export function SkeletonBlock({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmer]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E8E8E8',
          opacity: shimmer.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
          }),
        },
        style,
      ]}
    />
  );
}

/** Big balance card placeholder + 3 transaction rows */
export function WalletSkeleton() {
  return (
    <View style={skStyles.walletContainer}>
      {/* Balance card */}
      <SkeletonBlock width="100%" height={180} borderRadius={24} />
      {/* Section title */}
      <SkeletonBlock
        width={140}
        height={18}
        borderRadius={4}
        style={{ marginTop: 20, marginBottom: 12 }}
      />
      {/* Transaction rows */}
      <TransactionRowSkeleton />
      <TransactionRowSkeleton />
      <TransactionRowSkeleton />
    </View>
  );
}

/** Circle + 2 text lines + amount on the right */
export function TransactionRowSkeleton() {
  return (
    <View style={skStyles.txRow}>
      <SkeletonBlock width={40} height={40} borderRadius={20} />
      <View style={skStyles.txTextCol}>
        <SkeletonBlock width={120} height={14} borderRadius={4} />
        <SkeletonBlock
          width={80}
          height={12}
          borderRadius={4}
          style={{ marginTop: 6 }}
        />
      </View>
      <SkeletonBlock width={70} height={16} borderRadius={4} />
    </View>
  );
}

/** Image area + text lines for a store/company card */
export function StoreCardSkeleton() {
  return (
    <View style={skStyles.storeCard}>
      <SkeletonBlock width={48} height={48} borderRadius={8} />
      <View style={skStyles.storeTextCol}>
        <SkeletonBlock width={150} height={16} borderRadius={4} />
        <SkeletonBlock
          width={100}
          height={12}
          borderRadius={4}
          style={{ marginTop: 6 }}
        />
        <SkeletonBlock
          width={80}
          height={12}
          borderRadius={4}
          style={{ marginTop: 6 }}
        />
      </View>
    </View>
  );
}

const skStyles = StyleSheet.create({
  walletContainer: {
    padding: 16,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  txTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  storeTextCol: {
    flex: 1,
    marginLeft: 16,
  },
});
