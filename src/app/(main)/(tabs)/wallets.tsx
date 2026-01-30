import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Modal, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Wallet as WalletIcon, CreditCard, Banknote } from 'lucide-react-native';
import Typography from '../../../components/atoms/Typography';
import Card from '../../../components/molecules/Card';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import { RootState } from '../../../store';
import { formatCurrency } from '../../../utils/format';
import { Wallet, WalletType } from '../../../domain/models';
import { WalletRepository } from '../../../infrastructure/database/repositories/WalletRepository';
import { addWallet, setWallets } from '../../../store/slices/walletSlice';

export default function WalletsScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { wallets } = useSelector((state: RootState) => state.wallets);
  const { exchangeRate } = useSelector((state: RootState) => state.settings);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<WalletType>('cash');
  const [loading, setLoading] = useState(false);

  const handleAddWallet = async () => {
    if (!user || !name || !balance) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const newWallet: Omit<Wallet, 'id'> = {
        userId: user.id,
        name,
        type,
        balanceEur: parseFloat(balance),
        initialExchangeRate: exchangeRate
      };

      const id = await WalletRepository.create(newWallet);
      dispatch(addWallet({ ...newWallet, id }));
      setModalVisible(false);
      setName('');
      setBalance('');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo crear la billetera');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: WalletType) => {
    switch (type) {
      case 'cash': return <Banknote size={24} color="#FFFFFF" />;
      case 'card':
      case 'virtual_card':
      case 'credit': return <CreditCard size={24} color="#FFFFFF" />;
      default: return <WalletIcon size={24} color="#FFFFFF" />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Typography variant="h1">{t('wallets.title')}</Typography>
        <Button
          title={t('common.add')}
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
          textStyle={{ fontSize: 14 }}
        />
      </View>

      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const bgColor = item.type === 'cash' ? '#4CD964' : (item.type === 'credit' ? '#FF3B30' : '#007AFF');
          return (
            <Card style={[styles.walletCard, { borderLeftWidth: 6, borderLeftColor: bgColor }]}>
              <View style={styles.walletInfo}>
                <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
                  {getIcon(item.type)}
                </View>
                <View style={styles.walletDetails}>
                  <Typography variant="h3">{item.name}</Typography>
                  <Typography variant="caption" color="#666">{t(`wallets.${item.type}`)}</Typography>
                </View>
              </View>
              <View style={styles.walletBalance}>
                <Typography variant="h3" color={item.type === 'credit' && item.balanceEur < 0 ? '#FF3B30' : '#000'}>
                  {formatCurrency(item.balanceEur, 'EUR')}
                </Typography>
                <Typography variant="caption" color="#999">{formatCurrency(item.balanceEur * exchangeRate, 'CLP')}</Typography>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Typography variant="body" color="#999" align="center" style={{ marginTop: 40 }}>
            No tienes billeteras registradas
          </Typography>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography variant="h2" style={styles.modalTitle}>{t('wallets.add_wallet')}</Typography>

            <Input
              label={t('wallets.name')}
              value={name}
              onChangeText={setName}
              placeholder="Ej. Efectivo Euros"
            />

            <Input
              label={t('wallets.balance') + ' (EUR)'}
              value={balance}
              onChangeText={setBalance}
              placeholder="0.00"
              keyboardType="numeric"
            />

            <Typography variant="label" style={{ marginBottom: 8 }}>{t('wallets.type')}</Typography>
            <View style={styles.typeContainer}>
              {(['cash', 'card', 'virtual_card', 'credit'] as WalletType[]).map((t) => (
                <Button
                  key={t}
                  title={t}
                  variant={type === t ? 'primary' : 'outline'}
                  onPress={() => setType(t)}
                  style={styles.typeButton}
                  textStyle={{ fontSize: 12 }}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title={t('common.cancel')}
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title={t('common.save')}
                onPress={handleAddWallet}
                loading={loading}
                style={styles.modalButton}
              />
            </View>
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
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 0,
  },
  list: {
    padding: 24,
    paddingTop: 0,
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 12,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletDetails: {
    marginLeft: 12,
  },
  walletBalance: {
    alignItems: 'flex-end',
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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  typeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 0,
    flex: 1,
    minWidth: '45%',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
