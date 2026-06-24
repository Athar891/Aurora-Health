<div align="center">
  <img src="https://via.placeholder.com/150x150?text=Aurora+Logo" alt="Aurora Health & Hydration Logo" width="150"/>
  <h1>Aurora Health & Hydration</h1>
  <p><strong>Intelligent AI-powered health tracking, nutrition logging, and wellness insights.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-brightgreen.svg" alt="Platforms" />
    <img src="https://img.shields.io/badge/Framework-Expo%20%7C%20React%20Native-blue.svg" alt="Framework" />
    <img src="https://img.shields.io/badge/Database-Firebase-yellow.svg" alt="Database" />
    <img src="https://img.shields.io/badge/License-MIT-purple.svg" alt="License" />
  </p>
</div>

---

## 📖 Overview

Aurora Health & Hydration is a modern, cross-platform mobile application designed to simplify personal wellness. It replaces fragmented health tracking apps by offering an intelligent, unified dashboard for hydration, nutrition, sleep, and habit tracking. 

Built with an offline-first architecture and powered by Gemini AI, Aurora features an intelligent **Voice Live Assistant** that allows users to interact with their health data naturally, receiving personalized insights and seamless data logging without manual entry.

### 🎯 Target Audience
Individuals seeking a frictionless way to track their daily wellness metrics and those who benefit from AI-driven insights to maintain healthy habits.

---

## ✨ Features

- **AI-Powered Voice Assistant:** Log meals, water, and sleep purely through natural voice commands using Gemini AI integration.
- **Advanced Nutrition Logging:** Search a local database, add custom foods, and track daily macro goals (Calories, Protein, Carbs, Fat) dynamically.
- **Hydration & Sleep Tracking:** Visualize weekly progress with beautiful, custom Activity Rings and bar charts.
- **Habit Tracking:** Maintain daily streaks and measure consistency.
- **Offline-First Architecture:** Log data securely on your device; Aurora synchronizes automatically when you reconnect via Firebase.
- **Cross-Platform:** Beautiful, fluid UI tailored for both iOS and Android platforms via Expo.

---

## 🏗️ Architecture & Technology Stack

The application leverages a robust serverless architecture to ensure rapid synchronization and offline capabilities.

- **Frontend Framework:** React Native / Expo
- **Language:** TypeScript
- **State Management:** Zustand
- **Database & Sync:** Firebase Cloud Firestore (offline persistence enabled)
- **Authentication:** Firebase Auth (Apple, Google, Email/Password)
- **AI Services:** Google Gemini API
- **Media Storage:** Cloudinary
- **Navigation:** Expo Router
- **Icons:** Phosphor Icons

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS only) or Android Studio Emulator

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aurora-health.git
   cd aurora-health
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and fill in your credentials.
   ```bash
   cp .env.example .env
   ```
   *Note: Do not commit your `.env` file to version control.*

### Running Locally

Start the Expo development server:
```bash
npx expo start
```
- Press `i` to open in iOS Simulator.
- Press `a` to open in Android Emulator.

---

## 🔐 Security Configuration

Security and privacy are foundational to Aurora.

- **Environment Variables:** All sensitive keys (Firebase config, Cloudinary credentials, Gemini API key) are injected via `.env`.
- **Database Security:** Firestore is locked down using strict Security Rules `request.auth.uid == userId`, ensuring complete data isolation between users.
- **Authentication:** Sessions are managed securely via Firebase Auth, using native providers where possible.
- **Media Uploads:** Cloudinary handles media uploads. (Note: Production deployments should migrate from unsigned to signed uploads for enhanced security).

---

## 📁 Project Structure

```text
aurora/
├── app/                  # Expo Router pages and layouts
│   ├── (tabs)/           # Main tab navigation screens
│   ├── (modals)/         # Pop-up modals and deep-dive screens
│   └── (onboarding)/     # Authentication and setup flows
├── src/
│   ├── components/       # Reusable UI components (charts, shared, ui)
│   ├── config/           # Firebase and Cloudinary integrations
│   ├── data/             # Local offline databases (e.g., Food DB)
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API, Auth, and AI orchestration logic
│   ├── stores/           # Zustand global state management
│   ├── theme/            # Design tokens, colors, typography, styles
│   └── types/            # TypeScript interfaces and models
├── assets/               # Static images and fonts
├── .env.example          # Environment variable templates
└── app.json              # Expo configuration
```

---

## 🛣️ Roadmap

- [ ] **Phase 2 Nutrition:** Integration with Open Food Facts API for infinite barcode scanning.
- [ ] **Cloud Functions:** Migration of AI agent orchestration to a secure backend Node.js environment.
- [ ] **Wearable Integration:** Sync steps and heart rate via Apple HealthKit and Google Fit.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Please ensure your code follows the existing TypeScript conventions and passes all linting checks.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

If you encounter any issues or have feature requests, please [open an issue](https://github.com/your-username/aurora-health/issues) on GitHub. 
