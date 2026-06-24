# Aurora — Backend Architecture Design

---

## 1. Architecture Overview

Aurora uses a **serverless, Firebase-native backend** with three supporting services:

| Layer | Technology | Purpose |
|---|---|---|
| **Authentication** | Firebase Auth | Email/password, Google, Apple sign-in |
| **Database** | Cloud Firestore | All user data, health logs, habits, AI memories |
| **Server Logic** | Firebase Cloud Functions (v2, Node.js/TS) | AI agent orchestration, Cloudinary signatures, cron insights |
| **AI** | Firebase AI Logic (Gemini Developer API) | Client-side text generation; server-side tool-calling agent |
| **Media Storage** | Cloudinary | Profile pictures, meal photos |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Hydration, sleep, habit, and insight reminders |

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   React Native (Expo) Client                │
│                                                             │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Firebase  │  │ Firestore │  │ Firebase │  │Cloudinary │  │
│  │ Auth SDK  │  │ Client SDK│  │ AI Logic │  │Upload SDK │  │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └─────┬─────┘  │
└───────┼──────────────┼─────────────┼───────────────┼────────┘
        │              │             │               │
        ▼              ▼             │               ▼
  ┌──────────┐  ┌───────────┐       │        ┌───────────┐
  │ Firebase │  │ Firestore │       │        │Cloudinary │
  │   Auth   │  │ Database  │       │        │   API     │
  └──────────┘  └───────────┘       │        └───────────┘
                       ▲            │
                       │            ▼
                ┌──────┴──────────────────┐
                │  Cloud Functions (v2)   │
                │                         │
                │  • AI Agent (Gemini     │
                │    tool-calling)        │
                │  • Cloudinary Signer    │
                │  • Daily Insights Cron  │
                │  • Streak Calculator    │
                └─────────────────────────┘
```

### Client vs. Server Responsibility Split

| Operation | Where | Why |
|---|---|---|
| CRUD on health logs, habits, nutrition | **Client → Firestore directly** | Simple writes; secured by Firestore rules |
| User profile reads/writes | **Client → Firestore directly** | Owner-only access via rules |
| AI health companion (voice agent) | **Client → Cloud Function** | Requires tool-calling, Firestore admin writes, prompt security |
| Cloudinary upload signature | **Client → Cloud Function** | Secret key must stay server-side |
| Daily insight generation | **Cloud Function (scheduled)** | Runs per-user aggregate queries, calls Gemini |
| Streak calculation | **Firestore trigger (Cloud Function)** | Updates streak counters on each log write |
| Push notifications | **Cloud Function (scheduled + triggered)** | Server-side FCM dispatch |

---

## 2. Firebase Auth Configuration

### Providers

| Provider | Method | Status |
|---|---|---|
| Email/Password | Native Firebase Auth | Required |
| Google | OAuth via Firebase Auth | Required |
| Apple | OAuth via Firebase Auth | Required (iOS App Store policy) |

### firebase.json Auth Block

```json
{
  "auth": {
    "providers": {
      "emailPassword": true,
      "googleSignIn": {
        "oAuthBrandDisplayName": "Aurora Health",
        "supportEmail": "support@aurorahealth.app"
      }
    }
  }
}
```

> Apple Sign-In must be configured in the Firebase Console (not CLI-provisioned).

### Auth State Management

- The React Native client uses `onAuthStateChanged` listener
- The Firebase user `uid` is the primary key linking all Firestore documents
- ID tokens are automatically refreshed by the client SDK
- Cloud Functions receive the ID token via `onCall` callable functions (auto-verified)

---

## 3. Firestore Data Model

### Database Configuration

- **Edition**: Enterprise (for composite index support and higher throughput)
- **Location**: Co-located with Cloud Functions region (recommended: `asia-south1` for India, or `us-central1`)

### Collection Structure

```
users/
  {userId}/
    ├── profile              (document — single doc per user)
    ├── preferences          (document — single doc per user)
    ├── goals/               (subcollection)
    │     └── {goalId}
    ├── hydrationLogs/       (subcollection)
    │     └── {logId}
    ├── sleepLogs/           (subcollection)
    │     └── {logId}
    ├── habits/              (subcollection)
    │     └── {habitId}
    │           └── completions/  (sub-subcollection)
    │                 └── {completionId}
    ├── nutritionLogs/       (subcollection)
    │     └── {logId}
    ├── streaks/             (document — single doc per user)
    ├── insights/            (subcollection)
    │     └── {insightId}
    └── aiMemories/          (subcollection)
          └── {memoryId}
```

### Document Schemas

#### `users/{userId}/profile`

```typescript
interface UserProfile {
  uid: string;              // Firebase Auth uid
  email: string;
  name: string;
  age: number;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say";
  heightCm: number;
  weightKg: number;
  profilePhotoUrl?: string; // Cloudinary URL
  onboardingComplete: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `users/{userId}/preferences`

```typescript
interface UserPreferences {
  wakeUpTime: string;       // "07:00" (HH:mm, 24h)
  bedtime: string;          // "23:00"
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  hydrationGoalMl: number;  // Calculated or user-set (e.g., 2500)
  notifications: {
    hydrationReminders: boolean;
    sleepReminders: boolean;
    habitReminders: boolean;
    dailyInsights: boolean;
  };
  units: {
    volume: "ml" | "oz";
    weight: "kg" | "lbs";
    height: "cm" | "ft";
  };
  fcmToken?: string;        // For push notifications
}
```

#### `users/{userId}/goals/{goalId}`

```typescript
interface HealthGoal {
  id: string;
  goalType:
    | "improve-hydration"
    | "sleep-better"
    | "build-habits"
    | "eat-healthier"
    | "improve-energy"
    | "improve-consistency";
  active: boolean;
  createdAt: Timestamp;
}
```

#### `users/{userId}/hydrationLogs/{logId}`

```typescript
interface HydrationLog {
  id: string;
  amountMl: number;
  loggedAt: Timestamp;        // When the water was consumed
  createdAt: Timestamp;       // When the record was created
  source: "manual" | "voice"; // How it was logged
}
```

#### `users/{userId}/sleepLogs/{logId}`

```typescript
interface SleepLog {
  id: string;
  durationHours: number;     // Calculated from start/end
  sleepStart: Timestamp;
  sleepEnd: Timestamp;
  date: string;              // "2026-06-13" — for easy querying by date
  source: "manual" | "voice";
  createdAt: Timestamp;
}
```

#### `users/{userId}/habits/{habitId}`

```typescript
interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekdays" | "weekends" | "custom";
  customDays?: number[];     // 0=Sun, 1=Mon, ... 6=Sat (when frequency is "custom")
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `users/{userId}/habits/{habitId}/completions/{completionId}`

```typescript
interface HabitCompletion {
  id: string;
  completedDate: string;     // "2026-06-13"
  status: "completed" | "skipped";
  createdAt: Timestamp;
}
```

#### `users/{userId}/nutritionLogs/{logId}`

```typescript
interface NutritionLog {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  description?: string;      // What the user ate
  calories: number;
  protein: number;           // grams
  carbs: number;             // grams
  fats: number;              // grams
  photoUrl?: string;         // Cloudinary URL for meal photo
  date: string;              // "2026-06-13"
  source: "manual" | "voice";
  createdAt: Timestamp;
}
```

#### `users/{userId}/streaks`

```typescript
interface UserStreaks {
  hydration: {
    current: number;
    longest: number;
    lastCompletedDate: string;
  };
  sleep: {
    current: number;
    longest: number;
    lastLoggedDate: string;
  };
  habits: {
    current: number;
    longest: number;
    lastCompletedDate: string;
  };
  nutrition: {
    current: number;
    longest: number;
    lastLoggedDate: string;
  };
  overallConsistencyScore: number; // 0–100
  achievements: string[];         // ["first-week", "hydration-30-days", ...]
  updatedAt: Timestamp;
}
```

#### `users/{userId}/insights/{insightId}`

```typescript
interface Insight {
  id: string;
  type: "daily" | "weekly" | "monthly";
  category: "hydration" | "sleep" | "habits" | "nutrition" | "general";
  title: string;
  body: string;
  actionable: boolean;
  read: boolean;
  generatedAt: Timestamp;
}
```

#### `users/{userId}/aiMemories/{memoryId}`

```typescript
interface AIMemory {
  id: string;
  memoryType: "pattern" | "preference" | "observation";
  observation: string;       // "Frequently misses hydration goals on Mondays"
  confidence: number;        // 0.0–1.0
  createdAt: Timestamp;
  expiresAt?: Timestamp;     // Optional TTL for stale memories
}
```

### Firestore Indexes (Composite)

| Collection | Fields | Query Purpose |
|---|---|---|
| `hydrationLogs` | `loggedAt` DESC | Today's logs, history view |
| `sleepLogs` | `date` DESC | Sleep history, weekly/monthly trends |
| `nutritionLogs` | `date` DESC, `mealType` ASC | Daily meal breakdown |
| `habits` | `active` ASC, `createdAt` DESC | Active habits list |
| `habits/{id}/completions` | `completedDate` DESC | Recent completions |
| `insights` | `type` ASC, `generatedAt` DESC | Latest insights by type |

---

## 4. Firestore Security Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ──── Helper Functions ────
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidTimestamp(field) {
      return field is timestamp;
    }

    // ──── Users ────
    match /users/{userId} {

      // Profile
      match /profile {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId)
          && request.resource.data.keys().hasAll(["uid", "email", "name", "createdAt"])
          && request.resource.data.uid == userId;
        allow update: if isOwner(userId)
          && !("uid" in request.resource.data.diff(resource.data).affectedKeys())
          && !("email" in request.resource.data.diff(resource.data).affectedKeys());
        allow delete: if false;
      }

      // Preferences
      match /preferences {
        allow read, write: if isOwner(userId);
      }

      // Goals
      match /goals/{goalId} {
        allow read, write: if isOwner(userId);
      }

      // Hydration Logs
      match /hydrationLogs/{logId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId)
          && request.resource.data.amountMl is number
          && request.resource.data.amountMl > 0
          && request.resource.data.amountMl <= 5000;
        allow update: if isOwner(userId);
        allow delete: if isOwner(userId);
      }

      // Sleep Logs
      match /sleepLogs/{logId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId)
          && request.resource.data.durationHours is number
          && request.resource.data.durationHours > 0
          && request.resource.data.durationHours <= 24;
        allow update: if isOwner(userId);
        allow delete: if isOwner(userId);
      }

      // Habits and Completions
      match /habits/{habitId} {
        allow read, write: if isOwner(userId);

        match /completions/{completionId} {
          allow read, write: if isOwner(userId);
        }
      }

      // Nutrition Logs
      match /nutritionLogs/{logId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId)
          && request.resource.data.mealType in ["breakfast", "lunch", "dinner", "snack"]
          && request.resource.data.calories is number
          && request.resource.data.calories >= 0;
        allow update: if isOwner(userId);
        allow delete: if isOwner(userId);
      }

      // Streaks (read only from client; written by Cloud Functions)
      match /streaks {
        allow read: if isOwner(userId);
        allow write: if false; // Only Cloud Functions (admin SDK) can write
      }

      // Insights (read only from client; written by Cloud Functions)
      match /insights/{insightId} {
        allow read: if isOwner(userId);
        allow update: if isOwner(userId)
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(["read"]);
        allow create, delete: if false; // Only Cloud Functions
      }

      // AI Memories (read only from client; written by Cloud Functions)
      match /aiMemories/{memoryId} {
        allow read: if isOwner(userId);
        allow write: if false; // Only Cloud Functions (AI agent)
      }
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 5. Cloud Functions API Surface

All Cloud Functions use **v2 callable functions** (`onCall`) with automatic auth token verification.

### Function Registry

| Function Name | Trigger | Purpose |
|---|---|---|
| `aiHealthAgent` | `onCall` (HTTPS callable) | Voice agent: receives transcript, executes tools, returns response |
| `generateCloudinarySignature` | `onCall` (HTTPS callable) | Returns signed upload params for Cloudinary |
| `onHydrationLogCreated` | `onDocumentCreated` (Firestore trigger) | Updates streak counters |
| `onSleepLogCreated` | `onDocumentCreated` (Firestore trigger) | Updates streak counters |
| `onHabitCompletionCreated` | `onDocumentCreated` (Firestore trigger) | Updates streak counters |
| `onNutritionLogCreated` | `onDocumentCreated` (Firestore trigger) | Updates streak counters |
| `generateDailyInsights` | `onSchedule` (daily cron, 6:00 AM user-local) | Generates personalized daily insight for each user |
| `generateWeeklyReport` | `onSchedule` (weekly cron, Monday 8:00 AM) | Generates weekly summary insight |
| `sendReminders` | `onSchedule` (runs every 30 minutes) | Sends hydration/sleep/habit FCM notifications based on user preferences |

---

### 5.1 AI Health Agent — `aiHealthAgent`

This is the **most critical function** in the backend.

#### Architecture: Speech → STT → LLM (Tool Calling) → TTS

```
┌────────────────────┐
│   React Native     │
│   Client           │
│                    │
│  1. Record audio   │
│  2. STT (on-device │
│     or Gemini)     │
│  3. Send transcript│────────┐
│                    │        │
│  6. Play TTS audio │◄───────┤
└────────────────────┘        │
                              ▼
                   ┌──────────────────────┐
                   │   Cloud Function:    │
                   │   aiHealthAgent      │
                   │                      │
                   │  4. Gemini 2.5 Flash │
                   │     with tools       │
                   │                      │
                   │  5. Execute tool     │
                   │     calls on         │
                   │     Firestore        │
                   │                      │
                   │  Return: text +      │
                   │  optional TTS audio  │
                   └──────────────────────┘
```

#### Request / Response Contract

```typescript
// Request (client → function)
interface AIAgentRequest {
  transcript: string;           // User's spoken text (after STT)
  conversationHistory?: {       // Last N turns for context
    role: "user" | "model";
    text: string;
  }[];
}

// Response (function → client)
interface AIAgentResponse {
  text: string;                 // AI's response text
  actionsPerformed: {           // What the agent did
    action: string;             // e.g., "created_hydration_log"
    details: Record<string, any>;
  }[];
  audioBase64?: string;         // Optional TTS audio (base64 encoded)
}
```

#### System Prompt

```
You are Aurora, a warm and supportive personal health companion. You help users
track their hydration, sleep, habits, and nutrition. You speak with a calm,
precise, and encouraging tone — like a knowledgeable friend, never a doctor.

Guidelines:
- Be supportive and positive, never judgmental
- Use plain, precise language (no exclamation marks, no "oops" or "yay")
- When users mention health data, use tools to log it
- When users ask about their data, use tools to retrieve it
- Provide actionable, concise suggestions
- Reference their patterns and streaks when relevant
- Never provide medical diagnoses or prescribe treatments

Today's date: {currentDate}
User's name: {userName}
User's goals: {userGoals}
```

#### Tool Definitions (Gemini Function Calling)

```typescript
const agentTools = [
  {
    name: "log_hydration",
    description: "Log water intake for the user",
    parameters: {
      type: "object",
      properties: {
        amountMl: { type: "number", description: "Amount of water in milliliters" }
      },
      required: ["amountMl"]
    }
  },
  {
    name: "log_sleep",
    description: "Log a sleep record for the user",
    parameters: {
      type: "object",
      properties: {
        durationHours: { type: "number", description: "Total sleep duration in hours" },
        sleepStart: { type: "string", description: "Sleep start time (ISO 8601)" },
        sleepEnd: { type: "string", description: "Sleep end time (ISO 8601)" }
      },
      required: ["durationHours"]
    }
  },
  {
    name: "create_habit",
    description: "Create a new habit for the user to track",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Name of the habit" },
        description: { type: "string", description: "Optional description" },
        frequency: { type: "string", enum: ["daily", "weekdays", "weekends"], description: "How often" }
      },
      required: ["title", "frequency"]
    }
  },
  {
    name: "complete_habit",
    description: "Mark a habit as completed for today",
    parameters: {
      type: "object",
      properties: {
        habitTitle: { type: "string", description: "Title of the habit to complete" }
      },
      required: ["habitTitle"]
    }
  },
  {
    name: "log_meal",
    description: "Log a nutrition entry",
    parameters: {
      type: "object",
      properties: {
        mealType: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
        description: { type: "string", description: "What was eaten" },
        calories: { type: "number" },
        protein: { type: "number" },
        carbs: { type: "number" },
        fats: { type: "number" }
      },
      required: ["mealType", "calories"]
    }
  },
  {
    name: "get_today_hydration",
    description: "Get user's hydration progress for today",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "get_today_sleep",
    description: "Get last night's sleep data",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "get_today_habits",
    description: "Get today's habits and their completion status",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "get_weekly_summary",
    description: "Get a summary of all health data for the past 7 days",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "update_hydration_goal",
    description: "Update the user's daily hydration goal",
    parameters: {
      type: "object",
      properties: {
        goalMl: { type: "number", description: "New daily hydration goal in ml" }
      },
      required: ["goalMl"]
    }
  },
  {
    name: "update_user_preferences",
    description: "Update user preferences like wake-up time or bedtime",
    parameters: {
      type: "object",
      properties: {
        wakeUpTime: { type: "string", description: "HH:mm format" },
        bedtime: { type: "string", description: "HH:mm format" },
        activityLevel: { type: "string", enum: ["sedentary", "light", "moderate", "active"] }
      }
    }
  },
  {
    name: "save_memory",
    description: "Save a behavioral observation about the user for future reference",
    parameters: {
      type: "object",
      properties: {
        observation: { type: "string", description: "The pattern or preference observed" },
        memoryType: { type: "string", enum: ["pattern", "preference", "observation"] }
      },
      required: ["observation", "memoryType"]
    }
  }
];
```

#### Tool Execution Flow

```
1. Client sends { transcript, conversationHistory }
2. Function loads user context:
   - Profile (name, goals)
   - Preferences (hydration goal, times)
   - Today's data (hydration total, sleep, habits)
   - Recent AI memories (last 10)
3. Constructs system prompt with user context
4. Calls Gemini 2.5 Flash with tools
5. If Gemini returns tool_calls:
   a. Execute each tool against Firestore (admin SDK)
   b. Collect results
   c. Send results back to Gemini for final response
6. Return response text (+ optional TTS audio) to client
```

---

### 5.2 Cloudinary Integration — `generateCloudinarySignature`

```typescript
// Request
interface SignatureRequest {
  folder: "profile" | "meals";
  publicId?: string;  // Optional custom public ID
}

// Response
interface SignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId: string;
}
```

#### Cloudinary Configuration

- **Cloud Name**: Stored in Firebase environment config
- **API Key**: Stored in Firebase environment config
- **API Secret**: Stored in Firebase Secret Manager (never exposed to client)
- **Upload Preset**: `aurora_unsigned` for unsigned uploads (restricted by folder)
- **Folders**: `aurora/profiles/{userId}`, `aurora/meals/{userId}/{date}`
- **Transformations**: Auto-quality, auto-format, max width 1200px (applied on delivery URL)

#### Media URL Pattern

```
Profile:  https://res.cloudinary.com/{cloud}/image/upload/c_fill,w_200,h_200,q_auto,f_auto/aurora/profiles/{userId}
Meals:    https://res.cloudinary.com/{cloud}/image/upload/c_limit,w_800,q_auto,f_auto/aurora/meals/{userId}/{date}/{logId}
```

---

### 5.3 Streak Calculator — Firestore Triggers

Triggered on every log creation across all four tracking categories.

```typescript
// Pseudocode for streak calculation
function calculateStreak(category: string, userId: string) {
  const today = todayDateString();  // "2026-06-13"
  const streakDoc = await getStreakDoc(userId);
  const lastDate = streakDoc[category].lastCompletedDate;

  if (lastDate === today) {
    return; // Already counted today
  }

  const yesterday = yesterdayDateString();

  if (lastDate === yesterday) {
    // Consecutive day — increment
    streakDoc[category].current += 1;
  } else if (lastDate < yesterday) {
    // Streak broken — reset
    streakDoc[category].current = 1;
  }

  // Update longest if needed
  if (streakDoc[category].current > streakDoc[category].longest) {
    streakDoc[category].longest = streakDoc[category].current;
  }

  streakDoc[category].lastCompletedDate = today;
  streakDoc.updatedAt = now();

  // Check for achievements
  checkAndAwardAchievements(streakDoc);

  await updateStreakDoc(userId, streakDoc);
}
```

#### Achievement Badges

| Badge ID | Criteria |
|---|---|
| `first-log` | First log in any category |
| `hydration-7-days` | 7-day hydration streak |
| `hydration-30-days` | 30-day hydration streak |
| `sleep-7-days` | 7-day sleep logging streak |
| `all-habits-today` | All habits completed in a single day |
| `week-perfect` | All four categories logged every day for a week |
| `consistency-80` | Overall consistency score ≥ 80 for 7 consecutive days |

---

### 5.4 Insights Engine — `generateDailyInsights`

Scheduled Cloud Function that runs daily at 6:00 AM (configurable per user timezone).

```typescript
// Insight generation flow
async function generateDailyInsight(userId: string) {
  // 1. Gather last 7 days of data
  const hydrationLogs = await getLast7DaysHydration(userId);
  const sleepLogs = await getLast7DaysSleep(userId);
  const habitCompletions = await getLast7DaysHabitCompletions(userId);
  const nutritionLogs = await getLast7DaysNutrition(userId);
  const preferences = await getUserPreferences(userId);
  const goals = await getUserGoals(userId);

  // 2. Compute aggregates
  const aggregates = {
    avgDailyWaterMl: average(hydrationLogs.map(l => l.amountMl)),
    hydrationGoalHitRate: percentage(daysMetGoal, 7),
    avgSleepHours: average(sleepLogs.map(l => l.durationHours)),
    sleepConsistency: calculateSleepConsistency(sleepLogs),
    habitCompletionRate: percentage(completedHabits, totalDueHabits),
    avgDailyCalories: average(nutritionLogs.map(l => l.calories)),
  };

  // 3. Call Gemini to generate natural-language insight
  const insight = await generateInsightWithGemini(aggregates, goals, preferences);

  // 4. Store in Firestore
  await storeInsight(userId, {
    type: "daily",
    category: insight.category,
    title: insight.title,
    body: insight.body,
    actionable: insight.actionable,
    read: false,
    generatedAt: now(),
  });
}
```

---

### 5.5 Push Notifications — `sendReminders`

Runs every 30 minutes. For each user whose notification window overlaps, sends contextual FCM messages.

| Notification Type | Trigger Condition | Example Message |
|---|---|---|
| Hydration | Behind pace for the day (< expected %) | "You're one glass away from today's goal." |
| Sleep | Approaching user's bedtime | "Your usual bedtime is approaching." |
| Habit | Uncompleted daily habits past noon | "You have 2 habits remaining for today." |
| Insight | New daily insight generated | "Your daily health insight is ready." |

---

## 6. Speech-to-Text / Text-to-Speech Strategy

### STT (Speech-to-Text)

| Option | Approach | Latency | Cost |
|---|---|---|---|
| **Primary** | On-device STT via `expo-speech` / `@react-native-voice/voice` | Low | Free |
| **Fallback** | Send audio to Gemini 2.5 Flash (multimodal audio input) | Medium | API cost |

**Recommendation**: Use on-device STT for speed. The transcript is then sent to the `aiHealthAgent` Cloud Function.

### TTS (Text-to-Speech)

| Option | Approach | Latency | Cost |
|---|---|---|---|
| **Primary** | On-device TTS via `expo-speech` | Low | Free |
| **Fallback** | Google Cloud TTS API (called from Cloud Function) | Medium | API cost |

**Recommendation**: Use on-device TTS for MVP. Higher quality Cloud TTS can be toggled via Remote Config later.

---

## 7. Firebase AI Logic Integration

### Client-Side Usage (Simple Queries)

For non-agentic queries (e.g., "What's a good bedtime routine?"), use Firebase AI Logic directly from the client:

```typescript
import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const app = initializeApp(firebaseConfig);
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

// Simple question — no tools needed
const result = await model.generateContent("What foods are high in protein?");
```

### Server-Side Usage (Agent with Tools)

For agentic interactions (tool calling, data reads/writes), use the `@google/generative-ai` SDK in Cloud Functions:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools: [{ functionDeclarations: agentTools }],
});
```

> The server-side approach is required for tool calling because tools execute Firestore admin writes that must not be exposed to the client.

---

## 8. Environment & Secrets

| Secret | Storage | Access |
|---|---|---|
| `GEMINI_API_KEY` | Firebase Secret Manager | Cloud Functions only |
| `CLOUDINARY_API_SECRET` | Firebase Secret Manager | Cloud Functions only |
| `CLOUDINARY_API_KEY` | Firebase environment config | Cloud Functions only |
| `CLOUDINARY_CLOUD_NAME` | Firebase environment config | Cloud Functions + client (public) |

Firebase configuration (non-secret) is embedded in the client app via `firebaseConfig`.

---

## 9. Cloud Functions Project Structure

```
functions/
├── src/
│   ├── index.ts                    # Function exports
│   ├── config/
│   │   ├── firebase.ts             # Admin SDK init
│   │   └── gemini.ts               # Gemini client init
│   ├── agents/
│   │   ├── healthAgent.ts          # AI agent orchestrator
│   │   ├── systemPrompt.ts         # System prompt builder
│   │   └── tools/
│   │       ├── hydrationTools.ts   # log_hydration, get_today_hydration
│   │       ├── sleepTools.ts       # log_sleep, get_today_sleep
│   │       ├── habitTools.ts       # create_habit, complete_habit, get_today_habits
│   │       ├── nutritionTools.ts   # log_meal
│   │       ├── summaryTools.ts     # get_weekly_summary
│   │       ├── preferenceTools.ts  # update_hydration_goal, update_user_preferences
│   │       └── memoryTools.ts      # save_memory
│   ├── triggers/
│   │   ├── streakCalculator.ts     # Firestore triggers for streak updates
│   │   └── achievementChecker.ts   # Badge/achievement logic
│   ├── scheduled/
│   │   ├── dailyInsights.ts        # Cron: generate daily insights
│   │   ├── weeklyReport.ts         # Cron: generate weekly report
│   │   └── sendReminders.ts        # Cron: push notifications
│   ├── media/
│   │   └── cloudinarySignature.ts  # Cloudinary upload signer
│   └── utils/
│       ├── dates.ts                # Date helpers (timezone-aware)
│       └── aggregations.ts         # Data aggregation helpers
├── package.json
├── tsconfig.json
└── .env                            # Local dev secrets (gitignored)
```

---

## 10. Error Handling Strategy

### Client-Facing Errors

All callable functions return structured errors:

```typescript
interface AuroraError {
  code: string;       // "auth/unauthenticated", "validation/invalid-amount", etc.
  message: string;    // Human-readable, following Style.md voice
}
```

Error messages follow the naturalist design voice:
- ✅ "Unable to save hydration log. Check your connection and try again."
- ❌ "Oops! Something went wrong! 😱"

### Retry & Resilience

- Gemini API calls: 3 retries with exponential backoff (1s, 2s, 4s)
- Firestore writes in tool execution: Batched writes with transaction rollback on failure
- FCM failures: Logged and retried on next cron cycle; stale FCM tokens cleaned up

---

## 11. Rate Limiting & Quotas

| Resource | Limit | Strategy |
|---|---|---|
| Gemini API (Developer tier) | 15 RPM free tier | Rate-limit per user in Cloud Functions |
| Firestore reads | 50,000/day (free tier) | Optimize queries; use date-partitioned subcollections |
| Firestore writes | 20,000/day (free tier) | Batch streak updates |
| Cloud Functions invocations | 2M/month (free tier) | Monitor via Firebase console |
| Cloudinary | 25 credits/month (free tier) | Limit upload size; compress on client |

---

## 12. Deployment

### Firebase Project Setup

```bash
# 1. Create project
npx -y firebase-tools@latest projects:create aurora-health --display-name "Aurora Health"

# 2. Initialize services
npx -y firebase-tools@latest init firestore functions auth

# 3. Initialize AI Logic
npx -y firebase-tools@latest init ailogic

# 4. Deploy everything
npx -y firebase-tools@latest deploy
```

### CI/CD Pipeline (Recommended)

```
GitHub Push → GitHub Actions → Run Tests → Deploy Cloud Functions → Deploy Firestore Rules
```

---

## 13. Monitoring & Observability

| Aspect | Tool |
|---|---|
| Function errors | Firebase Console → Functions → Logs |
| Performance | Cloud Monitoring dashboards |
| Firestore usage | Firebase Console → Firestore → Usage |
| Gemini API usage | Google Cloud Console → API Dashboard |
| Crash reporting | Firebase Crashlytics (mobile client) |
| Alerts | Cloud Monitoring alerts on error rate > 1% |