import { View, Text, StyleSheet } from "react-native";
import type { Recommendation } from "../types";

type RecommendationCardProps = {
  item: Recommendation;
};

export const RecommendationCard = ({ item }: RecommendationCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.meta}>{item.region}</Text>
      <Text style={styles.meta}>{item.price}</Text>
      <Text style={styles.body}>Pairing: {item.pairing}</Text>
      <Text style={styles.body}>{item.reason}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1c2430",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2d3948",
    padding: 14,
    marginBottom: 12
  },
  title: {
    color: "#f5f7fa",
    fontSize: 17,
    fontWeight: "700"
  },
  meta: {
    color: "#c3ccd6",
    marginTop: 2
  },
  body: {
    color: "#d7dee5",
    marginTop: 8,
    lineHeight: 20
  }
});
