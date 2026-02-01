import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Globe, RefreshCcw } from 'lucide-react-native';
import Typography from '../../../components/atoms/Typography';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import { RootState } from '../../../store';
import { setSettings } from '../../../store/slices/settingsSlice';
import { logout } from '../../../store/slices/authSlice';
import { setExpenses } from '../../../store/slices/expenseSlice';
import { setWallets } from '../../../store/slices/walletSlice';
import { useRouter } from 'expo-router';
import { SettingsRepository } from '../../../infrastructure/database/repositories/SettingsRepository';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const { exchangeRate, usdExchangeRate, tripStartDate, initialBudgetEur, initialBudgetClp } = useSelector((state: RootState) => state.settings);

  const [rate, setRate] = useState(exchangeRate.toString());
  const [usdRate, setUsdRate] = useState(usdExchangeRate.toString());
  const [budget, setBudget] = useState(initialBudgetEur.toString());
  const [budgetClp, setBudgetClp] = useState(initialBudgetClp.toString());

  const handleUpdateRate = async () => {
    const rateNum = parseFloat(rate);
    const usdRateNum = parseFloat(usdRate);
    if (isNaN(rateNum) || rateNum <= 0 || isNaN(usdRateNum) || usdRateNum <= 0) {
      Alert.alert('Error', 'Por favor ingresa tipos de cambio válidos');
      return;
    }
    await SettingsRepository.set('exchangeRate', rateNum.toString());
    await SettingsRepository.set('usdExchangeRate', usdRateNum.toString());
    dispatch(setSettings({ exchangeRate: rateNum, usdExchangeRate: usdRateNum }));
    Alert.alert('Éxito', 'Tipos de cambio actualizados');
  };

  const handleUpdateBudget = async () => {
    const budgetNum = parseFloat(budget);
    const budgetClpNum = parseFloat(budgetClp);
    if (isNaN(budgetNum) || budgetNum < 0 || isNaN(budgetClpNum) || budgetClpNum < 0) {
      Alert.alert('Error', 'Por favor ingresa un presupuesto válido');
      return;
    }
    await SettingsRepository.set('initialBudgetEur', budgetNum.toString());
    await SettingsRepository.set('initialBudgetClp', budgetClpNum.toString());
    dispatch(setSettings({ initialBudgetEur: budgetNum, initialBudgetClp: budgetClpNum }));
    Alert.alert('Éxito', 'Presupuesto inicial actualizado');
  };

  const onBudgetEurChange = (val: string) => {
    setBudget(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setBudgetClp((num * exchangeRate).toFixed(0));
    }
  };

  const handleLogout = async () => {
    await SettingsRepository.remove('currentUserId');
    dispatch(logout());
    dispatch(setExpenses([]));
    dispatch(setWallets([]));
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant="h1" style={styles.headerTitle}>Ajustes</Typography>

        <Typography variant="h3" style={styles.sectionTitle}>Configuración del viaje</Typography>
        <Card>
          <Input
            label="Tipo de cambio (1 EUR → CLP)"
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
          />
          <Input
            label="Tipo de cambio (1 EUR → USD)"
            value={usdRate}
            onChangeText={setUsdRate}
            keyboardType="numeric"
          />
          <Button
            title="Actualizar tipos de cambio"
            onPress={handleUpdateRate}
            variant="secondary"
          />
        </Card>

        <Card>
          <View style={styles.infoRow}>
            <Typography variant="label">Fecha de inicio:</Typography>
            <Typography variant="body">{tripStartDate || 'No definida'}</Typography>
          </View>
          <View style={{ marginTop: 16 }}>
            <Input
              label="Presupuesto inicial (EUR)"
              value={budget}
              onChangeText={onBudgetEurChange}
              keyboardType="numeric"
            />
            <Input
              label="Presupuesto inicial (CLP)"
              value={budgetClp}
              onChangeText={setBudgetClp}
              keyboardType="numeric"
            />
            <Button
              title="Actualizar presupuesto"
              onPress={handleUpdateBudget}
              variant="secondary"
            />
          </View>
        </Card>

        <Typography variant="h3" style={[styles.sectionTitle, { marginTop: 24 }]}>Cuenta</Typography>
        <Button
          title="Cerrar sesión"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />

        <Typography variant="caption" color="#999" align="center" style={{ marginTop: 40 }}>
          EuroViaje v1.0.0
        </Typography>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 24,
  },
  headerTitle: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: 8,
  },
});
