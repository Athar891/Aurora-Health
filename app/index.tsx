import { Redirect } from "expo-router";

export default function Index() {
  // For now, always redirect to onboarding.
  // We'll update this in Phase 2 to check auth state.
  return <Redirect href="/(onboarding)/landing" />;
}
