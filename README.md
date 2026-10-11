# 🧠 MindTwin AI — Personal Digital Twin Platform

[![Live Web App](https://img.shields.io/badge/Live_App-Vercel-black?style=for-the-badge&logo=vercel)](https://mindtwin-ai.vercel.app)
[![API Status](https://img.shields.io/badge/Backend_API-Railway-0B0D0E?style=for-the-badge&logo=railway)](https://backend-production-3fee.up.railway.app/api/health)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![ML Engine](https://img.shields.io/badge/AI_Engine-Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org)

An intelligent, full-stack personal digital twin platform that synthesizes multi-stream biometric and behavioral telemetry (sleep cycles, cardiovascular signals, screen latency, and subjective mood ratings) into machine-learning powered behavioral forecasts and circadian insights.

---

## 🔗 Live Deployments

- 🌐 **Production Web Application:** [https://mindtwin-ai.vercel.app](https://mindtwin-ai.vercel.app)
- ⚙️ **Production Backend API (Health Check):** [https://backend-production-3fee.up.railway.app/api/health](https://backend-production-3fee.up.railway.app/api/health)

---

## 🏛️ Architecture Overview

```text
[ React 19 + Vite Frontend on Vercel ]
       │
       ├──► 1. Real-time Telemetry & Bio-Sync (JWT Authenticated)
       ├──► 2. Interactive Charts (Sleep, Resting HR, Screen Time)
       └──► 3. Daily Mood Logging & Subjective Feedback
       │
       ▼
[ Express.js REST API on Railway (Docker Container) ]
       │
       ├──► 1. MongoDB Atlas (Users, Biometrics, Mood History)
       └──► 2. ML Prediction Service (HistGradientBoosting / Python Bridge)
```

---

## 🚀 Key Features

1. **Digital Twin OS & Bio-Telemetry Visualization:**
   - Real-time tracking of sleep duration, heart rate variation (HRV), and screen-time latency.
   - Circadian Health Score algorithm (0-100) reflecting recovery equilibrium.

2. **AI Health & Behavioral Insights:**
   - Synthesizes physiological baseline trends into actionable circadian feedback.
   - HistGradientBoosting mood forecasting engine with automated local fallback.

3. **Multi-User Profile Calibration:**
   - Biological age, daily target sleep, and device telemetry sync.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS, Recharts, Lucide Icons
- **Backend:** Node.js 20, Express 5, Mongoose, JWT, Python 3 / Scikit-learn
- **Database:** MongoDB Atlas (Cloud)
- **Deployment:** Vercel (Frontend), Railway (Backend Docker Container)
