import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/auth';
import { colors, spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login(phone, password);
    } catch {
      // error is handled by store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.logo}>Colaba</Text>
          <Text style={styles.subtitle}>Бонусная программа</Text>
        </View>

        <View style={styles.form}>
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

          {error ? (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading || !phone || !password}
            style={styles.button}
            buttonColor={colors.accent}
            textColor="#FFFFFF"
          >
            Войти
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            textColor={colors.primary}
            style={styles.link}
          >
            Нет аккаунта? Зарегистрироваться
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
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
