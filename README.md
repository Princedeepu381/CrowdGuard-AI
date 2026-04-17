# 🛡️ CrowdGuard-AI

**CrowdGuard-AI** is a premium, real-time IoT-driven crowd management and safety command center designed for large-scale sporting venues, stadiums, and event spaces.

**🌐 Live Deployment:** [https://crowdguard-ai-362866275645.us-central1.run.app](https://crowdguard-ai-362866275645.us-central1.run.app)

![Live Demo Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

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
- **🚨 Automated Incident Logging:** Auto-scrolling, severity-coded live event feed logging all threshold breaches and hazard states.
- **⚙️ Manual Admin Override:** Full control panel allowing administrators to manually simulate congestion or trigger hazard states for emergency drill testing.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Custom CSS Modules (Glassmorphism + HUD animations)
- **Data Visualization:** Recharts
- **Icons:** Lucide-React
- **State Management:** React Hooks (`useState`, `useEffect`)

---

## 🚀 Getting Started

To run the Command Center locally on your machine:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Princedeepu381/CrowdGuard-AI.git
   cd CrowdGuard-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open the app:**
   Navigate to `http://localhost:3000` in your web browser.

---

## ☁️ Cloud Deployment

This project is fully containerized and configured for Google Cloud Run deployment.

1. Ensure the Google Cloud SDK (`gcloud`) is installed and authenticated.
2. Link your billing account to your GCP project.
3. Build and deploy using:
   ```bash
   gcloud run deploy crowdguard-ai --source . --region us-central1 --allow-unauthenticated
   ```

---

## 📐 Architecture Note

Currently, CrowdGuard-AI operates entirely client-side. The IoT telemetry is generated via an in-memory mock engine (`mockApi.ts`), meaning **no database or external backend server is required to run the application**. 

This makes it exceptionally lightweight, extremely fast to setup, and perfect for demonstrations, while retaining the structural foundation necessary to hook up a real WebSockets backend when moving to production.

---

*Built for hackathons, designed for reality. Ensure the safety of thousands with a single pane of glass.*
