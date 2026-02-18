import type { RecommendationResponse } from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiError = {
  message: string;
};

export const getRecommendations = async (input: string): Promise<RecommendationResponse> => {
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
