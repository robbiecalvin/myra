import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { loadHistory } from "../services/historyStorage";
import type { HistoryRecord } from "../types";

type HistoryScreenProps = {
  onBack: () => void;
};

export const HistoryScreen = ({ onBack }: HistoryScreenProps) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    void loadHistory().then(setRecords);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommendation History</Text>
      <ScrollView style={styles.list}>
        {records.length === 0 ? <Text style={styles.empty}>No saved recommendations yet.</Text> : null}
        {records.map((record) => (
          <View key={record.id} style={styles.card}>
            <Text style={styles.query}>{record.query}</Text>
            <Text style={styles.meta}>{new Date(record.createdAt).toLocaleString()}</Text>
            <Text style={styles.meta}>{record.response.recommendations[0]?.name ?? "No recommendation"}</Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={onBack}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#12161b",
    paddingTop: 64,
    paddingHorizontal: 20
  },
  title: {
    color: "#f5f7fa",
    fontSize: 24,
    fontWeight: "700"
  },
  list: {
    marginTop: 14
  },
  empty: {
    color: "#9eaab8"
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#304052",
    backgroundColor: "#1c2430",
    padding: 12,
    marginBottom: 10
  },
  query: {
    color: "#eff3f8",
    fontWeight: "600"
  },
  meta: {
    color: "#b5bfcb",
    marginTop: 5
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#d8e2ee"
  },
  buttonText: {
    color: "#12161b",
    fontWeight: "700"
  }
});
