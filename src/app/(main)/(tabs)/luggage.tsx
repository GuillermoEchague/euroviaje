import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import Typography from "../../../components/atoms/Typography";
import Card from "../../../components/molecules/Card";
import LuggageItemCard from "../../../components/molecules/LuggageItemCard";
import EditLuggageModal from "../../../components/molecules/EditLuggageModal";
import { RootState } from "../../../store";
import { LuggageRepository } from "../../../infrastructure/database/repositories/LuggageRepository";
import {
  setLuggageItems,
  addLuggageItem,
  updateLuggageItem,
  removeLuggageItem,
  washCategory,
  washAllItems,
} from "../../../store/slices/luggageSlice";
import { LuggageItem } from "../../../domain/models";

export default function LuggageScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.luggage);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LuggageItem | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const data = await LuggageRepository.getAllByUserId(user.id);
      dispatch(setLuggageItems(data));
    } catch (error) {
      console.error("Error loading luggage data:", error);
    }
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setModalVisible(true);
  };

  const handleEditItem = (item: LuggageItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleSaveItem = async (itemData: Partial<LuggageItem>) => {
    if (!user) return;

    try {
      if (selectedItem) {
        await LuggageRepository.update(selectedItem.id, itemData);
        dispatch(
          updateLuggageItem({ ...selectedItem, ...itemData } as LuggageItem)
        );
      } else {
        const newItem = {
          userId: user.id,
          name: itemData.name || "",
          type: itemData.type || "clothing",
          cleanQuantity: itemData.cleanQuantity || 0,
          dirtyQuantity: itemData.dirtyQuantity || 0,
          hasItem: itemData.hasItem ?? true,
        };
        const id = await LuggageRepository.create(newItem);
        dispatch(addLuggageItem({ ...newItem, id }));
      }
    } catch (error) {
      console.error("Error saving luggage item:", error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await LuggageRepository.delete(id);
      dispatch(removeLuggageItem(id));
    } catch (error) {
      console.error("Error deleting luggage item:", error);
    }
  };

  const handleWashItem = async (id: number) => {
    if (!user) return;
    try {
      await LuggageRepository.washByCategory(user.id, id);
      dispatch(washCategory(id));
    } catch (error) {
      console.error("Error washing category:", error);
    }
  };

  const handleWashAll = async () => {
    if (!user) return;
    try {
      await LuggageRepository.washAll(user.id);
      dispatch(washAllItems());
    } catch (error) {
      console.error("Error washing all items:", error);
    }
  };

  const clothingItems = items.filter((i) => i.type === "clothing");
  const toiletryItems = items.filter((i) => i.type === "toiletry");

  const summary = useMemo(() => {
    const toWash = items.filter(
      (i) =>
        i.type === "clothing" &&
        i.cleanQuantity + i.dirtyQuantity > 0 &&
        i.cleanQuantity / (i.cleanQuantity + i.dirtyQuantity) < 0.25
    );
    const toBuy = items.filter((i) => i.type === "toiletry" && !i.hasItem);

    return { toWash, toBuy };
  }, [items]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Typography variant="h1">{t("luggage.title")}</Typography>
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {(summary.toWash.length > 0 || summary.toBuy.length > 0) && (
          <Card style={styles.summaryCard}>
            <Typography variant="h3" style={{ marginBottom: 12 }}>
              {t("luggage.summary")}
            </Typography>

            {summary.toWash.length > 0 && (
              <View style={styles.alertSection}>
                <Typography variant="label" color="#FF3B30">
                  {t("luggage.to_wash")}:
                </Typography>
                <Typography variant="body" color="#666">
                  {summary.toWash.map((i) => i.name).join(", ")}
                </Typography>
              </View>
            )}

            {summary.toBuy.length > 0 && (
              <View style={[styles.alertSection, { marginTop: 8 }]}>
                <Typography variant="label" color="#FF3B30">
                  {t("luggage.to_buy")}:
                </Typography>
                <Typography variant="body" color="#666">
                  {summary.toBuy.map((i) => i.name).join(", ")}
                </Typography>
              </View>
            )}
          </Card>
        )}

        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>
            {t("luggage.clothing")}
          </Typography>
          {clothingItems.some((i) => i.dirtyQuantity > 0) && (
            <TouchableOpacity
              style={styles.washAllButton}
              onPress={handleWashAll}
            >
              <Typography variant="caption" color="#007AFF" style={{ fontWeight: '600' }}>
                {t("luggage.wash_all")}
              </Typography>
            </TouchableOpacity>
          )}
        </View>
        {clothingItems.map((item) => (
          <LuggageItemCard
            key={item.id}
            item={item}
            onEdit={handleEditItem}
            onWash={handleWashItem}
          />
        ))}

        <Typography variant="h3" style={styles.sectionTitle}>
          {t("luggage.toiletry")}
        </Typography>
        {toiletryItems.map((item) => (
          <LuggageItemCard key={item.id} item={item} onEdit={handleEditItem} />
        ))}
      </ScrollView>

      <EditLuggageModal
        visible={modalVisible}
        item={selectedItem}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  washAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#E5E5EA",
    borderRadius: 6,
    marginBottom: 12,
  },
  summaryCard: {
    padding: 20,
    backgroundColor: "#FFF5F5",
    borderColor: "#FFD6D6",
    borderWidth: 1,
    marginBottom: 20,
  },
  alertSection: {
    flexDirection: "column",
  },
});
