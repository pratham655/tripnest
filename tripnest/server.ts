import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path for simple local persistent JSON database
const DB_FILE = path.join(process.cwd(), "tripnest_db.json");

// Helper to write to database
function getDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      users: [
        {
          id: "demo-user",
          name: "Pratham",
          email: "prathams.galaxies@gmail.com",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
          bio: "Wanderlust enthusiast & tech developer. Ready to explore the world!",
          homeLocation: "Mumbai, India",
          createdAt: new Date().toISOString()
        }
      ],
      savedDestinations: [
        {
          id: "saved-1",
          destinationName: "Kyoto",
          country: "Japan",
          imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
          estimatedBudget: 1200,
          weatherSummary: { temp: 22, condition: "Sunny", rainProb: 10 },
          isVisited: false,
          notes: "Visit the Fushimi Inari Shrine early in the morning to beat the crowds!",
          createdAt: new Date().toISOString()
        },
        {
          id: "saved-2",
          destinationName: "Bali",
          country: "Indonesia",
          imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
          estimatedBudget: 850,
          weatherSummary: { temp: 29, condition: "Partly Cloudy", rainProb: 20 },
          isVisited: true,
          notes: "Amazing food and beaches. Loved Ubud Rice Terraces!",
          createdAt: new Date().toISOString()
        }
      ],
      plannedTrips: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    console.error("Failed to parse DB, resetting structure", e);
    return { users: [], savedDestinations: [], plannedTrips: [] };
  }
}

function saveDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Curated robust travel destinations
const CURATED_DESTINATIONS = [
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    description: "Famous for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. Indonesia's tropical paradise offers deep cultural experiences, world-class diving, and spiritual tranquility.",
    bestTimeToVisit: "April to October (Dry season)",
    topAttractions: ["Ubud Monkey Forest", "Uluwatu Temple", "Tanah Lot", "Tegallalang Rice Terraces"],
    averageTripCost: { budget: 450, moderate: 900, luxury: 2200 },
    localFood: ["Nasi Goreng", "Sate Lilit", "Babi Guling", "Gado-Gado"],
    popularActivities: ["Temple Touring", "Surfing", "Yoga Retreats", "Scuba Diving"],
    tags: ["beaches", "nature", "adventure", "budget-friendly", "family-friendly"],
    coordinates: { lat: -8.4095, lng: 115.1889 }
  },
  {
    id: "swiss-alps",
    name: "Swiss Alps",
    country: "Switzerland",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    description: "Breathtaking views, pristine snow-capped summits, and high-altitude valleys. Perfect for skiers, hikers, or anyone looking to enjoy pure mountain luxury alongside crystalline glacial streams.",
    bestTimeToVisit: "June to September (Hiking) or December to March (Skiing)",
    topAttractions: ["Matterhorn", "Jungfraujoch", "Interlaken", "Zermatt Car-free Village"],
    averageTripCost: { budget: 1500, moderate: 3200, luxury: 6800 },
    localFood: ["Cheese Fondue", "Raclette", "Rösti", "Swiss Chocolates"],
    popularActivities: ["Skiing", "Scenic Train Rides", "Alpine Hiking", "Paragliding"],
    tags: ["mountains", "luxury", "nature", "adventure"],
    coordinates: { lat: 46.5368, lng: 8.1256 }
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    description: "The historical heart of Japan with thousands of classical Buddhist temples, gardens, majestic imperial palaces, Shinto shrines, and traditional wooden townhouses.",
    bestTimeToVisit: "March to May (Cherry Blossom) or October to November (Autumn leaves)",
    topAttractions: ["Fushimi Inari Shrine", "Kinkaku-ji (Golden Pavilion)", "Arashiyama Bamboo Grove", "Gion District"],
    averageTripCost: { budget: 800, moderate: 1800, luxury: 4000 },
    localFood: ["Kaiseki Dining", "Matcha Sweets", "Yakatabune Dinner", "Ramen"],
    popularActivities: ["Tea Ceremony", "Kimono Rental", "Zen Meditation Garden Walks", "Shrine Hopping"],
    tags: ["historical", "nature", "family-friendly"],
    coordinates: { lat: 35.0116, lng: 135.7681 }
  },
  {
    id: "reykjavik",
    name: "Reykjavik",
    country: "Iceland",
    imageUrl: "https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=1200&q=80",
    description: "The gateway to a land of raw natural drama. Volcanoes, geysers, hot springs, and massive glaciers outline the black sand shorelines of this vibrant capital city.",
    bestTimeToVisit: "June to August (Midnight sun) or September to March (Northern Lights)",
    topAttractions: ["Blue Lagoon", "Hallgrímskirkja", "Golden Circle", "Black Sand Beach (Reynisfjara)"],
    averageTripCost: { budget: 1100, moderate: 2400, luxury: 5200 },
    localFood: ["Skyr", "Fermented Shark", "Icelandic Lamb Soup", "Fresh Lobster Roll"],
    popularActivities: ["Glacier Hiking", "Northern Lights Tour", "Geothermal Bathing", "Whale Watching"],
    tags: ["nature", "adventure", "luxury"],
    coordinates: { lat: 64.1466, lng: -21.9426 }
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    description: "A potent blend of haunting ruins, awe-inspiring art, and vibrant street life. Walk through history at every corner while sipping exceptional coffee and experiencing true Roman cuisine.",
    bestTimeToVisit: "April to June or September to October",
    topAttractions: ["Colosseum", "Vatican Museums", "Trevi Fountain", "Pantheon"],
    averageTripCost: { budget: 600, moderate: 1400, luxury: 3500 },
    localFood: ["Cacio e Pepe", "Carbonara", "Artisan Gelato", "Pizza Romana"],
    popularActivities: ["Historical Walks", "Cooking Classes", "Vespa Tours", "Museum Exploring"],
    tags: ["historical", "family-friendly", "luxury"],
    coordinates: { lat: 41.9028, lng: 12.4964 }
  },
  {
    id: "costa-rica",
    name: "Costa Rica Rainforest",
    country: "Costa Rica",
    imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80",
    description: "Pura Vida comes alive under the active Arenal Volcano. Dense rainforests home to sloths, monkeys, and colorful toucans converge on pristine Pacific surf breaks.",
    bestTimeToVisit: "December to April (Dry season)",
    topAttractions: ["Manuel Antonio National Park", "Arenal Volcano", "Monteverde Cloud Forest", "Tortuguero canals"],
    averageTripCost: { budget: 500, moderate: 1100, luxury: 2600 },
    localFood: ["Gallo Pinto", "Casado", "Fried Plantains", "Costa Rican Coffee"],
    popularActivities: ["Rainforest Ziplining", "Wildlife Spying", "Surfing", "Hot Springs Bathing"],
    tags: ["nature", "adventure", "budget-friendly", "family-friendly"],
    coordinates: { lat: 9.7489, lng: -83.7534 }
  },
  {
    id: "queenstown",
    name: "Queenstown",
    country: "New Zealand",
    imageUrl: "https://images.unsplash.com/photo-1589871190112-7dc281513e9a?auto=format&fit=crop&w=1200&q=80",
    description: "The adventure capital of the Southern Hemisphere. Set against the dramatic Remarkables mountain range, it serves as the ultimate base for thrilled travelers and vineyard explorers alike.",
    bestTimeToVisit: "December to February (Summer) or June to August (Winter ski)",
    topAttractions: ["Milford Sound Fiord", "Skyline Gondola", "Lake Wakatipu", "Shotover Jet"],
    averageTripCost: { budget: 1000, moderate: 2200, luxury: 4900 },
    localFood: ["Fergburger", "New Zealand Lamb", "Pavlova", "Pinot Noir wine"],
    popularActivities: ["Bungy Jumping", "Wine Tasting", "Milford Sound Cruise", "TranzAlpine sightseeing"],
    tags: ["adventure", "mountains", "luxury"],
    coordinates: { lat: -45.0312, lng: 168.6626 }
  },
  {
    id: "phuket",
    name: "Phuket",
    country: "Thailand",
    imageUrl: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80",
    description: "Thailand's largest and most famous island. Enjoy fine white sand, nodding palm trees, glittering seas, and bustling night marketplaces filled with culinary wonders.",
    bestTimeToVisit: "November to April (Dry cool season)",
    topAttractions: ["Phi Phi Islands", "Big Buddha", "Old Phuket Town", "Patong Night Market"],
    averageTripCost: { budget: 350, moderate: 700, luxury: 1800 },
    localFood: ["Tom Yum Goong", "Pad Thai", "Massaman Curry", "Mango Sticky Rice"],
    popularActivities: ["Island Island Hopping", "Thai Massage", "Snorkeling", "Elephant Sanctuary Visits"],
    tags: ["beaches", "budget-friendly", "family-friendly"],
    coordinates: { lat: 7.8804, lng: 98.3923 }
  }
];

// Lazy init Gemini AI
let geminiAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiAiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      try {
        geminiAiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            }
          }
        });
      } catch (err) {
        console.error("Failed to construct GoogleGenAI client:", err);
      }
    }
  }
  return geminiAiClient;
}

// Simulated User Management
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const db = getDb();
  const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const newUser = {
    id: "user-" + Math.random().toString(36).substr(2, 9),
    name,
    email,
    avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    bio: "Hi! I am a proud traveler on TripNest.",
    homeLocation: "",
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb(db);

  res.json({ user: newUser, token: "jwt-token-simulated" });
});

app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const db = getDb();
  let user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  // Auto create or grab
  if (!user) {
    // If demo email, provision automatically for rich UX
    if (email === "prathams.galaxies@gmail.com") {
      user = {
        id: "demo-user",
        name: "Pratham",
        email: "prathams.galaxies@gmail.com",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        bio: "Wanderlust enthusiast & tech developer. Ready to explore the world!",
        homeLocation: "Mumbai, India",
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      saveDb(db);
    } else {
      return res.status(400).json({ error: "User not found. Please sign up first!" });
    }
  }

  res.json({ user, token: "jwt-token-simulated" });
});

app.post("/api/auth/profile/update", (req, res) => {
  const { id, name, bio, homeLocation, avatarUrl } = req.body;
  const db = getDb();
  const userIdx = db.users.findIndex((u: any) => u.id === id);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  db.users[userIdx] = {
    ...db.users[userIdx],
    name: name || db.users[userIdx].name,
    bio: bio !== undefined ? bio : db.users[userIdx].bio,
    homeLocation: homeLocation !== undefined ? homeLocation : db.users[userIdx].homeLocation,
    avatarUrl: avatarUrl !== undefined ? avatarUrl : db.users[userIdx].avatarUrl
  };

  saveDb(db);
  res.json({ success: true, user: db.users[userIdx] });
});

// Curated destinations list
app.get("/api/destinations", (req, res) => {
  const { tag, search } = req.query;
  let results = [...CURATED_DESTINATIONS];

  if (tag) {
    const t = String(tag).toLowerCase();
    results = results.filter(d => d.tags.includes(t));
  }

  if (search) {
    const s = String(search).toLowerCase();
    results = results.filter(d => 
      d.name.toLowerCase().includes(s) || 
      d.country.toLowerCase().includes(s) ||
      d.description.toLowerCase().includes(s)
    );
  }

  res.json(results);
});

// Destination details & coordinates lookup
app.get("/api/destinations/:id", (req, res) => {
  const dest = CURATED_DESTINATIONS.find(d => d.id === req.params.id);
  if (dest) {
    res.json(dest);
  } else {
    res.status(404).json({ error: "Destination not found" });
  }
});

// Bucket List Operations
app.get("/api/bucketlist", (req, res) => {
  const db = getDb();
  res.json(db.savedDestinations || []);
});

app.post("/api/bucketlist/add", (req, res) => {
  const { name, country, imageUrl, budget } = req.body;
  const db = getDb();

  const id = "saved-" + Math.random().toString(36).substr(2, 9);
  const newSaved = {
    id,
    destinationName: name,
    country: country || "Unknown",
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    estimatedBudget: Number(budget) || 1000,
    weatherSummary: {
      temp: 20 + Math.floor(Math.random() * 12),
      condition: ["Sunny", "Partly Cloudy", "Rainy", "Clear"][Math.floor(Math.random() * 4)],
      rainProb: Math.floor(Math.random() * 60)
    },
    isVisited: false,
    notes: "",
    createdAt: new Date().toISOString()
  };

  db.savedDestinations.push(newSaved);
  saveDb(db);
  res.json(newSaved);
});

app.post("/api/bucketlist/toggle-visited", (req, res) => {
  const { id } = req.body;
  const db = getDb();
  const item = db.savedDestinations.find((d: any) => d.id === id);
  if (item) {
    item.isVisited = !item.isVisited;
    saveDb(db);
    res.json({ success: true, item });
  } else {
    res.status(404).json({ error: "Bucket list item not found" });
  }
});

app.post("/api/bucketlist/update-notes", (req, res) => {
  const { id, notes } = req.body;
  const db = getDb();
  const item = db.savedDestinations.find((d: any) => d.id === id);
  if (item) {
    item.notes = notes;
    saveDb(db);
    res.json({ success: true, item });
  } else {
    res.status(404).json({ error: "Bucket list item not found" });
  }
});

app.delete("/api/bucketlist/:id", (req, res) => {
  const db = getDb();
  db.savedDestinations = db.savedDestinations.filter((d: any) => d.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Saved Trips/Itineraries operations
app.get("/api/trips", (req, res) => {
  const db = getDb();
  res.json(db.plannedTrips || []);
});

app.post("/api/trips/save", (req, res) => {
  const { itinerary } = req.body;
  if (!itinerary) {
    return res.status(400).json({ error: "Itinerary data is required" });
  }

  const db = getDb();
  const newTrip = {
    ...itinerary,
    id: itinerary.id || "trip-" + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };

  // Add or update
  const existingIdx = db.plannedTrips.findIndex((t: any) => t.id === newTrip.id);
  if (existingIdx !== -1) {
    db.plannedTrips[existingIdx] = newTrip;
  } else {
    db.plannedTrips.push(newTrip);
  }

  saveDb(db);
  res.json(newTrip);
});

app.delete("/api/trips/:id", (req, res) => {
  const db = getDb();
  db.plannedTrips = db.plannedTrips.filter((t: any) => t.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Dynamic Budget Calculator Summary
app.post("/api/budget/calculate", (req, res) => {
  const { destination, numberOfTravelers, numberOfDays } = req.body;
  const travelers = Number(numberOfTravelers) || 1;
  const days = Number(numberOfDays) || 3;

  // Attempt to match with high fidelity destination averages, or supply clean variables
  const lowerDest = String(destination).toLowerCase();
  const matched = CURATED_DESTINATIONS.find(d => d.name.toLowerCase().includes(lowerDest) || lowerDest.includes(d.name.toLowerCase()));

  const rates = matched ? matched.averageTripCost : { budget: 150, moderate: 450, luxury: 1200 };

  const calculations = {
    budget: {
      transportation: Math.round(100 * travelers + 20 * days * travelers),
      accommodation: Math.round(40 * days),
      food: Math.round(20 * days * travelers),
      attractions: Math.round(15 * days * travelers),
      miscellaneous: Math.round(10 * days * travelers),
      total: 0
    },
    moderate: {
      transportation: Math.round(250 * travelers + 40 * days * travelers),
      accommodation: Math.round(110 * days),
      food: Math.round(50 * days * travelers),
      attractions: Math.round(35 * days * travelers),
      miscellaneous: Math.round(25 * days * travelers),
      total: 0
    },
    luxury: {
      transportation: Math.round(750 * travelers + 100 * days * travelers),
      accommodation: Math.round(350 * days),
      food: Math.round(120 * days * travelers),
      attractions: Math.round(90 * days * travelers),
      miscellaneous: Math.round(60 * days * travelers),
      total: 0
    }
  };

  // Sum up totals
  calculations.budget.total = calculations.budget.transportation + calculations.budget.accommodation + calculations.budget.food + calculations.budget.attractions + calculations.budget.miscellaneous;
  calculations.moderate.total = calculations.moderate.transportation + calculations.moderate.accommodation + calculations.moderate.food + calculations.moderate.attractions + calculations.moderate.miscellaneous;
  calculations.luxury.total = calculations.luxury.transportation + calculations.luxury.accommodation + calculations.luxury.food + calculations.luxury.attractions + calculations.luxury.miscellaneous;

  res.json({
    destination: matched ? matched.name : destination,
    days,
    travelers,
    coordinates: matched ? matched.coordinates : { lat: 37.7749, lng: -122.4194 },
    calculations
  });
});

// Dynamic Weather Lookup simulation
app.get("/api/weather", (req, res) => {
  const { q } = req.query;
  const name = String(q || "Global").toLowerCase();

  // Find destination coordinates or base it off search
  const found = CURATED_DESTINATIONS.find(d => d.name.toLowerCase().includes(name) || name.includes(d.name.toLowerCase()));

  // Setup dynamic weather presets based on location or randomize slightly
  let tempBase = 22;
  let condition = "Sunny";
  let rainProb = 10;
  let rec = "Perfect day for sightseeing! Wear light cotton clothes and carry a sun-shield.";

  if (name.includes("alps") || name.includes("swiss") || name.includes("snow") || name.includes("mountain")) {
    tempBase = 4;
    condition = "Snowy";
    rainProb = 40;
    rec = "Best day for skiing! Layer up with thermal wear and gloves. Avoid late outdoor hiking.";
  } else if (name.includes("rain") || name.includes("costa") || name.includes("amazon") || Math.random() < 0.25) {
    tempBase = 23;
    condition = "Rainy";
    rainProb = 85;
    rec = "Carry an umbrella or water-resistant jacket. Best day for exploring visiting museums and indoor local cafes.";
  } else if (name.includes("bali") || name.includes("phuket") || name.includes("beach")) {
    tempBase = 30;
    condition = "Tropical";
    rainProb = 15;
    rec = "Excellent day for swimming and surfing! Don't forget sunscreen SPF 50 and sunglasses.";
  }

  const daysName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentDayIdx = new Date().getDay();
  const weeklyForecast = Array.from({ length: 7 }).map((_, i) => {
    const dName = daysName[(currentDayIdx + i) % 7];
    const forecastOffset = Math.floor(Math.sin(i) * 3);
    const dayTemp = tempBase + forecastOffset;
    let dayCond = condition;
    let prob = Math.max(0, Math.min(100, rainProb + Math.floor(Math.sin(i * 2) * 15)));

    if (prob > 70) {
      dayCond = "Rainy";
    } else if (prob > 40) {
      dayCond = "Cloudy";
    } else {
      dayCond = "Sunny";
    }

    return {
      day: dName,
      temp: dayTemp,
      condition: dayCond,
      rainProb: prob,
      description: `${dayCond} with a ${prob}% chance of rain.`
    };
  });

  res.json({
    currentTemp: tempBase,
    condition,
    rainProbability: rainProb,
    weeklyForecast,
    travelRecommendation: rec
  });
});

// AI ITINERARY GENERATOR VIA GEMINI CLIENT API
app.post("/api/gemini/generate-itinerary", async (req, res) => {
  const { startingLocation, destination, numberOfDays, numberOfTravelers, budget, interests } = req.body;
  
  if (!destination || !numberOfDays) {
    return res.status(400).json({ error: "Destination and travel days are required." });
  }

  console.log(`Generating travel itinerary via Gemini for ${destination} for ${numberOfDays} days...`);
  const client = getGeminiClient();

  if (!client) {
    console.log("No Gemini API key available or client failed creation. Returning realistic fallback template.");
    // Fallback template simulation (gorgeous and tailored)
    return res.json(generateHighFidelityFallbackItinerary(startingLocation, destination, numberOfDays, numberOfTravelers, budget, interests));
  }

  try {
    const prompt = `Create a detailed day-wise travel itinerary for a trip from "${startingLocation || "Unknown"}" to "${destination}".
Number of travel days: ${numberOfDays}.
Number of travelers: ${numberOfTravelers || 1}.
Travel budget profile: ${budget || "moderate"}.
Specific user interests to prioritize: ${(interests || []).join(", ") || "General sightseeing, culture, local delicacies"}.

Provide:
1. An elegant, catchy title for the trip.
2. 5 travel tips specific to ${destination}.
3. A detailed itinerary list for each day. Every day must include a daily theme, 3 timing-specific activities (with active timings: morning, afternoon, evening), and suggested restaurants.
4. Estimated travel expense values representing the full profile budget tier (transportation, accommodation, food, attractions, miscellaneous). Make sure the costs are numeric values (not text) formatted as integers in USD.

Return the result STRICTLY as a JSON object adhering exactly to this structure:
{
  "title": "catchy title",
  "travelTips": ["tip 1", "tip 2", ...],
  "dayWiseItinerary": [
    {
      "dayNumber": 1,
      "theme": "Day Theme",
      "activities": [
        { "time": "Morning (09:00 AM - 12:00 PM)", "activity": "Activity name", "description": "Short description of what to do", "cost": 25, "location": "Location name" },
        ...
      ],
      "suggestedRestaurants": [
        { "name": "Restaurant name", "cuisine": "Cuisine type", "priceRange": "$" }
      ]
    }
  ],
  "estimatedExpenses": {
    "transportation": 300,
    "accommodation": 450,
    "food": 200,
    "attractions": 150,
    "miscellaneous": 100,
    "total": 1200
  }
}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "travelTips", "dayWiseItinerary", "estimatedExpenses"],
          properties: {
            title: { type: Type.STRING },
            travelTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            dayWiseItinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["dayNumber", "theme", "activities", "suggestedRestaurants"],
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  theme: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["time", "activity", "description"],
                      properties: {
                        time: { type: Type.STRING },
                        activity: { type: Type.STRING },
                        description: { type: Type.STRING },
                        cost: { type: Type.INTEGER },
                        location: { type: Type.STRING }
                      }
                    }
                  },
                  suggestedRestaurants: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["name", "cuisine", "priceRange"],
                      properties: {
                        name: { type: Type.STRING },
                        cuisine: { type: Type.STRING },
                        priceRange: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            estimatedExpenses: {
              type: Type.OBJECT,
              required: ["transportation", "accommodation", "food", "attractions", "miscellaneous", "total"],
              properties: {
                transportation: { type: Type.INTEGER },
                accommodation: { type: Type.INTEGER },
                food: { type: Type.INTEGER },
                attractions: { type: Type.INTEGER },
                miscellaneous: { type: Type.INTEGER },
                total: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    });

    const parsedItinerary = JSON.parse(response.text || "{}");
    // Ensure ID exists
    parsedItinerary.id = "trip-" + Math.random().toString(36).substr(2, 9);
    parsedItinerary.startingLocation = startingLocation;
    parsedItinerary.destination = destination;
    parsedItinerary.numberOfDays = numberOfDays;
    parsedItinerary.numberOfTravelers = numberOfTravelers;
    parsedItinerary.budgetCategory = budget;
    parsedItinerary.interests = interests || [];

    res.json(parsedItinerary);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({
      error: "Failed to generate dynamic itinerary via Gemini. The model returned a formatting anomaly.",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// High quality fallback itinerary generation for smooth preview offline support
function generateHighFidelityFallbackItinerary(start: string, dest: string, days: number, travelers: number, budget: string, interests: string[]) {
  const travelersNum = Number(travelers) || 1;
  const daysNum = Number(days) || 3;
  const isBudget = budget === "budget";
  const isLuxury = budget === "luxury";
  
  const mult = isBudget ? 0.6 : isLuxury ? 2.5 : 1.2;
  const baseCostPerPerson = 400 * daysNum;
  
  const transportation = Math.round(150 * travelersNum * mult);
  const accommodation = Math.round(75 * daysNum * mult);
  const food = Math.round(50 * daysNum * travelersNum * mult);
  const attractions = Math.round(30 * daysNum * travelersNum * mult);
  const miscellaneous = Math.round(20 * daysNum * travelersNum * mult);

  const parsedItinerary: any = {
    id: "trip-" + Math.random().toString(36).substr(2, 9),
    title: `Amazing Expedition to ${dest}`,
    startingLocation: start || "Your Home",
    destination: dest,
    numberOfDays: daysNum,
    numberOfTravelers: travelersNum,
    budgetCategory: budget,
    interests: interests || [],
    travelTips: [
      `Pack versatile apparel suitable for localized meteorological variations in ${dest}.`,
      "Purchase a local transit card on arrival for efficient travel between tourist targets.",
      "Book top popular attractions in advance online to skip long entry waiting lists.",
      "Engage with native street vendors — they provide authentic culinary delights safely.",
      "Always carry a durable water flask to stay hydrated throughout daily walking segments."
    ],
    dayWiseItinerary: Array.from({ length: daysNum }).map((_, i) => {
      const dayNum = i + 1;
      let theme = `Discovering ${dest}`;
      if (dayNum === 1) theme = "Landing, Arrival & Historic Orientation";
      else if (dayNum === daysNum) theme = "Iconic Vistas & Souvenir Hunting";
      else if (dayNum === 2) theme = "Nature Wonders & Outdoor Adventures";

      return {
        dayNumber: dayNum,
        theme,
        activities: [
          {
            time: "Morning (09:00 AM - 12:00 PM)",
            activity: "Core Cultural Tour",
            description: "Visit the most majestic local heritage site and capture beautiful morning photos.",
            cost: Math.round(15 * mult),
            location: `${dest} Historical Center`
          },
          {
            time: "Afternoon (01:00 PM - 04:00 PM)",
            activity: "Scenic City Explorer & Cafe Crawl",
            description: "Stroll along traditional pathways, explore hand-crafted markets, and sample regional teas/pastries.",
            cost: Math.round(10 * mult),
            location: `${dest} Downtown Quarter`
          },
          {
            time: "Evening (06:00 PM - 09:00 PM)",
            activity: "Stellar Evening Sunset Sightseeing",
            description: "Climb to the perfect panoramic viewpoint to watch the golden hour fall across the horizontal city line.",
            cost: Math.round(5 * mult),
            location: `${dest} Summit Vista`
          }
        ],
        suggestedRestaurants: [
          { name: "Pristine Local Flavors", cuisine: "Authentic Regional Cuisine", priceRange: isLuxury ? "$$$" : isBudget ? "$" : "$$" },
          { name: "The Cozy Nest Grill", cuisine: "International Bistro Fusion", priceRange: isLuxury ? "$$$" : "$$" }
        ]
      };
    }),
    estimatedExpenses: {
      transportation,
      accommodation,
      food,
      attractions,
      miscellaneous,
      total: transportation + accommodation + food + attractions + miscellaneous
    }
  };

  return parsedItinerary;
}

// Serve Frontend Vite bundle / middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Handle express v5 vs v4 routes
  app.get("*", (req, res) => {
    res.status(404).send("API endpoint or static file not found");
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TripNest Fullstack] Server listening at http://localhost:${PORT}`);
  });
}

startServer();
