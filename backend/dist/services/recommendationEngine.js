import { wines } from "../data/wines.js";
const formatPrice = (price) => `$${price}`;
const scoreWine = (wine, intent) => {
    let score = 0;
    if (intent.style !== "any" && wine.style === intent.style) {
        score += 40;
    }
    if (intent.region !== "any" && wine.region === intent.region) {
        score += 25;
    }
    if (intent.occasion !== "general" && wine.occasionTags.includes(intent.occasion)) {
        score += 20;
    }
    if (intent.budget !== null) {
        if (wine.price <= intent.budget) {
            score += 30;
        }
        else {
            const overBy = wine.price - intent.budget;
            score -= Math.min(overBy * 2, 20);
        }
    }
    if (intent.style === "any") {
        score += 10;
    }
    return score;
};
const reasonForWine = (wine, intent) => {
    const reasons = [];
    if (intent.style !== "any" && wine.style === intent.style) {
        reasons.push(`${wine.style} style match`);
    }
    if (intent.region !== "any" && wine.region === intent.region) {
        reasons.push(`from requested region (${wine.region})`);
    }
    if (intent.occasion !== "general" && wine.occasionTags.includes(intent.occasion)) {
        reasons.push(`fits ${intent.occasion} occasion`);
    }
    if (intent.budget !== null && wine.price <= intent.budget) {
        reasons.push(`within $${intent.budget} budget`);
    }
    if (reasons.length === 0) {
        return "Closest overall fit based on your request.";
    }
    return `Matched on ${reasons.join(", ")}.`;
};
export const recommend = (intent) => {
    const ranked = [...wines]
        .map((wine) => ({ wine, score: scoreWine(wine, intent) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((entry) => ({
        name: entry.wine.name,
        region: entry.wine.region,
        price: formatPrice(entry.wine.price),
        pairing: entry.wine.pairing,
        reason: reasonForWine(entry.wine, intent)
    }));
    return {
        budget: intent.budget,
        style: intent.style,
        occasion: intent.occasion,
        recommendations: ranked
    };
};
