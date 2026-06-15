import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { IBMPlexMono_400Regular } from "@expo-google-fonts/ibm-plex-mono";
import { StatusBar } from "expo-status-bar";
import { colors } from "../src/theme/tokens";
import { useAuthStore } from "../src/stores/authStore";
import { useHydrationStore } from "../src/stores/hydrationStore";
import { useSleepStore } from "../src/stores/sleepStore";
import { useHabitsStore } from "../src/stores/habitsStore";
import { useNutritionStore } from "../src/stores/nutritionStore";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

/** Returns today's date string in YYYY-MM-DD format. */
function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Returns date strings for the last 7 days including today. */
function last7DayStrings(): { start: string; end: string } {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { start: fmt(start), end: fmt(today) };
}

/**
 * Bootstraps all store data as soon as the user is confirmed authenticated.
 * This ensures the home dashboard always shows fresh data on first render,
 * without needing to visit individual tabs first.
 */
function useDataBootstrap() {
  const { firebaseUser, isLoading } = useAuthStore();
  const { fetchLogs: fetchHydration, fetchWeeklyLogs: fetchHydrationWeekly } = useHydrationStore();
  const { fetchLogs: fetchSleep, fetchWeeklyLogs: fetchSleepWeekly } = useSleepStore();
  const { fetchLogs: fetchNutrition } = useNutritionStore();
  const { fetchHabits, fetchCompletions, habits } = useHabitsStore();

  // Fire all fetches the moment auth is confirmed
  useEffect(() => {
    if (isLoading || !firebaseUser) return;

    const today = todayString();
    const { start, end } = last7DayStrings();

    // Today's logs — needed for daily totals on the home dashboard
    fetchHydration(today);
    fetchSleep(today);
    fetchNutrition(today);

    // Weekly logs — needed for sparkline charts on home dashboard
    fetchHydrationWeekly(start, end);
    fetchSleepWeekly(start, end);

    // Habits
    fetchHabits();
  }, [firebaseUser, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Once habits are loaded, fetch their completions for today
  useEffect(() => {
    if (!firebaseUser || habits.length === 0) return;
    const today = todayString();
    habits.forEach((h) => fetchCompletions(h.id, today));
  }, [firebaseUser, habits.length]); // eslint-disable-line react-hooks/exhaustive-deps
}

function useProtectedRoute() {
  const router = useRouter();
  const segments = useSegments();
  const { firebaseUser, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (isLoading) return; // Still loading auth state

    const inOnboarding = segments[0] === "(onboarding)";

    if (!firebaseUser && !inOnboarding) {
      // Not signed in → redirect to onboarding
      router.replace("/(onboarding)/landing");
    } else if (firebaseUser && inOnboarding) {
      // Signed in but in onboarding
      if (user?.onboardingComplete) {
        // Onboarding done → go to tabs
        router.replace("/(tabs)");
      } else {
        // Not done with onboarding. If they are on an auth screen, move them to setup.
        const segs = segments as string[];
        const inAuthScreen = segs[1] === "auth" || segs[1] === "landing";
        if (inAuthScreen) {
          router.replace("/(onboarding)/setup/personal-info");
        }
      }
    }
  }, [firebaseUser, isLoading, user, segments]);
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  const [loaded, error] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    IBMPlexMono_400Regular,
  });

  // Initialize Firebase auth listener
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  useProtectedRoute();
  useDataBootstrap(); // ← Pre-fetch all data as soon as auth is confirmed

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgPaper } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
