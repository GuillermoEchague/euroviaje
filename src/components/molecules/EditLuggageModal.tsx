import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LuggageItem, LuggageType } from "../../domain/models";
import Typography from "../atoms/Typography";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import { X } from "lucide-react-native";

interface EditLuggageModalProps {
  visible: boolean;
  item?: LuggageItem | null;
  onClose: () => void;
  onSave: (item: Partial<LuggageItem>) => void;
  onDelete?: (id: number) => void;
}

const EditLuggageModal: React.FC<EditLuggageModalProps> = ({
  visible,
  item,
  onClose,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [type, setType] = useState<LuggageType>("clothing");
  const [cleanQuantity, setCleanQuantity] = useState("0");
  const [dirtyQuantity, setDirtyQuantity] = useState("0");
  const [hasItem, setHasItem] = useState(true);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setType(item.type);
      setCleanQuantity(item.cleanQuantity.toString());
      setDirtyQuantity(item.dirtyQuantity.toString());
      setHasItem(item.hasItem);
    } else {
      setName("");
      setType("clothing");
      setCleanQuantity("0");
      setDirtyQuantity("0");
      setHasItem(true);
    }
  }, [item, visible]);

  const handleSave = () => {
    onSave({
      name,
      type,
      cleanQuantity: parseInt(cleanQuantity, 10) || 0,
      dirtyQuantity: parseInt(dirtyQuantity, 10) || 0,
      hasItem,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Typography variant="h2">
                {item ? t("luggage.edit_item") : t("luggage.add_item")}
              </Typography>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Input
                label={t("luggage.name")}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Poleras"
              />

              <Typography variant="label" style={styles.label}>
                {t("luggage.type")}
              </Typography>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    type === "clothing" && styles.typeOptionSelected,
                  ]}
                  onPress={() => setType("clothing")}
                >
                  <Typography color={type === "clothing" ? "#FFF" : "#007AFF"}>
                    {t("luggage.clothing")}
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    type === "toiletry" && styles.typeOptionSelected,
                  ]}
                  onPress={() => setType("toiletry")}
                >
                  <Typography color={type === "toiletry" ? "#FFF" : "#007AFF"}>
                    {t("luggage.toiletry")}
                  </Typography>
                </TouchableOpacity>
              </View>

              {type === "clothing" ? (
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Input
                      label={t("luggage.clean_quantity")}
                      value={cleanQuantity}
                      onChangeText={setCleanQuantity}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Input
                      label={t("luggage.dirty_quantity")}
                      value={dirtyQuantity}
                      onChangeText={setDirtyQuantity}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.switchRow}>
                  <Typography variant="body">
                    {t("luggage.has_item")}
                  </Typography>
                  <Switch value={hasItem} onValueChange={setHasItem} />
                </View>
              )}

              <Button
                title={t("common.save")}
                onPress={handleSave}
                style={styles.saveButton}
              />

              {item && onDelete && (
                <Button
                  title={t("common.delete")}
                  onPress={() => {
                    onDelete(item.id);
                    onClose();
                  }}
                  variant="danger"
                  style={styles.deleteButton}
                />
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    width: "100%",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  typeOptionSelected: {
    backgroundColor: "#007AFF",
  },
  row: {
    flexDirection: "row",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 8,
  },
  saveButton: {
    marginTop: 10,
  },
  deleteButton: {
    marginTop: 12,
  },
});

export default EditLuggageModal;
