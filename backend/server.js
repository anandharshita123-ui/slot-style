import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();

app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────────────────────────────
// Simple email/password auth (no Firebase)
// ──────────────────────────────────────────────────────────────────────
function readUsers() {
  try {
    const p = path.join(process.cwd(), "data", "users.json");
    if (!fs.existsSync(p)) return [];
    const raw = fs.readFileSync(p, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  const p = path.join(process.cwd(), "data", "users.json");
  fs.writeFileSync(p, JSON.stringify(users, null, 2), "utf8");
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

const salonsPath = path.join(process.cwd(), "data", "salons.json");
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

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const e = normalizeEmail(email);
  const p = String(password || "");

  if (!validateEmail(e)) {
    return res.status(400).json({ success: false, message: "Invalid email or password." });
  }
  if (!validatePassword(p)) {
    return res.status(400).json({ success: false, message: "Invalid email or password." });
  }

  const users = readUsers();
  const found = users.find((u) => u.email === e);
  if (!found || found.password !== p) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  return res.json({ success: true, message: "Signed in." });
});

app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body || {};
  const e = normalizeEmail(email);
  const p = String(password || "");
  const n = String(name || "").trim();

  if (!n) return res.status(400).json({ success: false, message: "Unable to create account." });
  if (!validateEmail(e)) return res.status(400).json({ success: false, message: "Please enter a valid email address." });
  if (!validatePassword(p)) return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

  const users = readUsers();
  if (users.some((u) => u.email === e)) {
    return res.status(409).json({ success: false, message: "Account already exists. Please sign in." });
  }

  users.push({ name: n, email: e, password: p, createdAt: new Date().toISOString() });
  writeUsers(users);

  return res.json({ success: true, message: "Account created." });
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

    // If user chose services that align with goal, boost. (Simple & readable)
    return Math.round((hits / target.length) * 20);
  }

  function timeMatchScore(salon) {
    const t = String(time || "").trim();
    if (!t) return 0;

    // Convert user's label into a weight bucket.
    const tWeight = timeMap[t];
    if (!tWeight) return 0;

    // Estimate salon duration from their service count (lightweight hackathon approach).
    // More services => longer time.
    const salonEstimatedDurationHours = Math.max(1, Math.round((Array.isArray(salon.services) ? salon.services.length : 1) * 1));

    // Prefer salons where estimated duration isn't drastically longer than available.
    // Use tWeight as rough hours tier: 1->1h, 2->2h, 4->3h+, 6->6h-ish.
    const availableTierHours = tWeight <= 2 ? tWeight : tWeight <= 4 ? 3 : 6;
    const diff = Math.abs(availableTierHours - salonEstimatedDurationHours);
    const maxDiff = availableTierHours;

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

  res.json({
    success: true,
    recommendations,
    aiSummary,
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});