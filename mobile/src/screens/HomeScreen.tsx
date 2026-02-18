import type { Dispatch, SetStateAction } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";

type HomeScreenProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  onSubmit: () => Promise<void>;
  loading: boolean;
  error: string;
  onHistory: () => void;
  onSettings: () => void;
};

export const HomeScreen = ({ query, setQuery, onSubmit, loading, error, onHistory, onSettings }: HomeScreenProps) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={8}
    >
      <Text style={styles.title}>Ask for a wine recommendation</Text>
      <Text style={styles.subtitle}>Example: I need a $30 red wine for steak tonight.</Text>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Describe what you need"
        placeholderTextColor="#8290a3"
        multiline
      />
      {!!error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#12161b" /> : <Text style={styles.primaryText}>Get Recommendations</Text>}
      </TouchableOpacity>
      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onHistory}>
          <Text style={styles.secondaryText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onSettings}>
          <Text style={styles.secondaryText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 74,
    paddingHorizontal: 20,
    backgroundColor: "#12161b"
  },
  title: {
    color: "#f5f7fa",
    fontSize: 26,
    fontWeight: "700"
  },
  subtitle: {
    color: "#b8c2ce",
    marginTop: 10,
    lineHeight: 20
  },
  input: {
    marginTop: 18,
    minHeight: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#304052",
    padding: 14,
    color: "#f5f7fa",
    textAlignVertical: "top",
    backgroundColor: "#1c2430"
  },
  error: {
    color: "#ff9588",
    marginTop: 10
  },
  primaryButton: {
    marginTop: 18,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#d8e2ee"
  },
  primaryText: {
    color: "#12161b",
    fontWeight: "700"
  },
  footerActions: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#304052",
    alignItems: "center",
    paddingVertical: 12
  },
  secondaryText: {
    color: "#d8e2ee",
    fontWeight: "600"
  }
});
