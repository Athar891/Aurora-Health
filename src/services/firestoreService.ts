/**
 * Firestore Service
 *
 * Generic CRUD helpers scoped to the current authenticated user.
 * All data lives under: users/{uid}/{collection}/{docId}
 */
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

// ─── Helpers ───

function getCurrentUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");
  return uid;
}

function userDocRef(subcollection: string) {
  return doc(db, "users", getCurrentUid(), subcollection, "data");
}

function userCollectionRef(subcollection: string) {
  return collection(db, "users", getCurrentUid(), subcollection);
}

// ─── User Document (profile, preferences, streaks) ───

/**
 * Get a single document from the user's scope.
 * Used for: profile, preferences, streaks
 */
export async function getUserDoc<T>(subcollection: string): Promise<T | null> {
  const ref = userDocRef(subcollection);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

/**
 * Set or merge a document in the user's scope.
 */
export async function setUserDoc(
  subcollection: string,
  data: Record<string, unknown>,
  merge = true
): Promise<void> {
  const ref = userDocRef(subcollection);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge });
}

// ─── Subcollection Documents (logs, habits, etc.) ───

/**
 * Add a document to a user's subcollection.
 * Returns the generated document ID.
 */
export async function addSubDoc(
  subcollection: string,
  data: Record<string, unknown>
): Promise<string> {
  const ref = userCollectionRef(subcollection);
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update a document in a user's subcollection.
 */
export async function updateSubDoc(
  subcollection: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  const ref = doc(db, "users", getCurrentUid(), subcollection, docId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

/**
 * Delete a document from a user's subcollection.
 */
export async function deleteSubDoc(
  subcollection: string,
  docId: string
): Promise<void> {
  const ref = doc(db, "users", getCurrentUid(), subcollection, docId);
  await deleteDoc(ref);
}

/**
 * Query documents from a user's subcollection.
 * Optionally filter by a date field matching a date string (YYYY-MM-DD).
 * When filtering by date, results are sorted client-side (avoids composite index requirement).
 */
export async function querySubDocs<T>(
  subcollection: string,
  dateField?: string,
  dateStr?: string
): Promise<T[]> {
  const ref = userCollectionRef(subcollection);

  let q;
  if (dateField && dateStr) {
    // NOTE: No orderBy here — combining where() + orderBy() on different fields
    // requires a composite index. We sort client-side instead.
    q = query(ref, where(dateField, "==", dateStr));
  } else {
    q = query(ref, orderBy("createdAt", "desc"));
  }

  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));

  // Sort client-side by createdAt descending when filtering by date
  if (dateField && dateStr) {
    return docs.sort((a: any, b: any) => {
      const aTime = a.createdAt?.seconds ?? 0;
      const bTime = b.createdAt?.seconds ?? 0;
      return bTime - aTime;
    });
  }
  return docs;
}

/**
 * Query documents from a user's subcollection between two dates.
 * Filters by a date field matching a range of date strings (YYYY-MM-DD).
 * Results are ordered by the date field.
 */
export async function querySubDocsBetweenDates<T>(
  subcollection: string,
  dateField: string,
  startDateStr: string,
  endDateStr: string
): Promise<T[]> {
  const ref = userCollectionRef(subcollection);
  
  const q = query(
    ref,
    where(dateField, ">=", startDateStr),
    where(dateField, "<=", endDateStr),
    orderBy(dateField, "asc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

/**
 * Query all active documents (for habits).
 */
export async function queryActiveSubDocs<T>(
  subcollection: string
): Promise<T[]> {
  const ref = userCollectionRef(subcollection);
  // NOTE: No orderBy here — combining where() + orderBy() on different fields
  // requires a composite index. We sort client-side instead.
  const q = query(ref, where("active", "==", true));
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));

  // Sort client-side by createdAt descending
  return docs.sort((a: any, b: any) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return bTime - aTime;
  });
}

// ─── Timestamp Conversion ───

/**
 * Convert Firestore Timestamp to JS Date.
 * Handles cases where the value is already a Date or null.
 */
export function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}
