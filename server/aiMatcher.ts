import { GoogleGenAI } from '@google/genai';
import { LostFoundItem, MatchReasoning, ItemMatch } from '../src/types';

// Server-side Gemini initialization with recommended User-Agent header
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Fallback semantic heuristic matcher when Gemini API is unavailable or offline.
 * Ensures the academic demo / viva presentation runs flawlessly.
 */
export function calculateHeuristicMatch(lost: LostFoundItem, found: LostFoundItem): {
  score: number;
  confidenceLabel: ItemMatch['confidenceLabel'];
  reasoning: MatchReasoning;
} {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category comparison (weight: 25%)
  const catMatch = lost.category.toLowerCase().trim() === found.category.toLowerCase().trim();
  if (catMatch) {
    score += 25;
    reasons.push(`Direct Category Match: Both items belong to "${lost.category}".`);
  } else {
    // Partial check (e.g. Earphones vs Electronics)
    reasons.push(`Category Divergence: "${lost.category}" vs "${found.category}".`);
  }

  // 2. Color comparison (weight: 15%)
  const colorMatch =
    lost.color && found.color &&
    (lost.color.toLowerCase().includes(found.color.toLowerCase()) ||
     found.color.toLowerCase().includes(lost.color.toLowerCase()));
  if (colorMatch) {
    score += 15;
    reasons.push(`Color Match: Both items identified with ${lost.color} color.`);
  }

  // 3. Location proximity (weight: 20%)
  let locationProximityScore = 10;
  if (lost.location.toLowerCase() === found.location.toLowerCase()) {
    locationProximityScore = 100;
    score += 20;
    reasons.push(`Campus Zone Proximity: Both items associated with "${lost.location}".`);
  } else {
    locationProximityScore = 25;
    reasons.push(`Location Difference: Lost at "${lost.location}", found at "${found.location}".`);
  }

  // 4. Date proximity (weight: 10%)
  const dLost = new Date(lost.date).getTime();
  const dFound = new Date(found.date).getTime();
  const daysDiff = Math.abs((dFound - dLost) / (1000 * 60 * 60 * 24));
  let timeProximityScore = 50;
  if (daysDiff <= 2) {
    timeProximityScore = 100;
    score += 10;
    reasons.push(`Temporal Proximity: Found within 48 hours of reported loss date.`);
  } else if (daysDiff <= 7) {
    timeProximityScore = 75;
    score += 6;
    reasons.push(`Temporal Window: Found within the same academic week (${Math.round(daysDiff)} days apart).`);
  } else {
    timeProximityScore = 30;
    score += 2;
  }

  // 5. Brand similarity (weight: 10%)
  if (lost.brand && found.brand &&
      (lost.brand.toLowerCase().includes(found.brand.toLowerCase()) ||
       found.brand.toLowerCase().includes(lost.brand.toLowerCase()))) {
    score += 10;
    reasons.push(`Brand Corroboration: Matched manufacturer "${lost.brand}".`);
  }

  // 6. Semantic keyword / feature overlap (weight: 20%)
  const lostTokens = `${lost.title} ${lost.description} ${lost.distinguishingFeatures || ''}`.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  const foundTokens = `${found.title} ${found.description} ${found.distinguishingFeatures || ''}`.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  const shared = lostTokens.filter(t => foundTokens.includes(t));
  const semanticOverlap = Math.min(20, Math.round((shared.length / Math.max(lostTokens.length, 1)) * 30));
  score += semanticOverlap;

  if (shared.length > 1) {
    reasons.push(`Distinguishing Feature & Keyword Correlation: Shared identifiers ("${Array.from(new Set(shared)).slice(0, 4).join('", "')}").`);
  }

  // Normalize final score between 10 and 98 (never claim 100% automatic ownership)
  const finalScore = Math.min(98, Math.max(12, score));

  let confidenceLabel: ItemMatch['confidenceLabel'] = 'Low Match';
  if (finalScore >= 90) confidenceLabel = 'Strong Match';
  else if (finalScore >= 70) confidenceLabel = 'Possible Match';
  else if (finalScore >= 50) confidenceLabel = 'Weak Match';

  return {
    score: finalScore,
    confidenceLabel,
    reasoning: {
      categoryMatch: catMatch,
      colorMatch: !!colorMatch,
      locationProximityScore,
      timeProximityScore,
      semanticSimilarityScore: Math.min(100, semanticOverlap * 5),
      featureMatchScore: shared.length > 0 ? 85 : 30,
      reasons,
      recommendation: finalScore >= 70
        ? 'High potential correlation detected by FINDIT AI. Claimant should submit ownership verification questions.'
        : 'Moderate or low similarity. Manual inspection and detailed identifying questions required.',
    },
  };
}

/**
 * Perform AI comparison using Gemini 3.8 Flash model.
 * Produces structured confidence score and explainable viva-ready reasoning.
 */
export async function compareItemsWithGemini(
  lost: LostFoundItem,
  found: LostFoundItem
): Promise<{
  score: number;
  confidenceLabel: ItemMatch['confidenceLabel'];
  reasoning: MatchReasoning;
}> {
  const ai = getAiClient();

  if (!ai) {
    // If GEMINI_API_KEY is not configured, fall back to heuristic algorithm
    return calculateHeuristicMatch(lost, found);
  }

  try {
    const prompt = `
You are the AI Matching Core for "FINDIT AI", a college campus Lost & Found platform.
Analyze whether the following Lost Item Report and Found Item Report match the same physical belonging.

IMPORTANT RULES:
- Never declare absolute 100% ownership certainty. All matches are "Potential Matches" subject to human administrative verification.
- Output MUST be strict valid JSON matching the schema below.
- Score ranges:
  * 90-99: "Strong Match"
  * 70-89: "Possible Match"
  * 50-69: "Weak Match"
  * Below 50: "Low Match"

[LOST ITEM REPORT]
- ID: ${lost.id}
- Title: ${lost.title}
- Category: ${lost.category}
- Description: ${lost.description}
- Date Lost: ${lost.date} at approx ${lost.approximateTime}
- Campus Location: ${lost.location} (${lost.buildingOrArea})
- Color: ${lost.color}
- Brand: ${lost.brand || 'Unspecified'}
- Distinguishing Features: ${lost.distinguishingFeatures || 'None listed'}

[FOUND ITEM REPORT]
- ID: ${found.id}
- Title: ${found.title}
- Category: ${found.category}
- Description: ${found.description}
- Date Found: ${found.date} at approx ${found.approximateTime}
- Campus Location: ${found.location} (${found.buildingOrArea})
- Color: ${found.color}
- Brand: ${found.brand || 'Unspecified'}
- Distinguishing Features: ${found.distinguishingFeatures || 'None listed'}

Evaluate semantic similarity, spatial proximity across the campus, temporal feasibility (found after or on the loss date), physical characteristics, and unique markings.
Provide structured JSON with:
{
  "score": number (0-98),
  "confidenceLabel": "Strong Match" | "Possible Match" | "Weak Match" | "Low Match",
  "categoryMatch": boolean,
  "colorMatch": boolean,
  "locationProximityScore": number (0-100),
  "timeProximityScore": number (0-100),
  "semanticSimilarityScore": number (0-100),
  "featureMatchScore": number (0-100),
  "reasons": string[],
  "recommendation": string
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return calculateHeuristicMatch(lost, found);
    }

    const parsed = JSON.parse(text);

    const score = Math.min(98, Math.max(5, Number(parsed.score) || 50));
    let confidenceLabel: ItemMatch['confidenceLabel'] = 'Low Match';
    if (score >= 90) confidenceLabel = 'Strong Match';
    else if (score >= 70) confidenceLabel = 'Possible Match';
    else if (score >= 50) confidenceLabel = 'Weak Match';

    return {
      score,
      confidenceLabel,
      reasoning: {
        categoryMatch: Boolean(parsed.categoryMatch),
        colorMatch: Boolean(parsed.colorMatch),
        locationProximityScore: Number(parsed.locationProximityScore) || 50,
        timeProximityScore: Number(parsed.timeProximityScore) || 50,
        semanticSimilarityScore: Number(parsed.semanticSimilarityScore) || 50,
        featureMatchScore: Number(parsed.featureMatchScore) || 50,
        reasons: Array.isArray(parsed.reasons) && parsed.reasons.length > 0
          ? parsed.reasons
          : ['Semantic profile alignment assessed by Gemini AI.'],
        recommendation: parsed.recommendation || 'Potential match detected. Human verification required before handover.',
      },
    };
  } catch (error) {
    console.error('Gemini AI match error, falling back to heuristic engine:', error);
    return calculateHeuristicMatch(lost, found);
  }
}
