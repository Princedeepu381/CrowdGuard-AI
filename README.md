# 🛡️ CrowdGuard-AI (ICC Edition)

**CrowdGuard-AI** is a premium, real-time safety command center designed for large-scale sporting venues, stadiums, and event spaces. This version features a high-end "ICC Style" landing page aesthetic, prioritising visual excellence and critical safety telemetry.

**🌐 Live Deployment:** [https://crowdguard-ai-362866275645.us-central1.run.app](https://crowdguard-ai-362866275645.us-central1.run.app)

![Live Demo Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## 🌟 Chosen Vertical

**Smart Venue Safety & Crowd Management**

CrowdGuard-AI addresses the critical challenge of managing crowd density in high-stakes environments. By combining real-time telemetry with AI-driven insights, the platform enables venue operators to make split-second decisions that ensure fan safety during capacity events.

---

## ✨ Key Features

- **🏆 ICC-Style Premium UI**: A complete visual overhaul inspired by modern high-end sports platforms, featuring glassmorphism, fluid animations (Outfit typography), and a scrolling single-page layout.
- **🤖 Gemini AI Smart Fallback**: An intelligent analysis engine that tries the Google Gemini API first but falls back to a sophisticated local tactical engine. It generates 100% realistic, data-driven security reports based on live venue state.
- **📍 High-Contrast Circular Map**: A realistic stadium schematic (SVG-based) that provides instant visual feedback on sector density and active hazard statuses.
- **📈 Real-Time Monitoring**: Live-updating metrics for average density, hazard counts, and active safety protocols, all synced via **Firebase Realtime Database**.
- **🚦 Tactical Overrides**: A built-in Admin Suite to simulate emergency scenarios, trigger hazards, and test site-wide safety responses in real-time.
- **📱 Fully Responsive**: Optimized for command center displays and mobile tablets for on-ground security personnel.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Vanilla CSS (ICC Glassmorphism) + Tailwind Utilities |
| **Backend/DB** | Firebase Realtime Database |
| **AI/ML** | Google Gemini 1.5 (Pro/Flash) with Tactical Fallback |
| **Icons** | Lucide-React |
| **Deployment**| Google Cloud Run |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Princedeepu381/CrowdGuard-AI.git
cd CrowdGuard-AI
npm install
```

### 2. Environment Variables
Create a `.env` file in the root based on the provided keys (VITE_ prefixed):
- `VITE_FIREBASE_API_KEY`
- `VITE_GEMINI_API_KEY` (Optional for AI fallback)

### 3. Run Locally
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 📐 AI Intelligence & Logic

### Tactical Fallback System
The system is designed for **100% uptime**. If the Gemini API is blocked or the key is missing, the AI Core switches to a local deterministic model that:
1. Analyzes all 8 telemetry nodes.
2. Identifies the "hottest" and "safest" zones.
3. Generates a context-aware 2-sentence tactical recommendation (e.g., *"⚠️ CRITICAL: Elevated density in Zone Alpha. Redirect egress flow via Zone Delta corridor immediately."*)

---

## ♿ Accessibility

CrowdGuard-AI is built with safety in mind for all users:
- **ARIA Landmark Roles**: Proper structural markup for screen readers.
- **Visible Focus States**: High-contrast outlines for keyboard navigation.
- **Live Regions**: Assertive announcements for hazard activation.

---

*Transforming venue safety from reactive to proactive. Designed for the heart of the action.*
