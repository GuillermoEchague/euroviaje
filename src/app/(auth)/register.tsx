import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import Typography from '../../components/atoms/Typography';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { SettingsRepository } from '../../infrastructure/database/repositories/SettingsRepository';
import { setUser } from '../../store/slices/authSlice';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        Alert.alert('Error', 'El correo ya está registrado');
        return;
      }

      const userId = await UserRepository.create(email, password);
      await SettingsRepository.set('currentUserId', userId.toString());
      dispatch(setUser({ id: userId, email }));
      router.replace('/(main)/onboarding');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h1" style={styles.title}>{t('auth.register')}</Typography>

        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder="email@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          secureTextEntry
        />

        <Input
          label="Confirmar Contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="********"
          secureTextEntry
        />

        <Button
          title={t('auth.register')}
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity onPress={() => router.back()} style={styles.link}>
          <Typography variant="label" color="#007AFF">
            ¿Ya tienes cuenta? Inicia sesión
          </Typography>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
  link: {
    marginTop: 24,
    alignItems: 'center',
  },
});
