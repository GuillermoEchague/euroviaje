import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Wallet as WalletIcon,
  CreditCard,
  Banknote,
  Trash2,
  Edit2,
} from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";
import Typography from "../../../components/atoms/Typography";
import Card from "../../../components/molecules/Card";
import Button from "../../../components/atoms/Button";
import Input from "../../../components/atoms/Input";
import { RootState } from "../../../store";
import { formatCurrency } from "../../../utils/format";
import { Wallet, WalletType, Currency } from "../../../domain/models";
import { WalletRepository } from "../../../infrastructure/database/repositories/WalletRepository";
import { ExpenseRepository } from "../../../infrastructure/database/repositories/ExpenseRepository";
import {
  addWallet,
  updateWallet,
  removeWallet,
  setWallets,
} from "../../../store/slices/walletSlice";

export default function WalletsScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { wallets } = useSelector((state: RootState) => state.wallets);
  const { exchangeRate, usdExchangeRate } = useSelector(
    (state: RootState) => state.settings
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setBalance("");
    setType("cash");
    setCurrency("EUR");
    setEditingWallet(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setName(wallet.name);
    setBalance(wallet.balance.toString());
    setType(wallet.type);
    setCurrency(wallet.currency);
    setModalVisible(true);
  };

  const handleSaveWallet = async () => {
    if (!user || !name || !balance) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      if (editingWallet) {
        const updatedWallet: Wallet = {
          ...editingWallet,
          name,
          type,
          currency,
          balance: parseFloat(balance),
        };
        await WalletRepository.update(editingWallet.id, updatedWallet);
        dispatch(updateWallet(updatedWallet));
      } else {
        const newWallet: Omit<Wallet, "id"> = {
          userId: user.id,
          name,
          type,
          currency,
          balance: parseFloat(balance),
          initialExchangeRate: exchangeRate,
        };

        const id = await WalletRepository.create(newWallet);
        dispatch(addWallet({ ...newWallet, id }));
      }
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar la billetera");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWallet = async (wallet: Wallet) => {
    try {
      const expenseCount = await ExpenseRepository.countByWalletId(wallet.id);
      if (expenseCount > 0) {
        Alert.alert(
          "No se puede eliminar",
          "Esta billetera tiene gastos asociados. Elimina los gastos primero o edita la billetera."
        );
        return;
      }

      Alert.alert(
        "Eliminar billetera",
        "¿Estás seguro de que deseas eliminar esta billetera?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await WalletRepository.delete(wallet.id);
                dispatch(removeWallet(wallet.id));
              } catch (error) {
                console.error(error);
                Alert.alert("Error", "No se pudo eliminar la billetera");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error(error);
    }
  };

  const renderRightActions = (wallet: Wallet) => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#007AFF" }]}
          onPress={() => handleOpenEdit(wallet)}
        >
          <Edit2 size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#FF3B30" }]}
          onPress={() => handleDeleteWallet(wallet)}
        >
          <Trash2 size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const getIcon = (type: WalletType) => {
    switch (type) {
      case "cash":
        return <Banknote size={24} color="#FFFFFF" />;
      case "card":
      case "virtual_card":
      case "credit":
        return <CreditCard size={24} color="#FFFFFF" />;
      default:
        return <WalletIcon size={24} color="#FFFFFF" />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Typography variant="h1">{t("wallets.title")}</Typography>
        <Button
          title={t("common.add")}
          onPress={handleOpenAdd}
          style={styles.addButton}
          textStyle={{ fontSize: 14 }}
        />
      </View>

      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const bgColor =
            item.type === "cash"
              ? "#4CD964"
              : item.type === "credit"
              ? "#FF3B30"
              : "#007AFF";
          return (
            <Swipeable renderRightActions={() => renderRightActions(item)}>
              <Card
                style={[
                  styles.walletCard,
                  { borderLeftWidth: 6, borderLeftColor: bgColor },
                ]}
              >
                <View style={styles.walletInfo}>
                  <View
                    style={[styles.iconWrapper, { backgroundColor: bgColor }]}
                  >
                    {getIcon(item.type)}
                  </View>
                  <View style={styles.walletDetails}>
                    <Typography variant="h3">{item.name}</Typography>
                    <Typography variant="caption" color="#666">
                      {t(`wallets.${item.type}`)} • {item.currency}
                    </Typography>
                  </View>
                </View>
                <View style={styles.walletBalance}>
                  <Typography
                    variant="h3"
                    color={
                      item.type === "credit" && item.balance < 0
                        ? "#FF3B30"
                        : "#000"
                    }
                  >
                    {formatCurrency(item.balance, item.currency)}
                  </Typography>
                  <Typography variant="caption" color="#999">
                    {item.currency === "CLP"
                      ? formatCurrency(item.balance / exchangeRate, "EUR")
                      : item.currency === "EUR"
                      ? formatCurrency(item.balance * exchangeRate, "CLP")
                      : formatCurrency(
                          (item.balance / usdExchangeRate) * exchangeRate,
                          "CLP"
                        )}
                  </Typography>
                </View>
              </Card>
            </Swipeable>
          );
        }}
        ListEmptyComponent={
          <Typography
            variant="body"
            color="#999"
            align="center"
            style={{ marginTop: 40 }}
          >
            No tienes billeteras registradas
          </Typography>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: "90%" }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Typography variant="h2" style={styles.modalTitle}>
                  {editingWallet ? "Editar Billetera" : t("wallets.add_wallet")}
                </Typography>

                <Input
                  label={t("wallets.name")}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej. Efectivo Euros"
                />

                <Input
                  label={t("wallets.balance")}
                  value={balance}
                  onChangeText={setBalance}
                  placeholder="0.00"
                  keyboardType="numeric"
                />

                <Typography variant="label" style={{ marginBottom: 8 }}>
                  {t("wallets.type")}
                </Typography>
                <View style={styles.typeContainer}>
                  {(
                    ["cash", "card", "virtual_card", "credit"] as WalletType[]
                  ).map((t) => (
                    <Button
                      key={t}
                      title={t}
                      variant={type === t ? "primary" : "outline"}
                      onPress={() => setType(t)}
                      style={styles.typeButton}
                      textStyle={{ fontSize: 12 }}
                    />
                  ))}
                </View>

                <Typography variant="label" style={{ marginBottom: 8 }}>
                  Moneda
                </Typography>
                <View style={styles.typeContainer}>
                  {(["EUR", "USD", "CLP"] as Currency[]).map((c) => (
                    <Button
                      key={c}
                      title={c}
                      variant={currency === c ? "primary" : "outline"}
                      onPress={() => setCurrency(c)}
                      style={[styles.typeButton, { minWidth: "30%" }]}
                      textStyle={{ fontSize: 12 }}
                    />
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <Button
                    title={t("common.cancel")}
                    variant="outline"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalButton}
                  />
                  <Button
                    title={t("common.save")}
                    onPress={handleSaveWallet}
                    loading={loading}
                    style={styles.modalButton}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 12,
    marginVertical: 0,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  rightActions: {
    flexDirection: "row",
    width: 140,
  },
  actionButton: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  walletDetails: {
    marginLeft: 12,
  },
  walletBalance: {
    alignItems: "flex-end",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    marginBottom: 24,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  typeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 0,

    minWidth: "45%",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
