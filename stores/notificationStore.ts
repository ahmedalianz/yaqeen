import {
  NotificationSettings,
  notificationService,
} from "@/services/notificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface NotificationState extends NotificationSettings {
  isInitialized: boolean;
  initialize: () => Promise<boolean>;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  playAzan: () => Promise<void>;
  stopAzan: () => Promise<void>;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  notifyBeforePrayer: true,
  notifyAtPrayerTime: true,
  azanSoundEnabled: true,
  prePrayerMinutes: 5,
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      isInitialized: false,

      initialize: async (): Promise<boolean> => {
        try {
          const success = await notificationService.initialize();
          set({ isInitialized: success });
          return success;
        } catch (error) {
          console.error("Error initializing notification store:", error);
          return false;
        }
      },

      updateSettings: (newSettings: Partial<NotificationSettings>) => {
        set((state) => ({ ...state, ...newSettings }));
      },

      playAzan: async (): Promise<void> => {
        try {
          await notificationService.playAzan();
        } catch (error) {
          console.error("Error playing azan:", error);
          throw error;
        }
      },

      stopAzan: async (): Promise<void> => {
        try {
          await notificationService.stopAzan();
        } catch (error) {
          console.error("Error stopping azan:", error);
          throw error;
        }
      },
    }),
    {
      name: "notification-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
