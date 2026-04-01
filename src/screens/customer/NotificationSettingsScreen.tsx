import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

function SettingRow({ icon, label, desc, value, onToggle }: {
  icon: any; label: string; desc: string; value: boolean; onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.textSecondary} style={styles.rowIcon} />
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} color={colors.bonusGreen} />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [promos, setPromos] = useState(true);
  const [expiry, setExpiry] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Каналы уведомлений</Text>
        <SettingRow
          icon="bell-ring"
          label="Push-уведомления"
          desc="Начисления, списания, акции"
          value={push}
          onToggle={setPush}
        />
        <Divider style={styles.divider} />
        <SettingRow
          icon="email-outline"
          label="Email-рассылка"
          desc="Новости и акции на почту"
          value={email}
          onToggle={setEmail}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Типы уведомлений</Text>
        <SettingRow
          icon="tag-heart"
          label="Акции и спецпредложения"
          desc="Двойной кэшбэк, скидки"
          value={promos}
          onToggle={setPromos}
        />
        <Divider style={styles.divider} />
        <SettingRow
          icon="fire"
          label="Сгорание бонусов"
          desc="Напоминания за 30 и 7 дней"
          value={expiry}
          onToggle={setExpiry}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, padding: 16 },
  section: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderLight },
  sectionTitle: { fontWeight: '700', color: colors.text, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowIcon: { marginRight: 12 },
  rowBody: { flex: 1, marginRight: 8 },
  rowLabel: { fontWeight: '600', color: colors.text, fontSize: 14 },
  rowDesc: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  divider: { marginLeft: 34 },
});
