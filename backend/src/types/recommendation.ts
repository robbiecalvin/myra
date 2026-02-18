export type WineRecord = {
  name: string;
  region: string;
  style: string;
  price: number;
  pairing: string;
  occasionTags: string[];
};

export type ParsedIntent = {
  budget: number | null;
  style: string;
  region: string;
  occasion: string;
};

export type RecommendationResponse = {
  budget: number | null;
  style: string;
  occasion: string;
  recommendations: Array<{
    name: string;
    region: string;
    price: string;
    pairing: string;
    reason: string;
  }>;
};
