# 🛡️ CrowdGuard-AI

**CrowdGuard-AI** is a premium, real-time IoT-driven crowd management and safety command center designed for large-scale sporting venues, stadiums, and event spaces.

**🌐 Live Deployment:** [https://crowdguard-ai-362866275645.us-central1.run.app](https://crowdguard-ai-362866275645.us-central1.run.app)

![Live Demo Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-33%20Passing-brightgreen?style=for-the-badge)

---

## 🌟 Chosen Vertical

**Smart Venue Safety & Crowd Management**

CrowdGuard-AI addresses a critical real-world problem: managing crowd density and safety in large-scale events where rapid decision-making can prevent stampedes, injuries, or worse. The system acts as an intelligent safety command layer for stadium operations staff.

---

## 🌟 Overview

CrowdGuard-AI transforms chaotic event security into a streamlined, proactive operation. Built with a stunning "Cyber-Command Center" glassmorphism UI, it integrates real-time simulated IoT telemetry to monitor zone capacities, identify potential hazards, and dynamically calculate the safest routing paths for crowd dispersal.

Whether it's managing post-event egress or handling emergency evacuations, CrowdGuard-AI provides venue administrators with unparalleled situational awareness.

---

## ✨ Key Features

- **🔴 Live IoT Telemetry Feed:** Real-time monitoring of up to 8 stadium zones (Alpha, Beta, Exits, Concourses) with live density and wait-time fluctuations every 3 seconds.
- **🗺️ Interactive Venue Schematic:** A dynamic SVG-based stadium map that lights up to reflect active hazard states and density levels.
- **🧠 AI Safety Routing Engine:** Client-side pathfinding algorithm that dynamically selects the fastest, safest route between any two zones, explicitly avoiding congested or hazardous areas.
- **📊 Real-Time Analytics:** Live-updating line and bar charts tracking historic density over the last 30 seconds for predictive crowd control.
- **🚨 Automated Incident Logging + Firebase:** Auto-scrolling, severity-coded live event feed that persists all threshold breaches and hazard events to **Firebase Realtime Database**.
- **⚙️ Manual Admin Override:** Full control panel allowing administrators to manually simulate congestion or trigger hazard states for emergency drill testing.
- **♿ Full Accessibility (WCAG 2.1 AA):** Skip-nav links, ARIA landmark roles, `aria-live` regions, `aria-label` on all controls, keyboard navigation with visible focus indicators, `prefers-reduced-motion` support, and high-contrast mode.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + Custom CSS (Glassmorphism + HUD) |
| Data Visualization | Recharts |
| Icons | Lucide-React |
| State Management | React Hooks (`useState`, `useEffect`, `useCallback`) |
| **Google Services** | **Firebase Realtime Database, Google Cloud Run** |
| Testing | Jest + ts-jest (33 unit tests) |

---

## 🔥 Google Services Integration

### Firebase Realtime Database
Every incident event (density threshold breach, hazard activation, admin overrides) is persisted to **Firebase Realtime Database** in real-time via `src/lib/firebaseService.ts`. This creates a full audit trail of safety events for post-event analysis.

- `logIncidentToFirebase()` — pushes each new incident event to the `crowdguard/incidents` path
- `subscribeToIncidents()` — live subscription for real-time sync across multiple operator terminals  
- `saveTelemetrySnapshot()` — periodic snapshots of venue state to `crowdguard/telemetry_snapshots`

### Google Cloud Run
The entire application is containerised with Docker and deployed to **Google Cloud Run** — a fully managed serverless platform. This provides:
- Auto-scaling from 0 to N instances  
- HTTPS out of the box  
- Zero infrastructure management

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- (Optional for full Firebase integration) A Firebase project with Realtime Database enabled

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Princedeepu381/CrowdGuard-AI.git
cd CrowdGuard-AI

# 2. Install dependencies
npm install

# 3. (Optional) Configure Firebase — copy and fill in .env.example
cp .env.example .env
# Add your Firebase credentials to .env

# 4. Start development server
npm start
# → App runs at http://localhost:3000
```

### Running Tests

```bash
npm test

# With coverage report
npm run test:coverage
```

All 33 unit tests cover:
- `routingEngine.ts` — safe route calculation, hazard avoidance, edge cases, all-exits-blocked
- `mockApi.ts` — status thresholds, INITIAL_ZONES validation, simulateTelemetry with overrides

---

## ☁️ Cloud Deployment

```bash
# Authenticate with Google Cloud
gcloud auth login

# Deploy to Cloud Run (builds Docker image automatically)
gcloud run deploy crowdguard-ai \
  --source . \
  --project YOUR_PROJECT_ID \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🔑 Approach & Logic

### Routing Algorithm
The AI routing engine follows a priority-based greedy approach:
1. Evaluate destination safety (density > 80% OR hazard = true → unsafe)
2. If unsafe, scan all `Exit_*` zones, filter to density ≤ 80 and hazard = false
3. Sort safe exits by density ascending — selects the least congested option
4. Insert safe intermediate concourse nodes if not already in path
5. Calculate time saved = `(blocked_exit_wait - safe_exit_wait) / 60`
6. Edge cases: shelter-in-place directive when ALL exits compromised

### Real-Time Simulation
IoT telemetry runs on a 3-second `setInterval` applying ±5% stochastic density fluctuations to each zone. Manual admin overrides freeze the zone to a specific value until reset.

---

## ♿ Accessibility

CrowdGuard-AI is built to **WCAG 2.1 AA** standards:

| Feature | Implementation |
|---|---|
| Skip navigation | `<a href="#main-content">` visible on focus |
| Landmark roles | `role="banner"`, `role="main"`, `role="complementary"`, `role="contentinfo"` |
| Live regions | `aria-live="assertive"` for critical hazard alerts, `role="log"` for incident feed |
| Form labels | All sliders and checkboxes have explicit `<label htmlFor>` associations |
| Progress bars | `role="progressbar"` with `aria-valuenow/min/max` on all density bars |
| Keyboard navigation | Visible `focus-visible` outline (2px electric blue) on all interactive elements |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables all CSS animations |
| High contrast | `@media (forced-colors: active)` maintains readability in Windows high contrast |

---

## 📐 Assumptions Made

1. IoT sensor data is simulated in-memory — in production, this would connect to a real MQTT broker or WebSocket stream
2. Firebase demo credentials are included for evaluation; production deployment would use environment variables
3. The routing algorithm uses a simplified graph (no real map topology) — demonstrating decision logic rather than geographic pathfinding
4. Density thresholds (60% moderate, 80% critical) are configurable constants matching industry safety standards

---

*Built for hackathons, designed for reality. Ensure the safety of thousands with a single pane of glass.*
