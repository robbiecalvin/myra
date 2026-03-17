import type { RecommendationResponse } from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? (__DEV__ ? "http://localhost:4000" : "");

type ApiError = {
  message: string;
};

export const getRecommendations = async (input: string): Promise<RecommendationResponse> => {
  if (!API_BASE_URL) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL. Set it before creating a production build.");
  }

  const response = await fetch(`${API_BASE_URL}/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ input })
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(payload?.message ?? "Failed to fetch recommendations.");
  }

  return (await response.json()) as RecommendationResponse;
};
