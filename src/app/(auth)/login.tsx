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
import { setUser } from '../../store/slices/authSlice';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const user = await UserRepository.validatePassword(email, password);
      if (user) {
        dispatch(setUser(user));
        router.replace('/(main)/(tabs)/dashboard');
      } else {
        Alert.alert('Error', 'Credenciales inválidas');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h1" style={styles.title}>{t('auth.welcome')}</Typography>
        <Typography variant="body" color="#666" style={styles.subtitle}>{t('auth.login')}</Typography>

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

        <Button
          title={t('auth.login')}
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity onPress={() => router.push('/register')} style={styles.link}>
          <Typography variant="label" color="#007AFF">
            ¿No tienes cuenta? Regístrate aquí
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
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
