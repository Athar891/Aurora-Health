import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HealthEvent } from "../types/models";
import { addSubDoc } from "../services/firestoreService";

interface EventState {
  events: HealthEvent[];
  offlineQueue: HealthEvent[];
  addEvent: (event: Omit<HealthEvent, "id">) => Promise<void>;
  syncOfflineEvents: () => Promise<void>;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      offlineQueue: [],

      addEvent: async (eventData) => {
        const tempId = `temp-${Date.now()}`;
        const newEvent: HealthEvent = { ...eventData, id: tempId };

        // Optimistically add to local state
        set((state) => ({ events: [newEvent, ...state.events] }));

        try {
          // Attempt to write to Firestore
          // Firestore handles its own offline caching, but we implement the requested queue pattern
          const realId = await addSubDoc("health_events", eventData);
          set((state) => ({
            events: state.events.map((e) => (e.id === tempId ? { ...e, id: realId } : e)),
          }));
        } catch (error) {
          console.log("Network error, queuing event offline:", error);
          // If firestore write fails immediately (e.g. timeout/no network), push to offline queue
          set((state) => ({ offlineQueue: [...state.offlineQueue, newEvent] }));
        }
      },

      syncOfflineEvents: async () => {
        const { offlineQueue } = get();
        if (offlineQueue.length === 0) return;

        console.log(`Attempting to sync ${offlineQueue.length} offline events...`);
        const remainingQueue: HealthEvent[] = [];

        for (const event of offlineQueue) {
          try {
            const { id, ...data } = event;
            const realId = await addSubDoc("health_events", data);
            
            // Update the local ID
            set((state) => ({
              events: state.events.map((e) => (e.id === id ? { ...e, id: realId } : e)),
            }));
          } catch (error) {
            console.error("Failed to sync event, keeping in queue:", error);
            remainingQueue.push(event);
          }
        }

        set({ offlineQueue: remainingQueue });
      },
    }),
    {
      name: "aurora-event-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
