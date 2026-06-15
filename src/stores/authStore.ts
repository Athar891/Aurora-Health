import { create } from "zustand";
import { UserProfile } from "../types/models";
import * as authService from "../services/authService";
import { setUserDoc, getUserDoc } from "../services/firestoreService";

interface AuthState {
  user: UserProfile | null;
  firebaseUser: { uid: string; email: string | null } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => () => void;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken?: string) => Promise<void>;
  signInWithApple: (identityToken?: string, nonce?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfile: (data: Partial<UserProfile> | Record<string, any>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,
  error: null,

  /**
   * Initialize Firebase auth state listener.
   * Call in root layout on mount. Returns unsubscribe function.
   */
  initialize: () => {
    const unsubscribe = authService.onAuthChanged(async (fbUser) => {
      if (fbUser) {
        set({
          firebaseUser: { uid: fbUser.uid, email: fbUser.email },
        });
        // Fetch user profile from Firestore
        try {
          const profile = await getUserDoc<UserProfile>("profile");
          set({ user: profile, isLoading: false, error: null });
        } catch {
          set({ user: null, isLoading: false });
        }
      } else {
        set({ user: null, firebaseUser: null, isLoading: false, error: null });
      }
    });
    return unsubscribe;
  },

  signUp: async (email, password, name = "") => {
    set({ isLoading: true, error: null });
    try {
      const fbUser = await authService.signUpWithEmail(email, password);
      // Create initial profile document in Firestore
      const profile: Omit<UserProfile, "createdAt" | "updatedAt"> = {
        uid: fbUser.uid,
        email: email,
        name: name,
        age: 0,
        gender: "prefer-not-to-say",
        heightCm: 0,
        weightKg: 0,
        onboardingComplete: false,
      };
      await setUserDoc("profile", profile as Record<string, unknown>, false);
      set({
        firebaseUser: { uid: fbUser.uid, email: fbUser.email },
        user: { ...profile, createdAt: new Date(), updatedAt: new Date() },
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.signInWithEmail(email, password);
      // Auth state listener will handle setting user
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signInWithGoogle: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const fbUser = await authService.signInWithGoogle(idToken);
      // Check if profile exists, if not create one
      const existing = await getUserDoc<UserProfile>("profile");
      if (!existing) {
        const profile: Omit<UserProfile, "createdAt" | "updatedAt"> = {
          uid: fbUser.uid,
          email: fbUser.email || "",
          name: fbUser.displayName || "",
          age: 0,
          gender: "prefer-not-to-say",
          heightCm: 0,
          weightKg: 0,
          profilePhotoUrl: fbUser.photoURL || undefined,
          onboardingComplete: false,
        };
        await setUserDoc("profile", profile as Record<string, unknown>, false);
      }
      // Auth state listener will handle the rest
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign in failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signInWithApple: async (identityToken, nonce) => {
    set({ isLoading: true, error: null });
    try {
      const fbUser = await authService.signInWithApple(identityToken, nonce);
      const existing = await getUserDoc<UserProfile>("profile");
      if (!existing) {
        const profile: Omit<UserProfile, "createdAt" | "updatedAt"> = {
          uid: fbUser.uid,
          email: fbUser.email || "",
          name: fbUser.displayName || "",
          age: 0,
          gender: "prefer-not-to-say",
          heightCm: 0,
          weightKg: 0,
          onboardingComplete: false,
        };
        await setUserDoc("profile", profile as Record<string, unknown>, false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Apple sign in failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signOut: async () => {
    try {
      await authService.signOut();
      set({ user: null, firebaseUser: null, error: null });
      // Clear all per-user store data so the next user starts fresh
      const { useHabitsStore } = await import("./habitsStore");
      const { useHydrationStore } = await import("./hydrationStore");
      const { useSleepStore } = await import("./sleepStore");
      const { useNutritionStore } = await import("./nutritionStore");
      useHabitsStore.setState({ habits: [], completions: {}, isLoading: false });
      useHydrationStore.setState({ logs: [], isLoading: false });
      useSleepStore.setState({ logs: [], isLoading: false });
      useNutritionStore.setState({ logs: [], isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign out failed";
      set({ error: message });
    }
  },

  setUser: (user) => set({ user, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  updateProfile: async (data) => {
    try {
      await setUserDoc("profile", data as Record<string, unknown>);
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Profile update failed";
      set({ error: message });
    }
  },
}));
