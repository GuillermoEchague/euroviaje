import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { LuggageItem } from "../../domain/models";
import Typography from "../atoms/Typography";
import Card from "./Card";
import {
  WashingMachine,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";

interface LuggageItemCardProps {
  item: LuggageItem;
  onEdit: (item: LuggageItem) => void;
  onWash?: (id: number) => void;
}

const LuggageItemCard: React.FC<LuggageItemCardProps> = ({
  item,
  onEdit,
  onWash,
}) => {
  const { t } = useTranslation();

  const isClothing = item.type === "clothing";
  const total = item.cleanQuantity + item.dirtyQuantity;
  const isLowClean =
    isClothing && total > 0 && item.cleanQuantity / total < 0.25;
  const isMissing = !isClothing && !item.hasItem;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Typography variant="label" style={styles.name}>
            {item.name}
          </Typography>
          {(isLowClean || isMissing) && (
            <AlertTriangle size={16} color="#FF3B30" style={styles.alertIcon} />
          )}
        </View>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.editButton}>
          <Edit2 size={18} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isClothing ? (
          <View style={styles.clothingStats}>
            <View style={styles.stat}>
              <Typography variant="caption" color="#666">
                {t("luggage.clean")}
              </Typography>
              <Typography
                variant="h3"
                color={isLowClean ? "#FF3B30" : "#4CD964"}
              >
                {item.cleanQuantity}
              </Typography>
            </View>
            <View style={styles.stat}>
              <Typography variant="caption" color="#666">
                {t("luggage.dirty")}
              </Typography>
              <Typography variant="h3" color="#FF9500">
                {item.dirtyQuantity}
              </Typography>
            </View>
            {item.dirtyQuantity > 0 && onWash && (
              <TouchableOpacity
                style={styles.washButton}
                onPress={() => onWash(item.id)}
              >
                <WashingMachine size={20} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.toiletryStatus}>
            {item.hasItem ? (
              <View style={styles.statusRow}>
                <CheckCircle2 size={20} color="#4CD964" />
                <Typography
                  variant="body"
                  color="#4CD964"
                  style={styles.statusText}
                >
                  Tengo
                </Typography>
              </View>
            ) : (
              <View style={styles.statusRow}>
                <XCircle size={20} color="#FF3B30" />
                <Typography
                  variant="body"
                  color="#FF3B30"
                  style={styles.statusText}
                >
                  No tengo
                </Typography>
              </View>
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  alertIcon: {
    marginLeft: 8,
  },
  editButton: {
    padding: 4,
  },
  content: {
    marginTop: 4,
  },
  clothingStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    marginRight: 24,
  },
  washButton: {
    marginLeft: "auto",
    backgroundColor: "#F2F2F7",
    padding: 8,
    borderRadius: 8,
  },
  toiletryStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default LuggageItemCard;
