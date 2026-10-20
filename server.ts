import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Body parser with 50mb limit for high resolution motor show vehicle photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
 * Health check endpoint
 */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SDB Bank AutoScan Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * POST /api/scan-vehicle
 * Multimodal vehicle inspection & Sri Lankan market valuation using Gemini 3.8 Flash
 */
app.post('/api/scan-vehicle', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userPrompt = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Vehicle image is required for analysis.' });
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
      return res.status(502).json({
        error: 'AI vehicle analysis is unavailable. Please try again.',
        details: geminiError?.message || 'Unknown Gemini error',
      });
    }

    return res.json({
      success: true,
      vehicle: vehicleData,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error analyzing vehicle:', error);
    return res.status(500).json({
      error: 'Failed to analyze vehicle image.',
      details: error.message || 'Unknown server error',
    });
  }
});

// Configure Vite or Static files
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SDB Bank AutoScan server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
