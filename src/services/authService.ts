/**
 * Authentication Service
 *
 * Wraps Firebase Auth methods for email/password, Google, and Apple sign-in.
 * Google and Apple sign-in use expo-auth-session / expo-apple-authentication
 * to obtain tokens, then Firebase signInWithCredential for the actual auth.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signInWithPopup,
  User,
} from "firebase/auth";
import { Platform } from "react-native";
import { auth } from "../config/firebase";

// ─── Email / Password ───

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// ─── Google Sign-In ───

/**
 * Google Sign-In
 * - On web: uses Firebase signInWithPopup directly
 * - On native: expects a Google ID token obtained from expo-auth-session,
 *   then uses signInWithCredential
 */
export async function signInWithGoogle(idToken?: string): Promise<User> {
  if (Platform.OS === "web") {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }

  // Native: requires an idToken from expo-auth-session
  if (!idToken) {
    throw new Error(
      "Google ID token is required for native sign-in. Use expo-auth-session to obtain it."
    );
  }
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

// ─── Apple Sign-In ───

/**
 * Apple Sign-In
 * - On web: uses Firebase signInWithPopup with OAuthProvider
 * - On native: expects identityToken + nonce from expo-apple-authentication,
 *   then uses signInWithCredential
 */
export async function signInWithApple(
  identityToken?: string,
  nonce?: string
): Promise<User> {
  if (Platform.OS === "web") {
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }

  // Native: requires identityToken and nonce from expo-apple-authentication
  if (!identityToken) {
    throw new Error(
      "Apple identity token is required for native sign-in. Use expo-apple-authentication."
    );
  }
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken: identityToken,
    rawNonce: nonce,
  });
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

// ─── Sign Out ───

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ─── Auth State Observer ───

export function onAuthChanged(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}
