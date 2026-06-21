# Development Guidelines

## 1. Purpose

This document defines the architectural principles, development standards, coding practices, and engineering decisions followed during the development of Slot&Style.

The objective of these guidelines is to ensure:

* Code consistency
* Maintainability
* Scalability
* Readability
* Collaboration efficiency
* Long-term extensibility

These standards should be followed by all contributors and future developers working on the project.

---

## 2. Project Objectives

Slot&Style is designed as an AI-powered beauty and wellness recommendation platform that delivers personalized self-care experiences through intelligent salon matching and recommendation systems.

The system aims to:

* Reduce decision fatigue.
* Improve salon discovery.
* Provide personalized recommendations.
* Simplify booking decisions.
* Deliver an AI-first user experience.

---

## 3. Architectural Principles

### 3.1 Separation of Concerns

Each layer of the system has a clearly defined responsibility.

| Layer                 | Responsibility    |
| --------------------- | ----------------- |
| Frontend              | User Interface    |
| Backend               | API Handling      |
| Recommendation Engine | Business Logic    |
| Gemini AI             | Personalization   |
| Dataset               | Salon Information |

No layer should directly handle the responsibilities of another layer.

---

### 3.2 Modular Design

The application follows a modular architecture.

Benefits:

* Easier maintenance
* Better code organization
* Faster debugging
* Future scalability
* Component reusability

---

### 3.3 AI-Assisted Decision Making

Artificial intelligence enhances recommendations but does not replace deterministic business logic.

The recommendation engine determines the best salons.

Gemini AI provides:

* Explanations
* Personalization
* Recommendation summaries
* Review insights

---

## 4. Frontend Standards

### Technology Stack

* React
* Vite
* TypeScript
* Tailwind CSS
* Shadcn UI

### Development Principles

* Keep components reusable.
* Avoid duplicated UI code.
* Maintain responsive layouts.
* Use meaningful component names.
* Prefer composition over large components.

---

### Component Naming

Correct:

```text
SalonCard.tsx
BookingScreen.tsx
RecommendationCard.tsx
```

Avoid:

```text
Card1.tsx
NewComponent.tsx
Test.tsx
```

---

### State Management

* Keep state close to where it is used.
* Avoid unnecessary prop drilling.
* Store temporary recommendation data locally.
* Keep API responses isolated from UI state.

---

## 5. Backend Standards

### Technology Stack

* Node.js
* Express.js

### API Design Principles

* RESTful endpoints.
* JSON responses.
* Predictable structures.
* Proper error handling.

Success Response:

```json
{
  "success": true,
  "data": {}
}
```

Error Response:

```json
{
  "success": false,
  "message": "Invalid request."
}
```

---

## 6. Recommendation Engine Standards

The recommendation engine uses weighted scoring.

| Criteria       | Weight |
| -------------- | -----: |
| Location Match |     40 |
| Service Match  |     30 |
| Budget Match   |     20 |
| Rating Bonus   |     10 |

### Rules

* Higher scores rank higher.
* Top five results are returned.
* Recommendations must remain explainable.
* Logic should remain deterministic.

---

## 7. AI Integration Standards

Google Gemini API is used exclusively for:

* Recommendation explanations
* Personalized suggestions
* Review summarization
* User guidance

AI should not:

* Replace recommendation scoring.
* Directly rank salons.
* Override business logic.

The recommendation engine always executes before AI processing.

---

## 8. Data Management Standards

Current implementation uses JSON-based storage.

Data files:

* salons.json
* users.json

Future migration:

* PostgreSQL
* MongoDB
* Firebase

### Salon Schema

```json
{
  "id": 1,
  "name": "",
  "area": "",
  "services": [],
  "priceRange": 0,
  "rating": 0,
  "category": "",
  "description": ""
}
```

---

## 9. Security Guidelines

### Environment Variables

Sensitive information must remain inside `.env` files.

Examples:

```env
GEMINI_API_KEY=xxxxx
```

### Security Rules

* Never commit API keys.
* Validate request inputs.
* Sanitize user data.
* Handle invalid requests safely.
* Avoid exposing internal logic.

---

## 10. Code Quality Standards

All code should satisfy the following principles.

### Readability

Code should be understandable without excessive comments.

### Maintainability

Functions should remain small and focused.

### Reusability

Avoid duplicated logic.

### Simplicity

Prefer simple solutions over unnecessary complexity.

---

## 11. Naming Conventions

### Variables

```javascript
selectedServices
userLocation
recommendations
```

### Functions

```javascript
calculateScore()
generateRecommendations()
fetchRecommendations()
```

### Constants

```javascript
MAX_RESULTS
LOCATION_WEIGHT
SERVICE_WEIGHT
```

---

## 12. Folder Structure Principles

```text
backend/
    data/
    server.js

src/
    app/
    components/
    styles/
```

Rules:

* Group related files.
* Avoid deep nesting.
* Keep business logic separated.
* Keep UI components reusable.

---

## 13. Performance Guidelines

* Minimize unnecessary API calls.
* Avoid repeated calculations.
* Keep frontend rendering efficient.
* Load only required data.
* Optimize user interactions.

---

## 14. Responsiveness Standards

The application must support:

* Mobile devices
* Tablets
* Laptops
* Desktop systems

Layouts should remain usable across all screen sizes.

---

## 15. Testing Requirements

### Frontend Testing

* Navigation flow
* Form validation
* Responsiveness
* User interactions

### Backend Testing

* API responses
* Error handling
* Recommendation scoring

### AI Testing

* Prompt accuracy
* Recommendation quality
* Response formatting

---

## 16. Git Standards

### Branch Naming

```text
feature/recommendation-engine
feature/booking-flow
bugfix/login-screen
```

### Commit Messages

```text
feat: add recommendation engine
fix: resolve booking issue
refactor: improve salon matching
```

---

## 17. Contribution Workflow

1. Create a feature branch.
2. Implement changes.
3. Test functionality.
4. Verify responsiveness.
5. Review code quality.
6. Merge changes.

---

## 18. Future Scalability

The current architecture supports future enhancements including:

* Database integration
* Authentication system
* Payment gateway
* Real-time booking
* User profiles
* Recommendation learning
* Admin dashboard
* Multi-city support

---

## 19. Engineering Goals

The development of Slot&Style follows the following principles:

* User-first design.
* AI-assisted experiences.
* Explainable recommendations.
* Maintainable code.
* Scalable architecture.
* Modular development.

---

## 20. Maintainers

**Team Name:** Trailblazers

Project: Slot&Style

This document serves as the official development and engineering guideline for the Slot&Style platform.
