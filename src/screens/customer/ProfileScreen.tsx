import React from 'react';
import { View, StyleSheet, ScrollView, Share, Platform } from 'react-native';
import { Text, Card, Button, Divider, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { colors, spacing, borderRadius } from '../../theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, customer, logout } = useAuthStore();

  const handleCopyReferral = async () => {
    if (!customer?.referralCode) return;
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(customer.referralCode);
      } catch {
        // fallback
      }
    }
  };

  const handleShareReferral = async () => {
    if (!customer?.referralCode) return;
    try {
      await Share.share({
        message: `Присоединяйся к Colaba! Мой реферальный код: ${customer.referralCode}`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info Card */}
      <Card style={styles.card}>
        <Card.Content style={styles.userSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>ИП</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {user?.firstName || 'Иван'} {user?.lastName || 'Петров'}
            </Text>
            <Text style={styles.phone}>{user?.phone || '+77001234567'}</Text>
            <Text style={styles.email}>{user?.email || 'petrov@alfastroy.kz'}</Text>
            <Text style={styles.company}>ТОО «АльфаСтрой»</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Bonus balance */}
      <Card style={[styles.card, { backgroundColor: colors.bonusGreenBg }]}>
        <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="star-circle" size={32} color={colors.bonusGreen} />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Бонусный баланс</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.bonusGreen }}>47 500 тг</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Referral Section */}
      {customer?.referralCode && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Реферальная программа</Text>
            <View style={styles.referralBox}>
              <Text style={styles.referralCode}>{customer.referralCode}</Text>
            </View>
            <View style={styles.referralActions}>
              <Button
                mode="outlined"
                onPress={handleCopyReferral}
                icon="content-copy"
                compact
                style={styles.referralButton}
                textColor={colors.primary}
              >
                Копировать
              </Button>
              <Button
                mode="contained"
                onPress={handleShareReferral}
                icon="share"
                compact
                style={styles.referralButton}
                buttonColor={colors.primary}
              >
                Поделиться
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content style={{ paddingHorizontal: 0 }}>
          <List.Item
            title="Мои заказы"
            left={(props) => <List.Icon {...props} icon="clipboard-list-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('OrderHistory')}
          />
          <Divider />
          <List.Item
            title="Редактировать профиль"
            left={(props) => <List.Icon {...props} icon="account-edit-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <Divider />
          <List.Item
            title="Новости"
            left={(props) => <List.Icon {...props} icon="newspaper-variant-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('News')}
          />
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.card}>
        <Card.Content style={{ paddingHorizontal: 0 }}>
          <List.Item
            title="Уведомления"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <Divider />
          <List.Item
            title="Язык"
            description="Русский"
            left={(props) => <List.Icon {...props} icon="translate" />}
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
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  company: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  phone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  email: {
    fontSize: 13,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  referralBox: {
    backgroundColor: colors.bgLight,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
  },
  referralActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  referralButton: {
    flex: 1,
  },
  logoutButton: {
    borderColor: colors.accent,
    marginTop: spacing.sm,
  },
});
