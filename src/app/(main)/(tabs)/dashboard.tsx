import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import Typography from '../../../components/atoms/Typography';
import Card from '../../../components/molecules/Card';
import { RootState } from '../../../store';
import { formatCurrency } from '../../../utils/format';
import { ExpenseRepository } from '../../../infrastructure/database/repositories/ExpenseRepository';
import { WalletRepository } from '../../../infrastructure/database/repositories/WalletRepository';
import { setExpenses } from '../../../store/slices/expenseSlice';
import { setWallets } from '../../../store/slices/walletSlice';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { expenses } = useSelector((state: RootState) => state.expenses);
  const { wallets } = useSelector((state: RootState) => state.wallets);
  const { exchangeRate, initialBudgetEur, initialBudgetClp, usdExchangeRate } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const [userExpenses, userWallets] = await Promise.all([
      ExpenseRepository.getAllByUserId(user.id),
      WalletRepository.getAllByUserId(user.id)
    ]);
    dispatch(setExpenses(userExpenses));
    dispatch(setWallets(userWallets));
  };

  const totals = useMemo(() => {
    const spentEur = expenses.reduce((acc, curr) => acc + curr.amountEur, 0);
    const spentClp = expenses.reduce((acc, curr) => acc + curr.amountClp, 0);

    // For balance, we need to convert all wallets to EUR and CLP
    let balanceEur = 0;
    let balanceClp = 0;

    wallets.forEach(w => {
      if (w.currency === 'EUR') {
        balanceEur += w.balance;
        balanceClp += w.balance * exchangeRate;
      } else if (w.currency === 'CLP') {
        balanceEur += w.balance / exchangeRate;
        balanceClp += w.balance;
      } else if (w.currency === 'USD') {
        const eur = w.balance / usdExchangeRate;
        balanceEur += eur;
        balanceClp += eur * exchangeRate;
      }
    });

    return {
      spentEur,
      spentClp,
      balanceEur,
      balanceClp,
      initialEur: initialBudgetEur,
      initialClp: initialBudgetClp
    };
  }, [expenses, wallets, initialBudgetEur, initialBudgetClp, exchangeRate, usdExchangeRate]);

  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amountEur;
    });

    const colors: Record<string, string> = {
      food: '#FF9500',
      transport: '#5856D6',
      hotels: '#007AFF',
      supermarket: '#4CD964',
      health: '#FF3B30',
      leisure: '#FF2D55',
      others: '#8E8E93',
    };

    return Object.keys(categoryTotals).map((cat) => ({
      name: t(`categories.${cat}`),
      amount: categoryTotals[cat],
      color: colors[cat] || '#C9CBCF',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  }, [expenses, t]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant="h1" style={styles.headerTitle}>{t('dashboard.title')}</Typography>

        <Card style={styles.budgetCard}>
          <Typography variant="label" color="rgba(255,255,255,0.8)">{t('dashboard.initial_money')}</Typography>
          <Typography variant="h1" color="#FFFFFF" style={styles.budgetAmount}>
            {formatCurrency(totals.initialEur, 'EUR')}
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.6)">
            {formatCurrency(totals.initialClp, 'CLP')}
          </Typography>
        </Card>

        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { flex: 1, marginRight: 8 }]}>
            <Typography variant="caption" color="#666" style={{ marginBottom: 4 }}>{t('dashboard.total_spent')}</Typography>
            <Typography variant="h3" color="#FF3B30">{formatCurrency(totals.spentEur, 'EUR')}</Typography>
            <Typography variant="caption" color="#999">{formatCurrency(totals.spentClp, 'CLP')}</Typography>
          </Card>
          <Card style={[styles.summaryCard, { flex: 1, marginLeft: 8 }]}>
            <Typography variant="caption" color="#666" style={{ marginBottom: 4 }}>{t('dashboard.available_balance')}</Typography>
            <Typography variant="h3" color="#4CD964">{formatCurrency(totals.balanceEur, 'EUR')}</Typography>
            <Typography variant="caption" color="#999">{formatCurrency(totals.balanceClp, 'CLP')}</Typography>
          </Card>
        </View>

        <Typography variant="h3" style={styles.sectionTitle}>Gastos Recientes</Typography>
        {expenses.length > 0 ? (
          <View style={styles.recentList}>
            {expenses.slice(0, 3).map((item) => (
              <Card key={item.id} style={styles.recentItem}>
                <View style={{ flex: 1 }}>
                  <Typography variant="label">{item.title}</Typography>
                  <Typography variant="caption" color="#999">{t(`categories.${item.category}`)}</Typography>
                </View>
                <Typography variant="label" color="#FF3B30">-{formatCurrency(item.amountEur, 'EUR')}</Typography>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Typography variant="body" color="#999">No hay gastos registrados</Typography>
          </Card>
        )}

        <Typography variant="h3" style={styles.sectionTitle}>Distribución de gastos</Typography>
        {chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Typography variant="body" color="#999" align="center">No hay gastos registrados aún</Typography>
          </Card>
        )}
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
    marginBottom: 20,
  },
  budgetCard: {
    backgroundColor: '#007AFF',
    padding: 24,
    marginBottom: 16,
  },
  budgetAmount: {
    marginVertical: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 0,
  },
  recentList: {
    marginBottom: 24,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  emptyCard: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
