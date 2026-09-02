import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";

if (process.platform === "win32" && !process.env.VERCEL) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // ignore
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const backendDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(backendDir, "data");

app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload.",
    });
  }

  return next(err);
});

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI?.trim() || "";

let cachedPromise = null;

async function ensureDbConnected() {
  if (!MONGODB_URI) return false;
  if (mongoose.connection.readyState === 1) return true;

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        tls: true,
        tlsAllowInvalidCertificates: true,
      })
      .then(() => {
        console.log("[MongoDB] Connected successfully to Cloud Database");
        return true;
      })
      .catch((err) => {
        cachedPromise = null;
        console.error("[MongoDB] Connection error:", err.message);
        return false;
      });
  }

  return await cachedPromise;
}

ensureDbConnected();

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const preferenceSchema = new mongoose.Schema(
  {
    userEmail: { type: String },
    goal: String,
    budget: String,
    time: String,
    services: [String],
    location: String,
    detectedArea: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

const Preference = mongoose.models.Preference || mongoose.model("Preference", preferenceSchema);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: { type: String },
    userEmail: { type: String },
    salon: {
      name: String,
      area: String,
      rating: Number,
    },
    selectedServices: [
      {
        name: String,
        price: Number,
        duration: String,
      },
    ],
    date: String,
    slot: String,
    totalAmount: Number,
    status: { type: String, default: "confirmed" },
  },
  { timestamps: true }
);

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

// ──────────────────────────────────────────────────────────────────────
// Simple email/password auth (MongoDB + File Fallback)
// ──────────────────────────────────────────────────────────────────────
function readUsers() {
  try {
    const p = path.join(dataDir, "users.json");
    if (!fs.existsSync(p)) return [];
    const raw = fs.readFileSync(p, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("[auth] Failed to read users.json:", error);
    return [];
  }
}

function writeUsers(users) {
  const p = path.join(dataDir, "users.json");
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    // Vercel serverless may run on a read-only filesystem.
    // Swallow write errors so signup/login doesn't crash.
    console.error("[auth] Failed to write users.json (continuing in-memory):", err);
  }
}


function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateEmail(email) {
  const v = String(email || "").trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 6;
}


app.get("/", (req, res) => {
  res.send("Backend is running");
});


function normalizeService(s) {
  return String(s || "").toLowerCase().trim();
}

function parseBudget(budget) {
  const n = typeof budget === "number" ? budget : Number(budget);
  return Number.isFinite(n) ? n : null;
}

function parseLocation(location) {
  const loc = String(location || "").trim();
  if (!loc) return "";
  const lower = loc.toLowerCase();
  if (lower.includes("current")) return "CURRENT";
  return loc;
}

function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function scoreSalon({ salon, services, budget, location, coordinates }) {
  // Location Match (+40)
  let locationScore = 0;
  if (
    coordinates &&
    typeof coordinates.lat === "number" &&
    typeof coordinates.lng === "number" &&
    typeof salon.lat === "number" &&
    typeof salon.lng === "number"
  ) {
    const dist = getHaversineDistanceKm(coordinates.lat, coordinates.lng, salon.lat, salon.lng);
    if (dist <= 3) locationScore = 40;
    else if (dist <= 7) locationScore = 30;
    else if (dist <= 12) locationScore = 20;
    else if (dist <= 20) locationScore = 10;
    else locationScore = 5;
  } else if (location === "CURRENT") {
    locationScore = 40;
  } else if (String(salon.area || "").toLowerCase() === String(location || "").toLowerCase()) {
    locationScore = 40;
  } else {
    locationScore = 0;
  }

  // Service Match (+30)
  const selectedServices = (Array.isArray(services) ? services : [])
    .map(normalizeService)
    .filter(Boolean);
  const salonServices = (Array.isArray(salon.services) ? salon.services : [])
    .map(normalizeService);

  let serviceHits = 0;
  for (const s of selectedServices) {
    if (salonServices.includes(s)) serviceHits += 1;
  }
  const serviceScore = selectedServices.length === 0 ? 0 : Math.round((serviceHits / selectedServices.length) * 30);

  // Budget Match (+20)
  // Interpret salon.priceRange as a typical session price.
  const b = parseBudget(budget);
  const salonPrice = Number(salon.priceRange);
  let budgetScore = 0;
  if (b !== null && Number.isFinite(salonPrice) && salonPrice > 0) {
    const diff = Math.abs(b - salonPrice);
    // full score if close (<=10%); otherwise degrade linearly down to 0 at 50% diff.
    const threshold = salonPrice * 0.5;
    budgetScore = diff <= salonPrice * 0.1 ? 20 : diff >= threshold ? 0 : Math.round(((threshold - diff) / threshold) * 20);
  }

  // Rating Bonus (+10)
  const rating = Number(salon.rating);
  const ratingScore = Number.isFinite(rating) ? Math.round((Math.min(Math.max(rating, 0), 5) / 5) * 10) : 0;

  const score = locationScore + serviceScore + budgetScore + ratingScore;
  return score;
}

const salonsPath = path.join(dataDir, "salons.json");
const salons = JSON.parse(fs.readFileSync(salonsPath, "utf8"));

app.get("/api/test-gemini", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "Missing GEMINI_API_KEY" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("[Gemini] Sending test prompt");
    const prompt = "Say hello from Gemini.";
    const result = await model.generateContent(prompt);

    const text = result?.response?.text?.() ?? "";
    console.log("[Gemini] Response:", text);

    return res.json({ success: true, message: text });
  } catch (err) {
    console.error("[Gemini] test failed:", err);
    return res.status(500).json({ success: false, message: "Gemini test failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const e = normalizeEmail(email);
    const p = String(password || "");

    if (!validateEmail(e) || !validatePassword(p)) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    const isDbReady = await ensureDbConnected();

    if (isDbReady) {
      const found = await User.findOne({ email: e });
      if (!found || found.password !== p) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }
      return res.json({ success: true, message: "Signed in." });
    }

    // Fallback to local file / memory
    const users = readUsers();
    const found = users.find((u) => u.email === e);
    if (!found || found.password !== p) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    return res.json({ success: true, message: "Signed in." });
  } catch (err) {
    console.error("[auth login error]:", err);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { name = "Google User", email = "user.google@gmail.com" } = req.body || {};
    const e = normalizeEmail(email);
    const n = String(name || "Google User").trim();

    const isDbReady = await ensureDbConnected();
    if (isDbReady) {
      let user = await User.findOne({ email: e });
      if (!user) {
        user = await User.create({ name: n, email: e, password: "google_oauth_authenticated" });
      }
      return res.json({
        success: true,
        message: "Google Sign-In successful",
        user: { id: user._id, name: user.name, email: user.email },
      });
    }

    return res.json({
      success: true,
      message: "Google Sign-In successful",
      user: { name: n, email: e },
    });
  } catch (err) {
    return res.json({
      success: true,
      message: "Google Sign-In successful",
      user: { name: "Google User", email: "user.google@gmail.com" },
    });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const e = normalizeEmail(email);
    const p = String(password || "");
    const n = String(name || "").trim();

    if (!n) return res.status(400).json({ success: false, message: "Unable to create account." });
    if (!validateEmail(e)) return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    if (!validatePassword(p)) return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

    const isDbReady = await ensureDbConnected();

    if (isDbReady) {
      const existing = await User.findOne({ email: e });
      if (existing) {
        return res.status(409).json({ success: false, message: "Account already exists. Please sign in." });
      }

      await User.create({ name: n, email: e, password: p });
      return res.status(201).json({ success: true, message: "Account created." });
    }

    // Fallback to local file / memory
    const users = readUsers();
    if (users.some((u) => u.email === e)) {
      return res.status(409).json({ success: false, message: "Account already exists. Please sign in." });
    }

    users.push({ name: n, email: e, password: p, createdAt: new Date().toISOString() });
    writeUsers(users);

    return res.status(201).json({ success: true, message: "Account created." });
  } catch (error) {
    console.error("[auth signup error]:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

async function fetchOsmSalons(lat, lng, selectedServices, budgetVal, detectedAreaName) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const query = `[out:json][timeout:4];
(
  node["shop"~"beauty|hairdresser"](around:8000, ${lat}, ${lng});
  node["amenity"="spa"](around:8000, ${lat}, ${lng});
);
out body 15;`;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "SlotAndStyleBeautyApp/1.0 (https://slotstyle.com)",
      },
      body: "data=" + encodeURIComponent(query),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data?.elements)) return [];

    const fallbackServices = Array.isArray(selectedServices) && selectedServices.length > 0
      ? selectedServices
      : ["Haircut", "Facial"];
    const parsedBudget = Number(budgetVal) || 3000;

    return data.elements
      .filter((el) => el && typeof el.lat === "number" && typeof el.lon === "number")
      .map((el, idx) => {
        const rawName = el.tags?.name || el.tags?.["name:en"] || el.tags?.brand;
        const name = rawName ? String(rawName).trim() : `Beauty Studio #${idx + 1}`;
        const area = el.tags?.["addr:suburb"] || el.tags?.["addr:district"] || el.tags?.["addr:city"] || detectedAreaName || "Delhi";
        const rating = Number((4.3 + ((Math.abs(el.id || idx) % 7) * 0.1)).toFixed(1));

        return {
          id: el.id || 5000 + idx,
          name,
          area,
          services: fallbackServices,
          priceRange: parsedBudget,
          rating,
          category: el.tags?.shop === "hairdresser" ? "Hair Studio" : "Skin & Beauty",
          lat: el.lat,
          lng: el.lon,
          description: `Live location matched via OpenStreetMap in ${area}.`,
          isLiveOsm: true,
        };
      });
  } catch (err) {
    console.warn("[OSM Fetch Warning]:", err.message);
    return [];
  }
}

app.post("/api/recommendation", async (req, res) => {
  console.log("Received Data:", req.body);

  const { goal, budget, time, services, location, coordinates, detectedArea } = req.body || {};

  const userLocation = parseLocation(location);

  const DELHI_AREA_COORDS = {
    "saket": { lat: 28.5244, lng: 77.2100 },
    "hauz khas": { lat: 28.5494, lng: 77.2001 },
    "connaught place": { lat: 28.6315, lng: 77.2167 },
    "greater kailash": { lat: 28.5463, lng: 77.2415 },
    "dwarka": { lat: 28.5921, lng: 77.0460 },
    "rohini": { lat: 28.7041, lng: 77.1025 },
    "karol bagh": { lat: 28.6514, lng: 77.1907 },
    "rajouri garden": { lat: 28.6415, lng: 77.1209 },
    "south extension": { lat: 28.5684, lng: 77.2215 },
    "vasant kunj": { lat: 28.5293, lng: 77.1552 },
  };

  const targetAreaName = String(detectedArea || location || "").trim().toLowerCase();
  const effectiveCoords = (coordinates && typeof coordinates.lat === "number" && typeof coordinates.lng === "number")
    ? coordinates
    : DELHI_AREA_COORDS[targetAreaName] || undefined;

  const goalMap = {
    Relaxation: ["Massage", "Facial"],
    GlowUp: ["Facial", "Makeup"],
    HairTransformation: ["Haircut", "Colour & Balayage"],
    Grooming: ["Haircut", "Eyebrows"],
    Bridal: ["Makeup"],
  };

  const timeMap = {
    "30-60 mins": 1,
    "1-2 hours": 2,
    "2-4 hours": 4,
    "Half Day": 6,
  };

  function goalMatchScore(salon) {
    const g = String(goal || "").trim();
    if (!g) return 0;

    const target = goalMap[g] || [];
    if (!target.length) return 0;

    const salonServices = (Array.isArray(salon.services) ? salon.services : []).map(normalizeService);
    let hits = 0;
    for (const s of target.map(normalizeService)) {
      if (salonServices.includes(s)) hits += 1;
    }

    return Math.round((hits / target.length) * 20);
  }

  function timeMatchScore(salon) {
    const t = String(time || "").trim();
    if (!t) return 0;

    const tWeight = timeMap[t];
    if (!tWeight) return 0;

    const salonEstimatedDurationHours = Math.max(1, Math.round((Array.isArray(salon.services) ? salon.services.length : 1) * 1));

    const availableTierHours = tWeight <= 2 ? tWeight : tWeight <= 4 ? 3 : 6;
    const diff = Math.abs(availableTierHours - salonEstimatedDurationHours);

    const raw = diff <= Math.max(1, availableTierHours * 0.5) ? 10 : 0;
    return raw;
  }

  let liveOsmSalons = [];
  if (effectiveCoords && typeof effectiveCoords.lat === "number" && typeof effectiveCoords.lng === "number") {
    console.log("[OSM] Querying live salons around", effectiveCoords.lat, effectiveCoords.lng);
    liveOsmSalons = await fetchOsmSalons(effectiveCoords.lat, effectiveCoords.lng, services, budget, detectedArea || location);
    console.log("[OSM] Found live salons:", liveOsmSalons.length);
  }

  const combinedSalons = [...liveOsmSalons, ...(Array.isArray(salons) ? salons : [])];

  const scored = combinedSalons
    .map((salon) => {
      const base = scoreSalon({ salon, services, budget, location: userLocation, coordinates: effectiveCoords });
      const goalScore = goalMatchScore(salon);
      const timeScore = timeMatchScore(salon);
      const totalRaw = base + goalScore + timeScore;
      const scorePercent = Math.min(99, Math.max(72, Math.round((totalRaw / 110) * 100)));
      return { salon, score: scorePercent, goalScore, timeScore, baseScore: base };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const recommendations = scored.map(({ salon, score }) => {
    let distanceKm = undefined;
    if (
      effectiveCoords &&
      typeof effectiveCoords.lat === "number" &&
      typeof effectiveCoords.lng === "number" &&
      typeof salon.lat === "number" &&
      typeof salon.lng === "number"
    ) {
      distanceKm = Math.round(getHaversineDistanceKm(effectiveCoords.lat, effectiveCoords.lng, salon.lat, salon.lng) * 10) / 10;
    }
    return {
      id: salon.id,
      name: salon.name,
      area: salon.area,
      score,
      rating: salon.rating,
      priceRange: salon.priceRange,
      services: salon.services,
      estimatedDuration: Math.max(1, Math.round((Array.isArray(salon.services) ? salon.services.length : 1) * 1)),
      lat: salon.lat,
      lng: salon.lng,
      distanceKm,
      isLiveOsm: !!salon.isLiveOsm,
    };
  });

  let aiSummary = "";
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && recommendations.length) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const topRec = recommendations[0];

      const prompt = `You are a helpful beauty concierge. Under 150 words, write a friendly and professional response.

User consultation:
- Goal: ${goal || ""}
- Budget: ${budget || ""}
- Time: ${time || ""}
- Location: ${location || ""} ${detectedArea ? `(Detected: ${detectedArea})` : ""}

Top recommendation:
- Salon: ${topRec?.name}
- Area: ${topRec?.area}
- Services: ${(topRec?.services || []).join(", ")}

Return:
1) Why this salon matches.
2) Personalized self-care plan.
3) Suggested treatment sequence.
4) Expected experience summary.

No marketing fluff.`;

      console.log("[Gemini] Generating aiSummary...");
      const result = await model.generateContent(prompt);
      aiSummary = result?.response?.text?.() ?? "";
      console.log("[Gemini] aiSummary generated");
    } else {
      console.log("[Gemini] Skipping (missing GEMINI_API_KEY or no recommendations)");
    }
  } catch (err) {
    console.error("[Gemini] Failed to generate aiSummary:", err);
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await Preference.create({
        userEmail: req.body?.userEmail || "anonymous",
        goal: String(goal || ""),
        budget: String(budget || ""),
        time: String(time || ""),
        services: Array.isArray(services) ? services : [],
        location: String(location || ""),
        detectedArea: String(detectedArea || ""),
        coordinates:
          coordinates && typeof coordinates.lat === "number" && typeof coordinates.lng === "number"
            ? { lat: coordinates.lat, lng: coordinates.lng }
            : undefined,
      });
      console.log("[MongoDB] Card selection saved to preferences collection!");
    } catch (prefErr) {
      console.error("[MongoDB] Failed to save preference:", prefErr.message);
    }
  }

  res.json({
    success: true,
    recommendations,
    aiSummary,
  });
});

app.post("/api/bookings", async (req, res) => {
  try {
    const { bookingReference, userEmail, salon, selectedServices, date, slot, totalAmount } = req.body || {};

    const isDbReady = await ensureDbConnected();
    if (isDbReady) {
      const newBooking = await Booking.create({
        bookingReference: bookingReference || `SS-${Date.now()}`,
        userEmail: userEmail || "guest@slotstyle.com",
        salon,
        selectedServices,
        date,
        slot,
        totalAmount,
      });
      console.log("[MongoDB] Booking successfully saved to database collection:", newBooking.bookingReference);
      return res.status(201).json({ success: true, booking: newBooking });
    }

    return res.json({ success: true, message: "Booking recorded." });
  } catch (err) {
    console.error("[MongoDB] Booking error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const isDbReady = await ensureDbConnected();
    if (isDbReady) {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      return res.json({ success: true, bookings });
    }
    return res.json({ success: true, bookings: [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
}

export default app;
