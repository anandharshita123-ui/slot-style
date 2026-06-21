# Slot&Style

### The Ultimate Matchmaker for Beauty Explorers

Slot&Style is an AI-powered beauty and wellness recommendation platform that helps users discover personalized self-care experiences, receive intelligent salon recommendations, and confidently book appointments.

---

## Overview

Slot&Style simplifies salon discovery by combining artificial intelligence with personalized recommendations. Instead of manually comparing numerous salons, users complete a consultation process and receive tailored recommendations based on their goals, preferences, budget, available time, and location.

The platform acts as a digital beauty concierge that guides users toward suitable salons and self-care experiences.

---

## Problem Statement

Finding the right beauty or wellness service can be difficult because users often face:

* Too many salon choices.
* Lack of personalized recommendations.
* Difficulty comparing prices and services.
* Uncertainty about quality.
* Time-consuming decision making.
* Information overload.

Traditional salon platforms focus on booking appointments. They do not help users determine which services or experiences best match their needs.

---

## Solution

Slot&Style provides an AI-powered consultation experience.

Users provide:

* Self-care goals
* Budget preferences
* Available time
* Service preferences
* Location preferences

The platform then:

* Matches suitable salons.
* Generates personalized recommendations.
* Provides AI-powered explanations.
* Summarizes salon experiences.
* Guides users toward the best self-care options.

---

## Key Features

* AI Consultation Wizard
* Personalized Self-Care Recommendations
* Smart Salon Matching Engine
* Google Gemini AI Integration
* AI Review Summarization
* Salon Recommendation System
* Salon Details Page
* Service Selection
* Appointment Booking Flow
* Responsive User Interface
* Mobile-Friendly Experience
* Delhi-focused Salon Discovery

---

## User Flow

```text
Landing Page
        ↓
Login / Signup
        ↓
Consultation Wizard
        ↓
Goal
Budget
Time
Location
Services
        ↓
Backend API
        ↓
Recommendation Engine
        ↓
Top 5 Salon Matches
        ↓
Google Gemini AI
        ↓
AI Explanation and Review Summary
        ↓
Salon Details Page
        ↓
Service Selection
        ↓
Booking Screen
        ↓
Appointment Confirmation
```

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

```text
User Input
      ↓
Express Backend
      ↓
Salon Matching Engine
      ↓
Top Matching Salons
      ↓
Google Gemini API
      ↓
Personalized Suggestions
Review Summaries
Recommendations
      ↓
Frontend User Interface
```

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

| Name | Role |
| ---- | ---- |
|      |      |
|      |      |
|      |      |

---

## Hackathon Information

| Field     | Details      |
| --------- | ------------ |
| Hackathon |              |
| Theme     |              |
| Team Name | Trailblazers |

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

  