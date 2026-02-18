import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SettingsScreenProps = {
  onBack: () => void;
  appVersion: string;
};

export const SettingsScreen = ({ onBack, appVersion }: SettingsScreenProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Privacy</Text>
        <Text style={styles.copy}>Requests and recommendation history stay on your device in Phase 1.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Data Usage</Text>
        <Text style={styles.copy}>The app sends your query text to Myra backend endpoints for intent parsing and recommendations.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Version</Text>
        <Text style={styles.copy}>{appVersion}</Text>
      </View>
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
  card: {
    marginTop: 12,
    backgroundColor: "#1c2430",
    borderColor: "#304052",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12
  },
  heading: {
    color: "#f1f5f9",
    fontWeight: "700"
  },
  copy: {
    marginTop: 6,
    color: "#c2ccd8",
    lineHeight: 20
  },
  button: {
    marginTop: 18,
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
