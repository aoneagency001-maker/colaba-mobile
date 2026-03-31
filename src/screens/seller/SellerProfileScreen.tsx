import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { colors, spacing, borderRadius } from '../../theme';

export default function SellerProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      {/* Seller Info Card */}
      <Card style={styles.card}>
        <Card.Content style={styles.userSection}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-tie" size={64} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.role}>Продавец</Text>
            <Text style={styles.phone}>{user?.phone}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Store Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Информация о магазине</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="store" size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>Название магазина будет загружено из API</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="badge-account-horizontal" size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>Код сотрудника: {user?.id?.slice(0, 8) || '---'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.card}>
        <Card.Content style={{ paddingHorizontal: 0 }}>
          <List.Item
            title="Уведомления"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title="О приложении"
            description="Colaba LTV v1.0.0"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
          />
        </Card.Content>
      </Card>

      {/* Logout */}
      <Button
        mode="outlined"
        onPress={logout}
        style={styles.logoutButton}
        textColor={colors.accent}
        icon="logout"
      >
        Выйти
      </Button>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.bg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: spacing.md,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  role: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  phone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logoutButton: {
    borderColor: colors.accent,
    marginTop: spacing.sm,
  },
});
