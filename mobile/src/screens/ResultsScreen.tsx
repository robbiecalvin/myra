import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { RecommendationCard } from "../components/RecommendationCard";
import { openNearbyStores } from "../utils/location";
import type { RecommendationResponse } from "../types";

type ResultsScreenProps = {
  response: RecommendationResponse;
  onBack: () => void;
};

export const ResultsScreen = ({ response, onBack }: ResultsScreenProps) => {
  const [locationMessage, setLocationMessage] = useState<string>("");

  const onFindStores = async (): Promise<void> => {
    const granted = await openNearbyStores();
    setLocationMessage(granted ? "Opening nearby stores in Google Maps." : "Location permission was not granted.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top 3 Recommendations</Text>
      <Text style={styles.meta}>
        Style: {response.style} | Occasion: {response.occasion}
      </Text>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {response.recommendations.map((item) => (
          <RecommendationCard key={`${item.name}-${item.price}`} item={item} />
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.secondaryButton} onPress={onFindStores}>
        <Text style={styles.secondaryText}>Find Stores Near You</Text>
      </TouchableOpacity>
      {!!locationMessage ? <Text style={styles.locationText}>{locationMessage}</Text> : null}
      <TouchableOpacity style={styles.primaryButton} onPress={onBack}>
        <Text style={styles.primaryText}>New Search</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
    paddingHorizontal: 20,
    backgroundColor: "#12161b"
  },
  title: {
    color: "#f5f7fa",
    fontSize: 24,
    fontWeight: "700"
  },
  meta: {
    marginTop: 8,
    color: "#b5bfcb"
  },
  list: {
    marginTop: 14
  },
  listContent: {
    paddingBottom: 12
  },
  secondaryButton: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#304052",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center"
  },
  secondaryText: {
    color: "#d8e2ee",
    fontWeight: "600"
  },
  locationText: {
    color: "#b9c6d6",
    marginTop: 8
  },
  primaryButton: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#d8e2ee",
    marginBottom: 24
  },
  primaryText: {
    color: "#12161b",
    fontWeight: "700"
  }
});
