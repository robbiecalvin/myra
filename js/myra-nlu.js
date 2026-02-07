(() => {
  "use strict";

  function safeText(v) {
    return String(v || "").trim();
  }

  function normalize(text) {
    return safeText(text)
      .toLowerCase()
      // replace emoji + punctuation with spaces
      .replace(/[^\p{L}\p{N}\s%.-]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function words(text) {
    const n = normalize(text);
    return n ? n.split(" ") : [];
  }

  function hasAny(text, needles) {
    const t = ` ${normalize(text)} `;
    for (const n of needles) {
      const nn = normalize(n);
      if (!nn) continue;
      if (t.includes(` ${nn} `)) return true;
    }
    return false;
  }

  // Token-aware "contains" for multi-word entities, with light normalization.
  function containsEntity(text, entity) {
    const t = ` ${normalize(text)} `;
    const e = ` ${normalize(entity)} `;
    return t.includes(e);
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function levenshtein(a, b) {
    const s = normalize(a);
    const t = normalize(b);
    if (!s || !t) return Math.max(s.length, t.length);
    if (s === t) return 0;
    const m = s.length;
    const n = t.length;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= n; j++) {
        const tmp = dp[j];
        const cost = s[i - 1] === t[j - 1] ? 0 : 1;
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
        prev = tmp;
      }
    }
    return dp[n];
  }

  function similarity(a, b) {
    // 1.0 = identical, 0.0 = totally different
    const aa = normalize(a);
    const bb = normalize(b);
    if (!aa || !bb) return 0;
    const d = levenshtein(aa, bb);
    return 1 - d / Math.max(aa.length, bb.length);
  }

  function bestMatch(text, candidates, { minScore = 0.78 } = {}) {
    const t = normalize(text);
    if (!t) return null;

    // 1) Exact contains wins (multi-word safe).
    for (const c of candidates) {
      if (!c) continue;
      if (containsEntity(t, c)) return { value: c, score: 1.0, method: "contains" };
    }

    // 2) Fuzzy: compare candidate against sliding windows.
    const toks = words(t);
    const joined = toks.join(" ");
    let best = { value: null, score: 0, method: "fuzzy" };

    for (const c of candidates) {
      if (!c) continue;
      const cc = normalize(c);
      if (!cc) continue;

      // Fast path: compare whole query to entity.
      const s0 = similarity(joined, cc);
      if (s0 > best.score) best = { value: c, score: s0, method: "fuzzy_full" };

      const cLen = cc.split(" ").length;
      const winMin = Math.max(1, Math.min(cLen + 1, toks.length));
      const winMax = Math.min(toks.length, Math.max(1, cLen + 2));

      for (let win = winMin; win <= winMax; win++) {
        for (let i = 0; i + win <= toks.length; i++) {
          const slice = toks.slice(i, i + win).join(" ");
          const s1 = similarity(slice, cc);
          if (s1 > best.score) best = { value: c, score: s1, method: "fuzzy_window" };
        }
      }
    }

    if (!best.value || best.score < minScore) return null;
    return best;
  }

  function findAllMatches(text, candidates, { minScore = 0.78, limit = 3 } = {}) {
    const t = normalize(text);
    if (!t) return [];
    const scored = [];
    for (const c of candidates) {
      if (!c) continue;
      if (containsEntity(t, c)) {
        scored.push({ value: c, score: 1.0, method: "contains" });
        continue;
      }
      const s = similarity(t, c);
      if (s >= minScore) scored.push({ value: c, score: s, method: "fuzzy_full" });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  function parsePriceTier(text, priceWordmap) {
    const t = normalize(text);
    if (!t) return null;

    // Prefer wordmap-driven phrases so expanding `words.json` automatically improves parsing.
    const hasPhrase = list => {
      if (!Array.isArray(list) || !list.length) return false;
      for (const p of list) {
        if (!p) continue;
        if (containsEntity(t, p)) return true;
      }
      return false;
    };

    if (priceWordmap && typeof priceWordmap === "object") {
      if (hasPhrase(priceWordmap.budget)) return "budget";
      if (hasPhrase(priceWordmap.mid)) return "mid";
      if (hasPhrase(priceWordmap.premium)) return "premium";
      if (hasPhrase(priceWordmap.highend)) return "highend";
    }

    // Safety fallback (keeps behavior even if wordmap is missing).
    if (/\b(budget|cheap|cheaper|cheapest|inexpensive|affordable|wallet friendly|wallet-friendly|good value|value|deal|bargain)\b/.test(t)) return "budget";
    if (/\bmid( range)?\b|\bmiddle\b|\bmoderate\b|\breasonable\b|\bstandard\b|\bregular price\b/.test(t)) return "mid";
    if (/\bpremium\b|\bnice bottle\b|\ba step up\b|\bstep up\b|\btreat\b/.test(t)) return "premium";
    if (/\b(high end|high-end|top shelf|top-shelf|luxury|splurge|go big|money is no object|no budget)\b/.test(t)) return "highend";
    return null;
  }

  function parsePriceAmount(text) {
    const t = normalize(text);
    if (!t) return null;

    function parseNumberWordsUpTo300(input) {
      const raw = normalize(input)
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!raw) return [];

      const ones = {
        zero: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
        eleven: 11,
        twelve: 12,
        thirteen: 13,
        fourteen: 14,
        fifteen: 15,
        sixteen: 16,
        seventeen: 17,
        eighteen: 18,
        nineteen: 19,
        a: 1, // "a hundred"
      };
      const tens = {
        twenty: 20,
        thirty: 30,
        forty: 40,
        fifty: 50,
        sixty: 60,
        seventy: 70,
        eighty: 80,
        ninety: 90,
      };

      const out = [];
      const toks = raw.split(" ").filter(Boolean);

      // Very small, purpose-built parser for common price speech patterns:
      // "twenty", "twenty five", "one hundred", "one hundred twenty five", "a hundred".
      for (let i = 0; i < toks.length; i++) {
        let j = i;

        let total = 0;
        let consumed = 0;

        // optional leading "about/around" handled elsewhere; just parse numeric words.
        const w0 = toks[j];

        if (w0 in ones) {
          total = ones[w0];
          consumed = 1;
          j++;
          if (toks[j] === "hundred") {
            total *= 100;
            consumed++;
            j++;
            // optional tens/ones after hundred
            const w1 = toks[j];
            if (w1 in tens) {
              total += tens[w1];
              consumed++;
              j++;
              const w2 = toks[j];
              if (w2 in ones && ones[w2] < 10) {
                total += ones[w2];
                consumed++;
                j++;
              }
            } else if (w1 in ones && ones[w1] < 10) {
              total += ones[w1];
              consumed++;
              j++;
            }
          } else if (toks[j] in tens) {
            // "one thirty" is uncommon; don't treat it as 31. Stop here.
          } else if (toks[j] in ones && total < 20) {
            // "ten five" isn't a thing; stop.
          }
        } else if (w0 in tens) {
          total = tens[w0];
          consumed = 1;
          j++;
          const w1 = toks[j];
          if (w1 in ones && ones[w1] < 10) {
            total += ones[w1];
            consumed++;
            j++;
          }
        } else {
          continue;
        }

        if (consumed && Number.isFinite(total) && total >= 0 && total <= 300) {
          out.push({ value: total, start: i, end: i + consumed });
          i = i + consumed - 1;
        }
      }

      return out.map(x => x.value);
    }

    // Support: "$30", "30 dollars", "30 bucks", "30ish"
    const nums = [];
    const re = /(?:\$\s*)?(\d{1,4})(?:\.(\d{1,2}))?\s*(?:usd|cad|dollars?|bucks?)?(?:\s*ish)?/g;
    for (;;) {
      const m = re.exec(t);
      if (!m) break;
      const n = Number(m[2] ? `${m[1]}.${m[2]}` : m[1]);
      if (Number.isFinite(n)) nums.push(n);
    }
    if (!nums.length) {
      // Spoken amounts without digits: "under thirty", "around fifty", "a hundred bucks"
      nums.push(...parseNumberWordsUpTo300(t));
    }
    if (!nums.length) return null;

    // Basic intent signals.
    const hasNoMoreThan = /\b(no more than|not more than)\b/.test(t);
    const hasUnder = hasNoMoreThan || /\b(under|less than|below|up to|at most|max|maximum|no more than|not more than)\b/.test(t);
    const hasOver = !hasNoMoreThan && /\b(over|more than|at least|min|minimum)\b/.test(t);
    const hasAround = /\b(around|about|roughly|approximately)\b/.test(t);
    const hasExact = /\b(exactly|precisely)\b/.test(t);
    const hasBetween =
      (/\bbetween\b/.test(t) && /\bto\b/.test(t)) ||
      (/\bbetween\b/.test(t) && /\band\b/.test(t)) ||
      (/\bfrom\b/.test(t) && /\bto\b/.test(t));
    const hasHyphenRange = /\b\d{1,4}\s*-\s*\d{1,4}\b/.test(t);

    if (hasBetween && nums.length >= 2) {
      const lo = Math.min(nums[0], nums[1]);
      const hi = Math.max(nums[0], nums[1]);
      return { priceMin: lo, priceMax: hi };
    }

    if (hasHyphenRange && nums.length >= 2) {
      const lo = Math.min(nums[0], nums[1]);
      const hi = Math.max(nums[0], nums[1]);
      return { priceMin: lo, priceMax: hi };
    }

    const n = nums[0];
    if (hasUnder) return { priceMax: n };
    if (hasOver) return { priceMin: n };
    if (hasExact) return { priceTarget: n };
    if (hasAround) return { priceTarget: n };

    // Default: treat a single number as a soft max (most users mean "around/under").
    return { priceMax: n };
  }

  function parseDryness(text) {
    const t = normalize(text);
    if (!t) return null;
    if (/\b(bone dry|very dry|super dry)\b/.test(t)) return 1;
    if (/\bnot too sweet\b|\bnot sweet\b/.test(t)) return 2;
    if (/\bdry\b/.test(t)) return 2;
    if (/\bsemi[- ]sweet\b|\boff[- ]dry\b/.test(t)) return 4;
    if (/\bsweet\b/.test(t)) return 5;
    return null;
  }

  function parseBody(text) {
    const t = normalize(text);
    if (!t) return null;
    if (/\b(light-bodied|light body|light)\b/.test(t)) return 2;
    if (/\b(medium-bodied|medium body|medium)\b/.test(t)) return 3;
    if (/\b(full-bodied|full body|big)\b/.test(t)) return 5;
    return null;
  }

  function wineCategoryFromText(text) {
    const t = normalize(text);
    if (!t) return null;
    if (/\b(sparkling|bubbly|champagne)\b/.test(t)) return "Sparkling Wine";
    if (/\bros(é|e)\b/.test(t)) return "Rose Wine";
    if (/\bred\b/.test(t)) return "Red Wine";
    if (/\bwhite\b/.test(t)) return "White Wine";
    return null;
  }

  function beerAbvRange(text) {
    const t = normalize(text);
    if (!t) return null;
    if (/\b(low abv|low)\b/.test(t)) return "low";
    if (/\bstandard\b/.test(t)) return "standard";
    if (/\bstrong\b/.test(t)) return "strong";
    if (/\b(dangerous|imperial|double ipa)\b/.test(t)) return "dangerous";
    const m = t.match(/(\d+(\.\d+)?)\s*%/);
    if (!m) return null;
    const abv = Number(m[1]);
    if (!Number.isFinite(abv)) return null;
    if (abv < 4.5) return "low";
    if (abv <= 6.0) return "standard";
    if (abv <= 7.5) return "strong";
    return "dangerous";
  }

  function parseWine(text, catalog) {
    const raw = safeText(text);
    const out = {
      statePatch: {},
      clarifications: [],
    };
    if (!raw) return out;

    // Region preference keywords.
    {
      const t = normalize(raw);
      if (/\b(europe|european)\b/.test(t)) out.statePatch.europePreferred = true;
    }

    // Wordmap category aliases (e.g. "rosay" -> "Rose Wine").
    const wm = catalog?.wordmap || null;
    if (wm?.wine?.category_aliases) {
      const n = normalize(raw);
      for (const [k, v] of Object.entries(wm.wine.category_aliases)) {
        if (!k) continue;
        if (containsEntity(n, k)) {
          out.statePatch.category = v;
          break;
        }
      }
    }

    // Wordmap country aliases (e.g. "burgundy" -> "France").
    if (wm?.wine?.country_aliases) {
      const n = normalize(raw);
      for (const [k, v] of Object.entries(wm.wine.country_aliases)) {
        if (!k) continue;
        if (containsEntity(n, k)) {
          out.statePatch.country = v;
          break;
        }
      }
    }

    out.statePatch.category = out.statePatch.category || wineCategoryFromText(raw);
    out.statePatch.price = parsePriceTier(raw, wm?.global?.price_intent_words || null);
    const amt = parsePriceAmount(raw);
    if (amt) Object.assign(out.statePatch, amt);
    out.statePatch.sweetness = parseDryness(raw);
    out.statePatch.body = parseBody(raw);

    if (catalog?.buyerEvents?.length) {
      const m = bestMatch(raw, catalog.buyerEvents, { minScore: 0.76 });
      if (m) out.statePatch.occasion = m.value;
    }

    // Explicit structure words win: "high acidity", "medium tannin", etc.
    const t = normalize(raw);
    if (/\bhigh acidity\b|\bbright\b|\bzippy\b|\bcrisp\b/.test(t)) out.statePatch.acidity = "high";
    else if (/\bmedium acidity\b|\bbalanced acidity\b/.test(t)) out.statePatch.acidity = "medium";

    if (/\bhigh tannin\b|\bgrippy\b|\bastringent\b/.test(t)) out.statePatch.tannin = "high";
    else if (/\bmedium tannin\b/.test(t)) out.statePatch.tannin = "medium";
    else if (/\blow tannin\b|\bsoft tannin\b|\bsilky\b/.test(t)) out.statePatch.tannin = "low";

    if (catalog?.grapes?.length) {
      const m = bestMatch(raw, catalog.grapes, { minScore: 0.76 });
      if (m) out.statePatch.grape = m.value;
    }

    if (catalog?.countries?.length) {
      const m = bestMatch(raw, catalog.countries, { minScore: 0.78 });
      if (m) out.statePatch.country = m.value;
    }

    // Exclusions (negated entities): "not France", "no chardonnay", "without oak".
    const excludes = {};
    if (catalog?.countries?.length) {
      const xs = findNegatedEntities(raw, catalog.countries);
      if (xs.length) excludes.countries = xs;
    }
    if (catalog?.grapes?.length) {
      const xs = findNegatedEntities(raw, catalog.grapes);
      if (xs.length) excludes.grapes = xs;
    }
    {
      const cats = ["Red Wine", "White Wine", "Rose Wine", "Sparkling Wine"];
      const xs = findNegatedEntities(raw, cats);
      if (xs.length) excludes.categories = xs;
    }
    if (catalog?.flavors?.length) {
      const xs = findNegatedEntities(raw, catalog.flavors);
      if (xs.length) excludes.flavors = xs;
    }
    if (Object.keys(excludes).length) out.statePatch.excludes = excludes;

    if (catalog?.flavors?.length) {
      const hits = [];
      for (const f of catalog.flavors) {
        if (!f) continue;
        if (containsEntity(raw, f)) hits.push(f);
      }

      if (!hits.length) {
        // Fuzzy: pick best 3 distinct flavor matches.
        const scored = [];
        for (const f of catalog.flavors) {
          const m = bestMatch(raw, [f], { minScore: 0.76 });
          if (m) scored.push({ value: m.value, score: m.score });
        }
        scored.sort((a, b) => b.score - a.score);
        for (const s of scored) {
          if (hits.length >= 3) break;
          if (!hits.includes(s.value)) hits.push(s.value);
        }
      }

      if (hits.length) out.statePatch.flavors = hits.slice(0, 3);
    }

    if (catalog?.foodsByType) {
      for (const [foodType, foods] of Object.entries(catalog.foodsByType)) {
        const m = bestMatch(raw, foods, { minScore: 0.78 });
        if (!m) continue;
        out.statePatch.withFood = "yes";
        out.statePatch.foodType = foodType;
        out.statePatch.foodChoice = m.value;
        break;
      }
    }

    // If they mention a wine category, but we don't know which grape, offer options.
    if (catalog?.grapes?.length && out.statePatch.category && !out.statePatch.grape) {
      const maybe = findAllMatches(raw, catalog.grapes, { minScore: 0.70, limit: 3 });
      if (maybe.length) {
        out.clarifications.push({
          type: "grape",
          question: "Which type did you mean?",
          options: maybe.map(x => x.value),
        });
      }
    }

    return out;
  }

  function parseBeer(text, catalog) {
    const raw = safeText(text);
    const out = { statePatch: {}, clarifications: [] };
    if (!raw) return out;

    {
      const excludes = {};
      if (catalog?.categories?.length) {
        const xs = findNegatedEntities(raw, catalog.categories);
        if (xs.length) excludes.categories = xs;
      }
      if (catalog?.styles?.length) {
        const xs = findNegatedEntities(raw, catalog.styles);
        if (xs.length) excludes.styles = xs;
      }
      if (catalog?.breweries?.length) {
        const xs = findNegatedEntities(raw, catalog.breweries);
        if (xs.length) excludes.breweries = xs;
      }
      if (Object.keys(excludes).length) out.statePatch.excludes = excludes;
    }

    if (catalog?.categories?.length) {
      const m = bestMatch(raw, catalog.categories, { minScore: 0.78 });
      if (m) out.statePatch.category = m.value;
    }

    if (catalog?.styles?.length) {
      const m = bestMatch(raw, catalog.styles, { minScore: 0.78 });
      if (m) out.statePatch.style = m.value;
    }

    out.statePatch.abvRange = beerAbvRange(raw);

    if (catalog?.breweries?.length) {
      const m = bestMatch(raw, catalog.breweries, { minScore: 0.76 });
      if (m) out.statePatch.brewery = m.value;
    }

    if (catalog?.hops?.length) {
      const m = bestMatch(raw, catalog.hops, { minScore: 0.78 });
      if (m) out.statePatch.hop = m.value;
    }

    if (catalog?.yeasts?.length) {
      const m = bestMatch(raw, catalog.yeasts, { minScore: 0.78 });
      if (m) out.statePatch.yeast = m.value;
    }

    if (catalog?.tags?.length) {
      const m = bestMatch(raw, catalog.tags, { minScore: 0.80 });
      if (m) out.statePatch.tag = m.value;
    }

    // Flavor direction keywords (same labels as UI).
    const t = normalize(raw);
    if (/\b(crisp|clean|lager|pilsner)\b/.test(t)) out.statePatch.flavorDirection = "Crisp & Clean";
    if (/\b(malty|caramel|amber|red)\b/.test(t)) out.statePatch.flavorDirection = "Malty & Smooth";
    if (/\b(hoppy|bitter|ipa|west coast)\b/.test(t)) out.statePatch.flavorDirection = "Hoppy & Bitter";
    if (/\b(juicy|hazy|new england)\b/.test(t)) out.statePatch.flavorDirection = "Juicy & Hazy";
    if (/\b(roasty|dark|stout|porter)\b/.test(t)) out.statePatch.flavorDirection = "Roasty & Dark";
    if (/\b(light|refreshing|session)\b/.test(t)) out.statePatch.flavorDirection = "Light & Refreshing";
    if (/\b(rich|full|big)\b/.test(t)) out.statePatch.flavorDirection = "Rich & Full";

    // Container + packaging.
    if (/\b(can|cans)\b/.test(t)) out.statePatch.container = "can";
    if (/\b(bottle|bottles)\b/.test(t)) out.statePatch.container = "bottle";

    if (/\b(single)\b/.test(t)) out.statePatch.package = "available_single";
    if (/\b4\s*pack\b|\b4-pack\b/.test(t)) out.statePatch.package = "available_4pack";
    if (/\b6\s*pack\b|\b6-pack\b/.test(t)) out.statePatch.package = "available_6pack";
    if (/\b8\s*pack\b|\b8-pack\b/.test(t)) out.statePatch.package = "available_8pack";
    if (/\b12\s*pack\b|\b12-pack\b/.test(t)) out.statePatch.package = "available_12pack";
    if (/\b15\s*pack\b|\b15-pack\b/.test(t)) out.statePatch.package = "available_15pack";
    if (/\b24\s*pack\b|\b24-pack\b/.test(t)) out.statePatch.package = "available_24pack";
    if (/\bmixed pack\b|\bvariety pack\b/.test(t)) out.statePatch.package = "available_mixedpack";

    if (catalog?.foodCategories?.length) {
      const m = bestMatch(raw, catalog.foodCategories, { minScore: 0.78 });
      if (m) {
        out.statePatch.withFood = "yes";
        out.statePatch.foodCategory = m.value;
      }
    }

    // Also support matching actual food tokens from inventory (e.g. "fish and chips").
    if (catalog?.foods?.length && !out.statePatch.foodCategory) {
      const m = bestMatch(raw, catalog.foods, { minScore: 0.78 });
      if (m) {
        out.statePatch.withFood = "yes";
        out.statePatch.foodToken = m.value;
      }
    }

    return out;
  }

  function parseBar(text, catalog) {
    const raw = safeText(text);
    const out = { statePatch: {}, clarifications: [] };
    if (!raw) return out;
    const t = normalize(raw);

    // Intent: recommend a bottle (inventory item) vs a cocktail idea.
    // Note: inventory currently contains no recipe data, so cocktail intent may be used for follow-ups.
    if (/\b(cocktail|drink|mixed drink|make me|make a|mix|recipe|martini|margarita|old fashioned|negroni|manhattan)\b/.test(t)) {
      out.statePatch.intent = "cocktail";
    } else if (/\b(bottle|buy|purchase|grab|pick up)\b/.test(t)) {
      out.statePatch.intent = "bottle";
    }

    if (catalog?.spirits?.length) {
      const m = bestMatch(raw, catalog.spirits, { minScore: 0.70 });
      if (m) out.statePatch.spirit = m.value;
    } else {
      // Fallback keywords.
      if (/\bgin\b/.test(t)) out.statePatch.spirit = "Gin";
      if (/\brum\b/.test(t)) out.statePatch.spirit = "Rum";
      if (/\btequila\b/.test(t)) out.statePatch.spirit = "Tequila";
      if (/\bvodka\b/.test(t)) out.statePatch.spirit = "Vodka";
      if (/\bwhisk(e)?y\b|\bbourbon\b|\bscotch\b|\brye\b/.test(t)) out.statePatch.spirit = "Whiskey";
      if (/\bliqueur\b|\bliquor\b/.test(t)) out.statePatch.spirit = "Liquor";
    }

    if (catalog?.names?.length) {
      const m = bestMatch(raw, catalog.names, { minScore: 0.84 });
      if (m) out.statePatch.name = m.value;
    }

    {
      const excludes = {};
      if (catalog?.spirits?.length) {
        const xs = findNegatedEntities(raw, catalog.spirits);
        if (xs.length) excludes.spirits = xs;
      }
      if (catalog?.names?.length) {
        const xs = findNegatedEntities(raw, catalog.names);
        if (xs.length) excludes.names = xs;
      }
      if (Object.keys(excludes).length) out.statePatch.excludes = excludes;
    }

    out.statePatch.sweet = /\bsweet\b/.test(t);
    out.statePatch.bitter = /\bbitter\b/.test(t);
    out.statePatch.creamy = /\bcreamy\b/.test(t);

    if (/\bneat\b/.test(t)) out.statePatch.serve = "neat";
    if (/\b(on the rocks|rocks)\b/.test(t)) out.statePatch.serve = "rocks";
    if (/\b(cocktail|mixed|mix)\b/.test(t)) out.statePatch.serve = "cocktail";
    if (/\b(shots?|shooters?)\b/.test(t)) out.statePatch.serve = "shots";

    if (/\b(high proof|overproof|strong)\b/.test(t)) out.statePatch.proofPref = "high";
    if (/\b(low proof|light)\b/.test(t)) out.statePatch.proofPref = "low";

    return out;
  }

  function findNegatedEntities(text, candidates) {
    const t = normalize(text);
    if (!t || !Array.isArray(candidates) || !candidates.length) return [];
    const out = [];
    for (const c of candidates) {
      const cc = normalize(c);
      if (!cc) continue;
      // Token-safe negation checks.
      if (
        containsEntity(t, `not ${cc}`) ||
        containsEntity(t, `no ${cc}`) ||
        containsEntity(t, `without ${cc}`) ||
        containsEntity(t, `anything but ${cc}`) ||
        containsEntity(t, `anything except ${cc}`) ||
        containsEntity(t, `except ${cc}`)
      ) {
        out.push(c);
      }
    }
    return out;
  }

  window.MyraNlu = {
    normalize,
    bestMatch,
    parseWine,
    parseBeer,
    parseBar,
  };
})();
