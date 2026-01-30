import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import Typography from '../../components/atoms/Typography';
import { setSettings } from '../../store/slices/settingsSlice';
import { SettingsRepository } from '../../infrastructure/database/repositories/SettingsRepository';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  const [budget, setBudget] = useState('');
  const [rate, setRate] = useState('1000');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleComplete = async () => {
    const budgetNum = parseFloat(budget) || 0;
    const rateNum = parseFloat(rate) || 1000;

    await Promise.all([
      SettingsRepository.set('initialBudgetEur', budgetNum.toString()),
      SettingsRepository.set('exchangeRate', rateNum.toString()),
      SettingsRepository.set('tripStartDate', startDate || ''),
    ]);

    dispatch(setSettings({
      initialBudgetEur: budgetNum,
      exchangeRate: rateNum,
      tripStartDate: startDate
    }));

    router.replace('/(main)/(tabs)/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant="h1" style={styles.title}>Configuración inicial</Typography>
        <Typography variant="body" color="#666" style={styles.subtitle}>
          Configura los detalles de tu viaje para comenzar a controlar tus gastos.
        </Typography>

        <Input
          label="Presupuesto inicial (EUR)"
          value={budget}
          onChangeText={setBudget}
          placeholder="0.00"
          keyboardType="numeric"
        />

        <Input
          label="Tipo de cambio (1 EUR → CLP)"
          value={rate}
          onChangeText={setRate}
          placeholder="1000"
          keyboardType="numeric"
        />

        <Input
          label="Fecha de inicio (Opcional)"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
        />

        <Button
          title="Comenzar viaje"
          onPress={handleComplete}
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
  },
  button: {
    marginTop: 16,
  },
});
