import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Gemini image analysis can take well over a minute
export const maxDuration = 300;

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * POST /api/scan-vehicle
 * Multimodal vehicle inspection & Sri Lankan market valuation using Gemini 3.8 Flash
 */
export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Vehicle image is required for analysis.' }, { status: 400 });
    }

    // Clean base64 data header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `
You are an expert Senior Automotive Inspector and Valuation Appraiser for SDB Bank (SANASA Development Bank PLC) in Sri Lanka, operating at a major Motor Show exhibition in Colombo.
Examine this vehicle photo in detail.

Your task:
1. Identify the Make, Model, approximate Year/Generation range, Variant/Trim, and Body Type.
2. Conduct an exterior visual condition assessment: inspect paint luster, body panel alignment, wear and tear, headlamps, bumpers, cleanliness, visible modifications or flaws. Assign a condition score from 1.0 to 10.0 (where 10.0 is brand new showroom condition).
3. Estimate the CURRENT SRI LANKAN MARKET VALUE IN SRI LANKAN RUPEES (LKR) based on prevailing prices on Ikman.lk, Riyasewana, and registered vehicle importer benchmarks in Sri Lanka (accounting for prevailing import taxes, customs valuations, and local demand).
4. Provide Sri Lankan driving context: real-world fuel economy (Colombo city traffic vs highway km/l or EV range), safety rating (NCAP stars, airbags), parts availability across Sri Lankan districts, and resale value stability.

Return STRICT JSON complying with this exact structure:
{
  "make": "string (e.g. Toyota, Suzuki, Honda, BYD, Nissan, Hyundai, etc.)",
  "model": "string (e.g. Raize, Wagon R, Vezel, Atto 3, Aqua, etc.)",
  "yearRange": "string (e.g. 2021 - 2023)",
  "variantTrim": "string (e.g. Z Package Turbo, Stingray Hybrid, e:HEV Play, etc.)",
  "bodyType": "string (e.g. Compact SUV, Kei Car, Crossover, Sedan, Hatchback, 7-Seater SUV)",
  "estimatedMarketValueLKR": {
    "min": number (e.g. 9500000),
    "max": number (e.g. 10500000),
    "avg": number (e.g. 10000000),
    "recommendedOffer": number (e.g. 9800000)
  },
  "conditionScore": number (between 1.0 and 10.0, e.g. 9.2),
  "conditionSummary": "string (concise summary of vehicle visual state)",
  "inspection": {
    "paintCondition": "string (analysis of paint depth, reflection, swirl marks, or blemishes)",
    "exteriorCleanliness": "string (cleanliness and showroom detailing status)",
    "bodyworkNotes": "string (alignment of panels, hood, bumper fitment, and lamp lenses)",
    "wearAndTearScore": number (1 to 10),
    "overallConditionGrade": "Pristine / Showroom" | "Excellent" | "Good" | "Fair" | "Requires Attention"
  },
  "fuelEfficiency": {
    "cityKmPerLitre": "string (e.g. 14.0 - 16.0 km/l or km per charge)",
    "highwayKmPerLitre": "string (e.g. 18.0 - 21.0 km/l)",
    "combinedKmPerLitre": "string (e.g. 16.5 km/l)",
    "fuelType": "Petrol" | "Diesel" | "Hybrid" | "Electric" | "Plug-in Hybrid",
    "costRating": "Very Economical" | "Moderate" | "Heavy"
  },
  "safety": {
    "ratingStars": number (between 1 and 5),
    "ncapSource": "string (e.g. JNCAP 5-Star, Euro NCAP, etc.)",
    "airbagsCount": number or string,
    "keySafetyFeatures": ["string", "string", "string"]
  },
  "sriLankaContext": {
    "partsAvailability": "Very High (Islandwide)" | "Good" | "Moderate" | "Special Order",
    "resaleValueTrend": "Exceptional (High Demand)" | "Stable" | "Depreciating" | "Niche Market",
    "recommendation": "string (expert advice on running this car in Sri Lanka, road suitability, and SDB Bank financing suitability)"
  }
}
`;

    let vehicleData;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || '{}';
      vehicleData = JSON.parse(responseText);
    } catch (geminiError: any) {
      console.error('Gemini vehicle analysis failed:', geminiError?.message);
      return NextResponse.json(
        {
          error: 'AI vehicle analysis is unavailable. Please try again.',
          details: geminiError?.message || 'Unknown Gemini error',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      vehicle: vehicleData,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error analyzing vehicle:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze vehicle image.',
        details: error.message || 'Unknown server error',
      },
      { status: 500 }
    );
  }
}
