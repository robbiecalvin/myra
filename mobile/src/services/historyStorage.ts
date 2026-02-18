import AsyncStorage from "@react-native-async-storage/async-storage";
import type { HistoryRecord } from "../types";

const HISTORY_KEY = "myra:history:v1";
const MAX_HISTORY_ITEMS = 25;

export const loadHistory = async (): Promise<HistoryRecord[]> => {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as HistoryRecord[];
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed;
};

export const saveHistoryRecord = async (entry: HistoryRecord): Promise<void> => {
  const existing = await loadHistory();
  const next = [entry, ...existing].slice(0, MAX_HISTORY_ITEMS);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
};
