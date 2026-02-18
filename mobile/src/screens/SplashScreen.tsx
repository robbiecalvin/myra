import { View, Text, StyleSheet } from "react-native";

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Myra</Text>
      <Text style={styles.subtitle}>Pocket Sommelier</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: "#f5f7fa",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 1
  },
  subtitle: {
    color: "#b6c0cc",
    marginTop: 10,
    fontSize: 16
  }
});
