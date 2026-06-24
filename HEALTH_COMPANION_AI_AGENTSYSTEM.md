# HEALTH COMPANION AI AGENT SYSTEM

## Objective

Build an enterprise-grade AI-powered health tracking system inside a React Native mobile application.

The AI Assistant is not a standalone chatbot.

The AI Assistant is the central intelligence layer of the application and acts as the primary interface between users and all health-tracking modules.

The assistant must understand natural language, extract health events, update Firestore, synchronize application state, maintain contextual memory, trigger analytics, and coordinate multiple specialized agents.

---

# Technology Stack

Frontend:
- React Native
- TypeScript
- React Navigation
- Zustand or Redux Toolkit
- React Query

Backend:
- Firebase Authentication
- Firebase Firestore
- Firebase Cloud Functions
- Firebase Cloud Messaging

Media:
- Cloudinary

AI Layer:
- Embedded Multi-Agent Architecture
- Function Calling
- Context Engine
- Event Processing Pipeline
- Memory System

Offline Support:
- AsyncStorage
- Local Queue System
- Background Synchronization

---

# Core Philosophy

The user should never need to manually navigate through forms to update health data.

Instead the assistant should understand conversational language and update the application automatically.

Example:

User:
"I drank 1 litre of water"

Assistant:
"Great. I've added 1 litre to today's hydration log. Your total hydration today is now 3.5 litres."

The hydration dashboard updates automatically.

The streaks update automatically.

The insights engine updates automatically.

The analytics update automatically.

---

# Multi-Agent Architecture

Build a hidden multi-agent system.

The user only interacts with a single assistant.

Internally the system contains:

1. Hydration Agent
2. Nutrition Agent
3. Sleep Agent
4. Habit Agent
5. Insight Agent

Architecture:

User Message
↓
Assistant Orchestrator
↓
Intent Detection Engine
↓
Relevant Agent
↓
Structured Event
↓
Firestore Update
↓
Analytics Engine
↓
Dashboard Refresh

---

# Assistant Orchestrator

Responsibilities:

- Receive all user messages
- Understand context
- Determine intent
- Route to correct agent
- Aggregate responses
- Execute actions
- Return final response

Supported Intent Categories:

- Hydration Logging
- Meal Logging
- Sleep Logging
- Habit Logging
- Goal Management
- Progress Queries
- Analytics Requests
- Health Insights
- General Conversations

---

# Hydration Agent

Responsibilities:

- Detect hydration-related messages
- Extract quantities
- Normalize units
- Update hydration records
- Track daily totals
- Track weekly totals
- Track monthly totals
- Trigger hydration insights

Examples:

"I drank 500 ml water"

"I had two glasses of water"

"I finished a 1 litre bottle"

"I drank some water"

If quantity is unclear:

Assistant:
"How much water did you drink?"

Never estimate hydration quantities.

Always ask for clarification.

Hydration Agent must support:

ml
litres
cups
glasses
bottles

Convert everything into ml.

Store standardized values.

Example:

1 litre → 1000 ml

---

# Sleep Agent

Responsibilities:

Track:

- Sleep Start Time
- Sleep End Time
- Sleep Duration
- Sleep Quality
- Sleep Consistency

Example:

"I slept from 11 pm to 7 am"

Extract:

Sleep Start
Sleep End
Duration

Store all three.

Example Firestore Entry:

{
  "sleepStart": "2026-06-14T23:00:00",
  "sleepEnd": "2026-06-15T07:00:00",
  "durationHours": 8
}

If information is incomplete:

Assistant asks follow-up questions.

---

# Nutrition Agent

Responsibilities:

Understand natural language meal descriptions.

Examples:

"I ate 1 bowl rice"

"I had biryani for lunch"

"I ate 2 bananas and an apple"

"I drank a protein shake"

The system must:

1. Identify food items
2. Estimate serving sizes
3. Estimate calories
4. Estimate macronutrients

Store:

- Food Name
- Serving Size
- Calories
- Protein
- Carbohydrates
- Fat

The nutrition system should support multiple food items in a single message.

Example:

"I ate 2 bananas and 1 apple"

Creates three separate food entries.

---

# Habit Agent

Responsibilities:

Track habit completion.

Support progress-based habits.

Example:

Habit:
Meditation

Goal:
30 minutes

User:
"I meditated for 15 minutes"

Update:

Goal = 30 min
Completed = 15 min

User:
"I meditated another 10 minutes"

Update:

Goal = 30 min
Completed = 25 min

The assistant should always maintain cumulative progress.

Support:

- Meditation
- Exercise
- Reading
- Journaling
- Custom Habits

---

# Insight Agent

Responsibilities:

Generate proactive insights.

Examples:

Hydration:

"You usually drink 2 litres by noon. Today you've only consumed 800 ml."

Sleep:

"Your average sleep duration has decreased by 1.2 hours this week."

Nutrition:

"You've exceeded your daily sugar target three days in a row."

Habits:

"You are on a 12-day meditation streak."

Insights should be generated automatically.

---

# Event Sourcing System

Every user action becomes an immutable event.

Never directly overwrite historical data.

Example:

{
  "eventType": "hydration",
  "value": 1000,
  "unit": "ml",
  "timestamp": "2026-06-14T12:00:00Z"
}

Benefits:

- Auditability
- Analytics
- Trend Analysis
- AI Learning
- Recovery

---

# Firestore Data Structure

users
  └── userId

      profile

      hydration_logs

      sleep_logs

      meal_logs

      habit_logs

      health_events

      goals

      streaks

      analytics

      assistant_memory

---

# Assistant Memory System

The assistant should maintain memory.

Examples:

Preferred wake-up time

Water goals

Meal preferences

Habit preferences

Common foods

Workout patterns

The memory system should be stored inside Firestore.

assistant_memory

This memory should improve future responses.

---

# Cross-Application Updates

When an event is logged:

Update:

1. Firestore
2. Dashboard
3. Progress Widgets
4. Analytics
5. Streaks
6. Goals
7. AI Memory
8. Insight Engine

All updates should happen automatically.

---

# Inference + Confirmation Behavior

If user clearly intends to log data:

Example:

"I drank 1 litre water"

Immediately update.

Then respond:

"Added 1 litre to today's hydration log."

If user casually mentions something:

Example:

"I had biryani for lunch."

Assistant:

"It sounds like you'd like me to log biryani for lunch. Should I add it to today's meal log?"

Wait for confirmation.

---

# Offline Support

Requirements:

If device is offline:

Store events locally.

Queue updates.

Persist in AsyncStorage.

When internet returns:

Sync automatically.

Resolve conflicts safely.

Never lose user data.

---

# Function Calling Layer

Create functions:

logHydration()

logMeal()

logSleep()

logHabit()

updateGoal()

getAnalytics()

generateInsights()

updateMemory()

syncOfflineEvents()

Each agent should invoke functions rather than directly manipulating UI state.

---

# Analytics Engine

Generate:

Daily Reports

Weekly Reports

Monthly Reports

Metrics:

Hydration Trends

Sleep Trends

Calorie Trends

Protein Trends

Habit Completion Rates

Streak Analytics

Goal Achievement Rates

---

# AI Response Guidelines

Responses must be:

- Friendly
- Brief
- Action-oriented
- Context-aware

Examples:

Hydration Logged:
"Added 500 ml to today's hydration total. You're now at 2.1 litres."

Habit Progress:
"Nice work. Meditation progress is now 25/30 minutes."

Sleep Logged:
"I've recorded 8 hours of sleep for last night."

---

# Production Requirements

Implement:

- Clean Architecture
- Feature-Based Folder Structure
- Repository Pattern
- Firestore Security Rules
- TypeScript Types
- Zod Validation
- Error Handling
- Retry Logic
- Offline Sync
- Background Jobs
- Unit Tests
- Integration Tests
- Agent Testing
- Analytics Testing

The final implementation should be scalable, production-ready, and capable of supporting hundreds of thousands of users.