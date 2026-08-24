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

const DEFAULT_URI = "mongodb+srv://admin:slotandstyleadmin1@cluster0.0drvk0y.mongodb.net/slotstyle?retryWrites=true&w=majority";
const MONGODB_URI = (process.env.MONGODB_URI || DEFAULT_URI).trim();

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

function scoreSalon({ salon, services, budget, location }) {
  // Location Match (+40)
  // If user selected "Use Current Location", treat it as a wildcard for Delhi.
  let locationScore = 0;
  if (location === "CURRENT") {
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

app.post("/api/recommendation", async (req, res) => {
  console.log("Received Data:", req.body);

  const { goal, budget, time, services, location } = req.body || {};

  const userLocation = parseLocation(location);

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

  function goalMatchScore() {
    const g = String(goal || "").trim();
    if (!g) return 0;

    const target = goalMap[g] || [];
    if (!target.length) return 0;

    const selectedServices = (Array.isArray(services) ? services : []).map(normalizeService);
    const salonServices = (Array.isArray(services) ? target : target).map(normalizeService);
    let hits = 0;
    for (const s of salonServices) {
      if (selectedServices.includes(s)) hits += 1;
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

  const scored = (Array.isArray(salons) ? salons : [])
    .map((salon) => {
      const base = scoreSalon({ salon, services, budget, location: userLocation });
      const goalScore = goalMatchScore();
      const timeScore = timeMatchScore(salon);
      const total = base + goalScore + timeScore;
      return { salon, score: total, goalScore, timeScore, baseScore: base };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const recommendations = scored.map(({ salon, score }) => ({
    id: salon.id,
    name: salon.name,
    area: salon.area,
    score,
    rating: salon.rating,
    priceRange: salon.priceRange,
    services: salon.services,
    estimatedDuration: Math.max(1, Math.round((Array.isArray(salon.services) ? salon.services.length : 1) * 1)),
  }));

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
- Location: ${location || ""}

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

    if (mongoose.connection.readyState === 1) {
      const newBooking = await Booking.create({
        bookingReference: bookingReference || `SS-${Date.now()}`,
        userEmail: userEmail || "guest@slotstyle.com",
        salon,
        selectedServices,
        date,
        slot,
        totalAmount,
      });
      console.log("[MongoDB] Booking saved to bookings collection!");
      return res.status(201).json({ success: true, booking: newBooking });
    }

    return res.json({ success: true, message: "Booking recorded." });
  } catch (err) {
    console.error("[MongoDB] Booking error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
}

export default app;
