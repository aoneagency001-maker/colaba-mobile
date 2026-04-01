import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuthStore } from '../../store/auth';
import api from '../../services/api';
import { colors } from '../../theme';

export default function EditProfileScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/users/me', form);
      Alert.alert('Готово', 'Профиль обновлён');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Ошибка', e.response?.data?.message || 'Не удалось сохранить');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TextInput label="Фамилия" value={form.lastName} onChangeText={(v) => update('lastName', v)} mode="outlined" style={styles.input} outlineColor={colors.border} activeOutlineColor={colors.primary} />
      <TextInput label="Имя" value={form.firstName} onChangeText={(v) => update('firstName', v)} mode="outlined" style={styles.input} outlineColor={colors.border} activeOutlineColor={colors.primary} />
      <TextInput label="Email" value={form.email} onChangeText={(v) => update('email', v)} mode="outlined" style={styles.input} keyboardType="email-address" autoCapitalize="none" outlineColor={colors.border} activeOutlineColor={colors.primary} />

      <View style={styles.readOnly}>
        <Text style={styles.readOnlyLabel}>Телефон</Text>
        <Text style={styles.readOnlyValue}>{user?.phone}</Text>
      </View>

      <Button mode="contained" onPress={handleSave} loading={loading} style={styles.button} buttonColor={colors.accent} textColor="#fff">
        Сохранить
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  input: { marginBottom: 14, backgroundColor: '#fff' },
  readOnly: { backgroundColor: colors.bgLight, borderRadius: 10, padding: 14, marginBottom: 14 },
  readOnlyLabel: { color: colors.textMuted, fontSize: 12 },
  readOnlyValue: { color: colors.text, fontWeight: '600', fontSize: 15, marginTop: 2 },
  button: { marginTop: 10, borderRadius: 10, paddingVertical: 4 },
});
