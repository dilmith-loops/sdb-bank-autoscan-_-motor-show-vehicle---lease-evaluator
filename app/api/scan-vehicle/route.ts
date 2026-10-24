import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '@/src/utils/geminiKey';

// Gemini image analysis can take well over a minute
export const maxDuration = 300;

/**
 * POST /api/scan-vehicle
 * Multimodal vehicle inspection & Sri Lankan market valuation using Gemini
 */
export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Vehicle image is required for analysis.' }, { status: 400 });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_actual')) {
      console.error('Invalid or missing GEMINI_API_KEY');
      return NextResponse.json(
        {
          error: 'Gemini API key is not configured or invalid on the server.',
          details: 'Please set a valid GEMINI_API_KEY (from https://aistudio.google.com/app/apikey) in .env on your server.',
        },
        { status: 502 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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
    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-3.8-flash',
    ].filter(Boolean) as string[];

    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
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
        lastError = null;
        break; // Successfully analyzed
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini attempt with model ${model} failed:`, err?.message);
        // If it's an authentication error, don't keep trying models
        if (err?.message?.includes('API key') || err?.status === 401 || err?.status === 403) {
          break;
        }
      }
    }

    if (!vehicleData) {
      console.error('All Gemini model attempts failed:', lastError?.message);
      return NextResponse.json(
        {
          error: 'AI vehicle analysis is unavailable. Please check your Gemini API key.',
          details: lastError?.message || 'Unknown Gemini error',
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
