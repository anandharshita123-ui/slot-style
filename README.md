# Slot&Style

AI-Powered Salon Discovery & Smart Beauty Recommendation Platform

Slot&Style is an intelligent beauty and wellness platform that helps users stop guessing and start choosing the right salon experiences confidently.

Instead of manually browsing hundreds of salons, users get personalized, AI-driven recommendations based on their goals, budget, time, and location.

The system acts as a smart beauty concierge that understands user intent and matches them with the most relevant salons and services.

---
## Overview

Problem

Users struggle to find the right salon or beauty service because:

Too many choices with no guidance
No personalization in existing platforms
Difficulty comparing price, quality, and services
Time-consuming decision-making
Lack of trust in unknown salons

Most platforms only support booking—not decision-making.

💡 Solution

Slot&Style solves this by introducing an AI-based consultation and recommendation system.

Users provide:

Beauty goals
Budget range
Available time
Preferred services
Location

The system then:

Analyzes user intent
Matches relevant salons using weighted scoring
Enhances results using AI (Gemini)
Explains why a salon is recommended

---

## Key Features

AI-Powered Consultation Wizard
Smart Salon Recommendation Engine
Personalized Matching Based on User Preferences
Google Gemini AI Integration
AI Review Summarization
Service-Based Filtering (Hair, Spa, Makeup, etc.)
Appointment Booking Flow
Responsive Mobile-First UI
Location-Based Salon Discovery

---

## User Flow

Landing Page
   ↓
Authentication (Login / Signup)
   ↓
AI Consultation Wizard
   ↓
User Inputs:
- Goal
- Budget
- Time
- Services
- Location
   ↓
Recommendation Engine (Backend)
   ↓
Top Matched Salons (Ranked)
   ↓
Gemini AI Explanation + Review Summary
   ↓
Salon Details Page
   ↓
Service Selection
   ↓
Booking Confirmation

---

## Recommendation Engine

The recommendation engine uses weighted scoring to rank salons.

| Factor         | Weight |
| -------------- | -----: |
| Location Match |     40 |
| Service Match  |     30 |
| Budget Match   |     20 |
| Rating Bonus   |     10 |

The highest-scoring salons are returned as recommendations.

---

## AI Workflow

User Preferences
      ↓
Express Backend API
      ↓
Weighted Recommendation Engine
      ↓
Top Matching Salons
      ↓
Google Gemini AI
      ↓
AI-Generated Insights:
- Why this salon matches
- Review summarization
- Personalized suggestions
      ↓
Frontend Display
---

## System Architecture

```text
React + Vite Frontend
            ↓
Express Backend API
            ↓
Recommendation Engine
            ↓
Salon Dataset
            ↓
Google Gemini API
            ↓
AI Recommendations
            ↓
User Interface
```

---

## Technology Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* Shadcn UI

### Backend

* Node.js
* Express.js

### Artificial Intelligence

* Google Gemini API

### Data Layer

* JSON Dataset
* Browser Local Storage

### Deployment

* Vercel

---

## Project Structure

```bash
slot-style/
│
├── backend/
│   ├── data/
│   │   ├── salons.json
│   │   ├── users.json
│   │   └── README-salons.txt
│   │
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── guidelines/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── styles/
│   └── main.tsx
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone <repository-url>
cd slot-style
```

### Install Frontend Dependencies

```bash
npm install
```

### Start the Frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Start the Backend Server

```bash
node server.js
```

Backend:

```text
http://localhost:5000
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
GEMINI_API_KEY=your_gemini_api_key
```

---

## API Endpoint

### POST /api/recommendation

Request:

```json
{
  "goal": "Relaxation",
  "budget": 4000,
  "time": "2 Hours",
  "services": ["Massage"],
  "location": "Saket"
}
```

Response:

```json
{
  "success": true,
  "recommendations": []
}
```

---

## Responsive Design

The application is optimized for:

* Mobile Devices
* Tablets
* Laptops
* Desktop Systems

---

## Screenshots

Add project screenshots here.

### Landing Page

Insert screenshot.

### Consultation Wizard

Insert screenshot.

### AI Recommendations

Insert screenshot.

### Salon Details

Insert screenshot.

### Booking Screen

Insert screenshot.

---

## Architecture Diagram

Insert the system architecture diagram here.

---

## Demo Video

Add the project demonstration video link here.

---

## Team Information

### Team Name

Trailblazers

| Name     | Role                    |
| harshita | backend                 | 
|          | and AI integration      |
| priyansh | frontend                |
|          | development             |
|          |                         |
   
---

## Hackathon Information

| Field     | Details                       |
| --------- | ---------------------         |         
| Hackathon |  AI Startup Buildathon 2026 – |               Salon Marketplace Challenge  |        
| Theme     |  Beauty salon                 |
| Team Name |  Trailblazers                 |

---

## Future Scope

* Real-time appointment booking
* Payment gateway integration
* User profiles
* Booking history
* Salon dashboards
* Recommendation learning
* Multi-city support
* AI beauty assistant

---

## Key Highlights

* AI-powered beauty recommendations
* Personalized self-care planning
* Smart salon matching engine
* Google Gemini integration
* Review summarization
* Responsive design
* End-to-end booking experience

---

## License

This project was developed for educational, innovation, and hackathon purposes.

---

Built by Team Trailblazers.

  