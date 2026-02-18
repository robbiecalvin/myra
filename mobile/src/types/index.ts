export type Recommendation = {
  name: string;
  region: string;
  price: string;
  pairing: string;
  reason: string;
};

export type RecommendationResponse = {
  budget: number | null;
  style: string;
  occasion: string;
  recommendations: Recommendation[];
};

export type HistoryRecord = {
  id: string;
  query: string;
  response: RecommendationResponse;
  createdAt: string;
};

export type Screen = "splash" | "home" | "results" | "history" | "settings";
