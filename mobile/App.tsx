import { useEffect, useMemo, useState } from "react";
import { Animated, Easing } from "react-native";
import { StatusBar } from "expo-status-bar";
import { HomeScreen } from "./src/screens/HomeScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { ResultsScreen } from "./src/screens/ResultsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SplashScreen } from "./src/screens/SplashScreen";
import { saveHistoryRecord } from "./src/services/historyStorage";
import { getRecommendations } from "./src/services/api";
import type { HistoryRecord, RecommendationResponse, Screen } from "./src/types";

const APP_VERSION = "v0.1";

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const opacity = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    const timer = setTimeout(() => setScreen("home"), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic)
    }).start();
  }, [opacity, screen]);

  const navigate = (next: Screen): void => {
    opacity.setValue(0.2);
    setScreen(next);
  };

  const onSubmit = async (): Promise<void> => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Enter a wine request before searching.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const nextResponse = await getRecommendations(trimmed);
      setResponse(nextResponse);
      const historyRecord: HistoryRecord = {
        id: `${Date.now()}`,
        query: trimmed,
        response: nextResponse,
        createdAt: new Date().toISOString()
      };
      await saveHistoryRecord(historyRecord);
      navigate("results");
    } catch (requestError: unknown) {
      const message = requestError instanceof Error ? requestError.message : "Request failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={{ flex: 1, opacity, backgroundColor: "#12161b" }}>
      <StatusBar style="light" />
      {screen === "splash" ? <SplashScreen /> : null}
      {screen === "home" ? (
        <HomeScreen
          query={query}
          setQuery={setQuery}
          onSubmit={onSubmit}
          loading={loading}
          error={error}
          onHistory={() => navigate("history")}
          onSettings={() => navigate("settings")}
        />
      ) : null}
      {screen === "results" && response ? (
        <ResultsScreen response={response} onBack={() => navigate("home")} />
      ) : null}
      {screen === "history" ? <HistoryScreen onBack={() => navigate("home")} /> : null}
      {screen === "settings" ? <SettingsScreen onBack={() => navigate("home")} appVersion={APP_VERSION} /> : null}
    </Animated.View>
  );
}
