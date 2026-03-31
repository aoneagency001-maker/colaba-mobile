import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/auth';
import { colors, spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [secureText, setSecureText] = useState(true);
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    try {
      await register({
        firstName,
        lastName,
        phone,
        email: email || undefined,
        password,
        referralCode: referralCode || undefined,
      });
    } catch {
      // error handled by store
    }
  };

  const isValid = firstName && lastName && phone && password.length >= 6;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>Создайте аккаунт Colaba</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Имя"
            value={firstName}
            onChangeText={(t) => { setFirstName(t); clearError(); }}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.textMuted}
            activeOutlineColor={colors.primary}
          />

          <TextInput
            label="Фамилия"
            value={lastName}
            onChangeText={(t) => { setLastName(t); clearError(); }}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.textMuted}
            activeOutlineColor={colors.primary}
          />

          <TextInput
            label="Телефон"
            value={phone}
            onChangeText={(t) => { setPhone(t); clearError(); }}
            keyboardType="phone-pad"
            mode="outlined"
            left={<TextInput.Icon icon="phone" />}
            style={styles.input}
            outlineColor={colors.textMuted}
            activeOutlineColor={colors.primary}
          />

          <TextInput
            label="Email (необязательно)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
            outlineColor={colors.textMuted}
            activeOutlineColor={colors.primary}
          />

          <TextInput
            label="Пароль"
            value={password}
            onChangeText={(t) => { setPassword(t); clearError(); }}
            secureTextEntry={secureText}
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureText ? 'eye-off' : 'eye'}
                onPress={() => setSecureText(!secureText)}
              />
            }
            style={styles.input}
            outlineColor={colors.textMuted}
            activeOutlineColor={colors.primary}
          />

          <TextInput
            label="Реферальный код (необязательно)"
            value={referralCode}
            onChangeText={setReferralCode}
            mode="outlined"
            left={<TextInput.Icon icon="gift" />}
            style={styles.input}
            outlineColor={colors.textMuted}
            activeOutlineColor={colors.primary}
          />

          {error ? (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading || !isValid}
            style={styles.button}
            buttonColor={colors.accent}
            textColor="#FFFFFF"
          >
            Зарегистрироваться
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            textColor={colors.primary}
            style={styles.link}
          >
            Уже есть аккаунт? Войти
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.bg,
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: 8,
    paddingVertical: 4,
  },
  link: {
    marginTop: spacing.xs,
  },
});
