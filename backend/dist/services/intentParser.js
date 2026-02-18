const MAX_QUERY_LENGTH = 500;
const stylePatterns = [
    { style: "sparkling", pattern: /\b(sparkling|prosecco|champagne|bubbly)\b/i },
    { style: "rose", pattern: /\b(rose|rosé)\b/i },
    { style: "white", pattern: /\b(white|chardonnay|riesling|pinot grigio|sauvignon blanc)\b/i },
    { style: "red", pattern: /\b(red|cabernet|pinot noir|merlot|syrah|malbec)\b/i }
];
const occasionPatterns = [
    { occasion: "dinner", pattern: /\b(dinner|tonight|meal|steak|pasta)\b/i },
    { occasion: "celebration", pattern: /\b(celebration|birthday|anniversary|toast)\b/i },
    { occasion: "party", pattern: /\b(party|friends|gathering)\b/i },
    { occasion: "gift", pattern: /\b(gift|present)\b/i },
    { occasion: "weeknight", pattern: /\b(weeknight|everyday|casual)\b/i }
];
const regionPatterns = [
    { region: "France", pattern: /\b(french|france|bordeaux|burgundy)\b/i },
    { region: "Italy", pattern: /\b(italian|italy|tuscany|chianti)\b/i },
    { region: "Spain", pattern: /\b(spanish|spain|rioja)\b/i },
    { region: "United States", pattern: /\b(california|napa|sonoma|usa|american)\b/i },
    { region: "Germany", pattern: /\b(germany|german|mosel)\b/i },
    { region: "New Zealand", pattern: /\b(new zealand|nz|marlborough)\b/i }
];
export const sanitizeInput = (input) => {
    if (typeof input !== "string") {
        throw new Error("Input must be a string.");
    }
    const normalized = input.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
    if (!normalized) {
        throw new Error("Input cannot be empty.");
    }
    if (normalized.length > MAX_QUERY_LENGTH) {
        throw new Error(`Input cannot exceed ${MAX_QUERY_LENGTH} characters.`);
    }
    return normalized;
};
const parseBudget = (input) => {
    const moneyMatch = input.match(/\$\s*(\d{1,3})/);
    if (moneyMatch) {
        return Number.parseInt(moneyMatch[1], 10);
    }
    const underMatch = input.match(/\b(under|below|less than|max)\s+(\d{1,3})\b/i);
    if (underMatch) {
        return Number.parseInt(underMatch[2], 10);
    }
    return null;
};
const parseStyle = (input) => {
    for (const candidate of stylePatterns) {
        if (candidate.pattern.test(input)) {
            return candidate.style;
        }
    }
    return "any";
};
const parseOccasion = (input) => {
    for (const candidate of occasionPatterns) {
        if (candidate.pattern.test(input)) {
            return candidate.occasion;
        }
    }
    return "general";
};
const parseRegion = (input) => {
    for (const candidate of regionPatterns) {
        if (candidate.pattern.test(input)) {
            return candidate.region;
        }
    }
    return "any";
};
export const parseIntent = (input) => {
    return {
        budget: parseBudget(input),
        style: parseStyle(input),
        region: parseRegion(input),
        occasion: parseOccasion(input)
    };
};
