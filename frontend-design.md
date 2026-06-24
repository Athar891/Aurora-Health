# Aurora - AI-Powered Mobile Health Companion
## Master Product Requirements Document (PRD) for Coding LLM

---

# Project Overview

Aurora is an AI-powered mobile health companion designed to help users understand their health patterns and build healthier routines through actionable insights.

Unlike traditional health applications that primarily collect data, Aurora focuses on transforming health data into understandable recommendations, personalized coaching, and habit-building experiences.

The product should feel like:

- A personal health companion
- A supportive coach
- An intelligent assistant
- A daily wellness partner

The product should NOT feel like:

- A medical application
- A clinical dashboard
- A complicated analytics tool
- A calorie-counting obsession platform

---

# Primary Objective

Build a functional mobile MVP that demonstrates:

- Health Tracking
- Personalized Insights
- Voice AI Interaction
- Habit Formation
- Progress Monitoring
- Agentic Health Assistance

The application must provide a complete end-to-end user experience.

---

# Success Criteria

The final prototype should allow a user to:

1. Create an account
2. Complete onboarding
3. Configure health preferences
4. Track hydration
5. Track sleep
6. Track habits
7. Track nutrition
8. Receive personalized insights
9. Interact with a voice-enabled AI health companion
10. Allow AI to perform actions through conversation

---

# Target Users

Health-conscious individuals who want:

- Better hydration habits
- Better sleep quality
- Stronger consistency
- Better routines
- Better self-awareness

Age range:

- 18–45

Technical skill level:

- Beginner to Intermediate

---

# Core Product Philosophy

Every feature should answer:

"How can Aurora help users better understand themselves?"

The system should prioritize:

- Awareness
- Consistency
- Education
- Positive reinforcement

Over:

- Perfection
- Pressure
- Competition
- Complexity

---

# Platform Requirements

## Mobile Application

Required:

- React Native
- Expo

Platforms:

- iOS
- Android

---

# Backend Requirements

Backend must be API-driven.

Recommended stack:

- FastAPI or Node.js
- PostgreSQL or Supabase
- REST APIs

Requirements:

- Authentication APIs
- User APIs
- Health Tracking APIs
- Habit APIs
- Nutrition APIs
- AI APIs
- Insights APIs

---

# Database Entities

## Users

Fields:

- id
- email
- password_hash
- name
- age
- gender
- height
- weight
- created_at
- updated_at

---

## User Preferences

Fields:

- user_id
- wake_up_time
- bedtime
- activity_level
- hydration_goal
- notification_preferences

---

## Health Goals

Fields:

- id
- user_id
- goal_type
- created_at

Examples:

- Improve Hydration
- Sleep Better
- Build Better Habits
- Eat Healthier
- Improve Energy Levels
- Improve Consistency

---

## Hydration Logs

Fields:

- id
- user_id
- amount_ml
- logged_at

---

## Sleep Logs

Fields:

- id
- user_id
- sleep_duration_hours
- sleep_start
- sleep_end
- created_at

---

## Habits

Fields:

- id
- user_id
- title
- description
- frequency
- active
- created_at

---

## Habit Completions

Fields:

- id
- habit_id
- completed_date
- status

Status:

- completed
- skipped

---

## Nutrition Logs

Fields:

- id
- user_id
- meal_type
- calories
- protein
- carbs
- fats
- created_at

Meal Types:

- breakfast
- lunch
- dinner
- snack

---

## AI Memories (Optional)

Fields:

- id
- user_id
- memory_type
- observation
- created_at

Examples:

- Frequently misses hydration goals
- Sleeps longer on weekends
- Consistent morning habits

---

# Functional Requirements

---

# Module 1: Intro & Onboarding

## Landing Screen

Display:

"Understand yourself better every day."

Purpose:

Introduce Aurora as a personal health companion.

---

## Onboarding Slides

Slide 1:

Meet your personal health companion.

Slide 2:

Track hydration, sleep, habits, and nutrition.

Slide 3:

Receive personalized insights.

Slide 4:

Build healthier routines through consistency.

Slide 5:

Learn more about yourself every day.

Requirements:

- Smooth transitions
- Premium animations
- Progress indicator
- Skip option

---

# Module 2: Authentication

Required:

## Sign Up

Fields:

- Email
- Password

---

## Login

Fields:

- Email
- Password

---

## Social Authentication

Required UI:

- Continue with Google
- Continue with Apple

Implementation may be mocked if necessary.

---

# Module 3: User Setup

Collect:

## Personal Information

- Name
- Age
- Gender
- Height
- Weight

---

## Lifestyle

- Wake-Up Time
- Bedtime
- Activity Level

Activity Levels:

- Sedentary
- Light
- Moderate
- Active

---

## Goals

Multiple selection allowed.

Available goals:

- Improve Hydration
- Sleep Better
- Build Better Habits
- Eat Healthier
- Improve Energy
- Improve Consistency

---

## Notification Preferences

Options:

- Hydration Reminders
- Sleep Reminders
- Habit Reminders
- Daily Insights

---

# Module 4: Health Tracking Setup

Users choose:

## Manual Tracking

- Water
- Sleep
- Habits
- Meals

---

## Device Integrations (Bonus)

Potential integrations:

- Apple Health
- Health Connect
- Fitbit
- Garmin

Integrations can be mocked for MVP.

---

# Module 5: Home Dashboard

Purpose:

Single source of truth for daily health status.

Sections:

---

## Daily Insight Card

Generated dynamically.

Example:

"You slept 1 hour less than your weekly average. Prioritize hydration today."

---

## Hydration Card

Display:

- Goal
- Current Progress
- Remaining Amount

Actions:

- Add Water
- View Details

---

## Sleep Card

Display:

- Last Night Sleep
- Weekly Average
- Consistency Score

---

## Habit Card

Display:

- Habits Due Today
- Completed Habits
- Progress Percentage

---

## Nutrition Card

Display:

- Meals Logged
- Daily Summary

---

## Streak Card

Display:

- Current Streak
- Longest Streak
- Recent Achievement

---

# Module 6: Hydration

## Features

Daily Water Goal

Quick Add:

- 250ml
- 500ml
- 750ml

Custom Entry

History View

---

## Virtual Water Bottle

Visual bottle fills based on completion percentage.

Requirements:

- Animated fill
- Real-time updates

---

## Hydration Insights

Examples:

- Ahead of goal
- Behind schedule
- Improved consistency

---

# Module 7: Sleep

## Features

Sleep Logging

Sleep History

Weekly Trends

Monthly Trends

---

## Sleep Metrics

Display:

- Duration
- Consistency
- Trend

---

## Sleep Insights

Examples:

- Earlier bedtime improves sleep quality.
- Weekly sleep increased.

---

# Module 8: Habit Tracking

## Create Habit

Fields:

- Name
- Description
- Frequency

---

## Manage Habit

Actions:

- Complete
- Skip
- Pause
- Edit
- Delete

---

## Suggested Habits

- Reading
- Meditation
- Stretching
- Walking
- Journaling
- Supplements
- Early Bedtime

---

## Habit Insights

Examples:

- Morning habits perform better.
- Five-day completion streak.

---

# Module 9: Nutrition

Purpose:

Awareness-focused nutrition tracking.

---

## Meal Logging

Meal Types:

- Breakfast
- Lunch
- Dinner
- Snack

---

## Metrics

Display:

- Calories
- Protein
- Carbohydrates
- Fat

---

## Daily Summary

Show:

- Meals Logged
- Total Calories
- Macro Breakdown

---

# Module 10: AI Health Companion (Most Important)

## Core Goal

Aurora should feel like a health coach rather than a chatbot.

---

## Voice-to-Voice Interaction

Required.

User can speak naturally.

Aurora responds using voice.

Examples:

"How am I doing this week?"

"Did I drink enough water today?"

"How can I improve my sleep?"

---

## Agentic Actions

Aurora must perform actions from conversation.

Example:

User:
"I drank 500ml water."

System Action:

Create hydration log.

Response:

"Great. I've added 500ml to today's hydration progress."

---

Example:

User:
"I slept 7 hours."

System Action:

Create sleep record.

Response:

"I've updated your sleep log."

---

Example:

User:
"Create a habit to meditate every morning."

System Action:

Create habit.

Response:

"Done. Your meditation habit is ready."

---

## Agent Capabilities

Read:

- Hydration Data
- Sleep Data
- Habit Data
- Nutrition Data

Write:

- Hydration Logs
- Sleep Logs
- Habit Records

Update:

- User Preferences
- Goals

---

## AI Architecture

Suggested flow:

Speech → STT → LLM → Tool Calling → Database Update → LLM Response → TTS

Components:

- Speech To Text
- AI Agent
- Tool Execution Layer
- Text To Speech

---

# Module 11: Health Memory System (Optional)

Purpose:

Create feeling of long-term understanding.

Memory Examples:

- Misses hydration goals
- Better weekend sleep
- Strong morning routine

Memory used during recommendations.

---

# Module 12: Reports

## Weekly Report

Display:

- Hydration Progress
- Sleep Progress
- Habit Progress
- Nutrition Progress

---

## Monthly Report

Display:

- Consistency Score
- Achievements
- Trends
- Recommendations

---

# Module 13: Streak System

Track:

- Hydration
- Sleep
- Habits
- Nutrition

Rewards:

- Badges
- Milestones
- Achievements

Focus:

Positive reinforcement.

---

# Module 14: Notifications

Types:

## Hydration

"You're one glass away from today's goal."

---

## Sleep

"Your usual bedtime is approaching."

---

## Habit

"You've maintained this habit for five days."

---

## Insight

"Your daily health insight is ready."

---

# Module 15: Profile & Settings

## Profile

Manage:

- Personal Information
- Goals
- Preferences

---

## Settings

Manage:

- Notifications
- Connected Devices
- Units
- Privacy

---

# AI Recommendation Engine

The system should generate recommendations using:

Inputs:

- Hydration Data
- Sleep Data
- Habits
- Nutrition
- Goals

Outputs:

- Daily Insights
- Weekly Insights
- Personalized Suggestions

Recommendations must:

- Be supportive
- Be actionable
- Be concise
- Never sound judgmental

---

# MVP Prioritization

Priority 1 (Must Have)

- Authentication
- Onboarding
- Dashboard
- Hydration Tracking
- Sleep Tracking
- Habit Tracking
- Nutrition Tracking
- Voice AI Companion
- Agent Actions

Priority 2 (Should Have)

- Insights Engine
- Reports
- Streaks

Priority 3 (Nice To Have)

- Health Memory
- Device Integrations
- Advanced Analytics

---

# Evaluation Criteria

Highest priority:

1. User Experience
2. Voice AI Experience
3. Agentic Actions
4. Product Thinking
5. Mobile Quality
6. AI Integration
7. Backend Architecture
8. Polish and Execution

---

# Deliverables

Required:

1. Functional Mobile Application
2. Demo Video (3–5 Minutes)

Accepted formats:

- APK
- Android Install Link
- iOS Build
- TestFlight Build

Source code submission is not required.

---

# Instructions For Coding LLM

Before generating code:

1. Analyze all requirements.
2. Identify completed vs missing functionality.
3. Generate implementation roadmap.
4. Build architecture before coding.
5. Maintain feature modularity.
6. Use scalable folder structure.
7. Use reusable components.
8. Keep UI premium and modern.
9. Optimize for hackathon delivery speed.
10. Prioritize user experience over feature quantity.

At the end of every implementation cycle generate:

- Completed Features
- Pending Features
- Technical Debt
- Next Recommended Tasks
- Estimated MVP Completion Percentage