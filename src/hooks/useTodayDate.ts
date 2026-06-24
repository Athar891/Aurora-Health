import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

/**
 * Returns today's date string ("YYYY-MM-DD") and automatically updates it
 * when the calendar day changes — either via the AppState coming to foreground
 * or via a minute-level interval check while the app is active.
 *
 * Screens that use this hook will re-fetch their logs whenever the date rolls
 * over midnight, ensuring yesterday's data doesn't bleed into the new day.
 */
export function useTodayDate(): string {
  const getToday = () => new Date().toISOString().split("T")[0];

  const [todayStr, setTodayStr] = useState<string>(getToday);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkAndUpdate = () => {
    const current = getToday();
    setTodayStr((prev) => (prev !== current ? current : prev));
  };

  useEffect(() => {
    // Check every minute while the app is active
    intervalRef.current = setInterval(checkAndUpdate, 60_000);

    // Also check immediately when the app returns to foreground
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        checkAndUpdate();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppState);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      subscription.remove();
    };
  }, []);

  return todayStr;
}
