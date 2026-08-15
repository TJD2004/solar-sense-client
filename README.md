# ☀️ SolarSense Frontend — Intelligent Solar Energy Dashboard

> **SolarSense Client** is a responsive, real-time React web application designed for intelligent solar energy monitoring, AI performance anomaly detection, appliance load scheduling, and live Digital Twin visualization.

### 🌐 Live Demo: [https://solar-sense-ai.vercel.app](https://solar-sense-ai.vercel.app)

---

## ✨ Features

- **⚡ Real-Time Energy Flow**: Live animated diagram rendering power distribution between Solar Panels, Inverter, Home Load, Battery Storage, and Grid Net Export.
- **📊 12-Metric Telemetry Stream**: Flashing real-time packet stream displaying AC Voltage, AC Frequency, DC Voltage, DC Current, Solar Irradiance, Panel Temp, Ambient Temp, Power Factor, Inverter Efficiency, Battery Flow, and Grid Net.
- **🌐 Multilingual Support (i18n)**:
  - 🇬🇧 **English** (Default)
  - 🇮🇳 **हिंदी** (Hindi)
  - 🇮🇳 **मराठी** (Marathi)
  - Seamless navbar selector with `localStorage` persistence across sessions.
- **🤖 AI Performance Detective**: LLM-grounded insights analyzing generation curves to diagnose cloud cover, tree shading, panel dust/soiling, or inverter hardware faults.
- **💬 Solar AI Copilot**: Interactive assistant for natural language queries about solar generation, cost savings, carbon offset, and health status.
- **📅 Smart Appliance Scheduler**: Calculates optimal daylight windows with maximum solar surplus for high-power home appliances.
- **🎮 Integrated Control Room**: Connects via WebSockets to the standalone Digital Twin Control Room (`http://localhost:5174`).

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Custom CSS + Tailwind CSS (Cyber Dark Theme)
- **Charts & Gauges**: Recharts & Custom SVG Chakra Ring Gauge
- **Icons**: Lucide React
- **Networking & Real-Time**: Socket.IO Client & Axios API layer
- **Internationalization**: Custom React i18n Context (`LanguageContext`)

---

## 📁 Directory Structure

```text
client/
├── src/
│   ├── components/
│   │   ├── AIInsight/        # AI Performance Detective card
│   │   ├── SolarFlow/        # Animated energy flow diagram
│   │   ├── EnergyChart/      # Today's generation vs consumption curve
│   │   ├── HealthScore/      # Signature Chakra Ring Gauge
│   │   └── common/           # TopBar, NavTabs, TelemetryStream, StatTile, ImpactCards
│   ├── context/
│   │   └── SimulationContext.jsx  # Socket.IO listener & twin state manager
│   ├── i18n/
│   │   ├── translations.js   # Centralized English, Hindi, and Marathi dictionary
│   │   └── LanguageContext.jsx # Language state & localStorage provider
│   ├── pages/
│   │   ├── Dashboard/        # Hero dashboard with live telemetry & energy flow
│   │   ├── Analytics/        # Historical production & consumption breakdown
│   │   ├── Forecast/         # 7-day expected solar output forecast
│   │   ├── Scheduler/        # Smart solar surplus appliance window finder
│   │   ├── Copilot/          # AI Chat assistant
│   │   └── Simulator/        # Digital twin control page
│   ├── services/
│   │   ├── api.js            # Axios client pointing to Express backend (Port 4000)
│   │   └── simulator.js      # Local physics simulation fallback engine
│   ├── App.jsx               # Navigation router & i18n/simulation providers
│   ├── main.jsx              # React DOM entry point
│   └── index.css             # Cyberpunk dark theme tokens & custom scrollbars
├── vite.config.js            # Port 5173 configuration & backend API proxy
└── package.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The application will start at `http://localhost:5173`.

---

## 🔌 API & Backend Integration

By default, the client attempts to connect to the Express Backend API at `http://localhost:4000` via WebSockets (`Socket.IO`).

- If the backend server is running, the top bar badge will display **`LIVE DIGITAL TWIN`**.
- If the backend server is unreachable, the client gracefully falls back to local simulation mode (**`LOCAL FALLBACK`**), ensuring zero downtime.

---

## 📜 License

MIT License — Free for open-source & educational use.