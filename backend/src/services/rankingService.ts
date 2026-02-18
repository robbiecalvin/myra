import type { RankedStore } from "../types/phase2.js";

type RankableStore = RankedStore;

const tierPriority = (tier: string): number => (tier === "premium" ? 0 : 1);

export const sortStoresForPlacement = (stores: RankableStore[]): RankableStore[] => {
  return [...stores].sort((a, b) => {
    const tierDelta = tierPriority(a.subscriptionTier) - tierPriority(b.subscriptionTier);
    if (tierDelta !== 0) {
      return tierDelta;
    }

    const distanceDelta = a.distanceKm - b.distanceKm;
    if (distanceDelta !== 0) {
      return distanceDelta;
    }

    return a.name.localeCompare(b.name);
  });
};
