import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Modal, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Filter, Utensils, Train, Hotel, ShoppingCart, HeartPulse, Ticket, Package } from 'lucide-react-native';
import Typography from '../../../components/atoms/Typography';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import { RootState } from '../../../store';
import { formatCurrency, formatDate } from '../../../utils/format';
import { Expense } from '../../../domain/models';
import { ExpenseRepository } from '../../../infrastructure/database/repositories/ExpenseRepository';
import { WalletRepository } from '../../../infrastructure/database/repositories/WalletRepository';
import { addExpense } from '../../../store/slices/expenseSlice';
import { updateWalletBalance } from '../../../store/slices/walletSlice';

const CATEGORIES = [
  { id: 'food', icon: Utensils, color: '#FF9500' },
  { id: 'transport', icon: Train, color: '#5856D6' },
  { id: 'hotels', icon: Hotel, color: '#007AFF' },
  { id: 'supermarket', icon: ShoppingCart, color: '#4CD964' },
  { id: 'health', icon: HeartPulse, color: '#FF3B30' },
  { id: 'leisure', icon: Ticket, color: '#FF2D55' },
  { id: 'others', icon: Package, color: '#8E8E93' },
];

export default function ExpensesScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { expenses } = useSelector((state: RootState) => state.expenses);
  const { wallets } = useSelector((state: RootState) => state.wallets);
  const { exchangeRate } = useSelector((state: RootState) => state.settings);

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('others');
  const [walletId, setWalletId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filteredExpenses = useMemo(() => {
    if (!filterCategory) return expenses;
    return expenses.filter(e => e.category === filterCategory);
  }, [expenses, filterCategory]);

  const CategoryIcon = ({ categoryId, size = 20, color = '#666' }: { categoryId: string, size?: number, color?: string }) => {
    const cat = CATEGORIES.find(c => c.id === categoryId);
    if (!cat) return <Package size={size} color={color} />;
    const Icon = cat.icon;
    return <Icon size={size} color={color} />;
  };

  const handleAddExpense = async () => {
    if (!user || !title || !amount || !walletId) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const amountEur = parseFloat(amount);
    const selectedWallet = wallets.find(w => w.id === walletId);

    if (!selectedWallet) return;

    setLoading(true);
    try {
      const newExpense: Omit<Expense, 'id'> = {
        userId: user.id,
        walletId,
        title,
        amountEur,
        amountClp: amountEur * exchangeRate,
        category,
        exchangeRate,
        date: new Date().toISOString()
      };

      const id = await ExpenseRepository.create(newExpense);
      dispatch(addExpense({ ...newExpense, id }));

      // Update wallet balance
      const newBalance = selectedWallet.balanceEur - amountEur;
      await WalletRepository.updateBalance(walletId, newBalance);
      dispatch(updateWalletBalance({ id: walletId, balanceEur: newBalance }));

      setModalVisible(false);
      setTitle('');
      setAmount('');
      setCategory('others');
      setWalletId(null);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo registrar el gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Typography variant="h1">{t('expenses.title')}</Typography>
        <Button
          title={t('common.add')}
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
          textStyle={{ fontSize: 14 }}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterItem, !filterCategory && styles.filterItemActive]}
          onPress={() => setFilterCategory(null)}
        >
          <Typography variant="caption" color={!filterCategory ? '#fff' : '#666'}>Todos</Typography>
        </TouchableOpacity>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterItem, filterCategory === cat.id && styles.filterItemActive]}
            onPress={() => setFilterCategory(cat.id)}
          >
            <Typography variant="caption" color={filterCategory === cat.id ? '#fff' : '#666'}>
              {t(`categories.${cat.id}`)}
            </Typography>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.expenseCard}>
            <View style={styles.expenseIconContainer}>
              <CategoryIcon categoryId={item.category} color={CATEGORIES.find(c => c.id === item.category)?.color} />
            </View>
            <View style={styles.expenseInfo}>
              <Typography variant="h3">{item.title}</Typography>
              <Typography variant="caption" color="#666">
                {formatDate(item.date)} • {t(`categories.${item.category}`)}
              </Typography>
            </View>
            <View style={styles.expenseAmount}>
              <Typography variant="h3" color="#FF3B30">-{formatCurrency(item.amountEur, 'EUR')}</Typography>
              <Typography variant="caption" color="#999">-{formatCurrency(item.amountClp, 'CLP')}</Typography>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Typography variant="body" color="#999" align="center" style={{ marginTop: 40 }}>
            No hay gastos registrados
          </Typography>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Typography variant="h2" style={styles.modalTitle}>{t('expenses.add_expense')}</Typography>

              <Input
                label="Título"
                value={title}
                onChangeText={setTitle}
                placeholder="Ej. Almuerzo en Roma"
              />

              <Input
                label={t('expenses.amount') + ' (EUR)'}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
              />

              <Typography variant="label" style={{ marginBottom: 12 }}>{t('expenses.category')}</Typography>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      category === cat.id && { backgroundColor: cat.color, borderColor: cat.color }
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <cat.icon size={18} color={category === cat.id ? '#fff' : cat.color} />
                    <Typography
                      variant="caption"
                      style={{ marginTop: 4 }}
                      color={category === cat.id ? '#fff' : '#333'}
                    >
                      {t(`categories.${cat.id}`)}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>

              <Typography variant="label" style={{ marginBottom: 8 }}>{t('expenses.source')}</Typography>
              <View style={styles.walletSelectContainer}>
                {wallets.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.walletSelectItem, walletId === w.id && styles.walletSelectItemActive]}
                    onPress={() => setWalletId(w.id)}
                  >
                    <Typography variant="caption" color={walletId === w.id ? '#fff' : '#666'}>
                      {w.name} ({formatCurrency(w.balanceEur, 'EUR')})
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.modalButtons, { marginTop: 24 }]}>
                <Button
                  title={t('common.cancel')}
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                />
                <Button
                  title={t('common.save')}
                  onPress={handleAddExpense}
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 12,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 0,
  },
  filterBar: {
    maxHeight: 40,
    marginBottom: 12,
    paddingLeft: 24,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    marginRight: 8,
    height: 32,
  },
  filterItemActive: {
    backgroundColor: '#007AFF',
  },
  list: {
    padding: 24,
    paddingTop: 0,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseAmount: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    marginBottom: 24,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  walletSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  walletSelectItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  walletSelectItemActive: {
    backgroundColor: '#5856D6',
    borderColor: '#5856D6',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
