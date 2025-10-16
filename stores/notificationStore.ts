import {
  NotificationSettings,
  notificationService,
} from "@/services/notificationService";
import { PrayerTime } from "@/services/prayerTimeServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { usePrayerTimesStore } from "./prayerTimeStore";

interface NotificationState extends NotificationSettings {
  isInitialized: boolean;
  lastScheduledDate: string | null;
  initialize: () => Promise<boolean>;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  rescheduleNotifications: () => Promise<void>;
  scheduleDailyNotifications: (prayerTimes: PrayerTime[]) => Promise<void>; // Add this

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
    (set, get) => ({
      ...defaultSettings,
      isInitialized: false,
      lastScheduledDate: null,
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
      scheduleDailyNotifications: async (
        prayerTimes: PrayerTime[]
      ): Promise<void> => {
        const settings = get();
        const today = new Date().toLocaleDateString("en-CA");

        // Only schedule if not already scheduled today and notifications are enabled
        if (!settings.enabled || settings.lastScheduledDate === today) {
          return;
        }

        try {
          await notificationService.schedulePrayerNotifications(
            prayerTimes,
            settings
          );
          set({ lastScheduledDate: today });
          console.log("Daily notifications scheduled for:", today);
        } catch (error) {
          console.error("Error scheduling daily notifications:", error);
        }
      },
      updateSettings: (newSettings: Partial<NotificationSettings>) => {
        const { rescheduleNotifications } = get();
        set((state) => {
          const updatedSettings = { ...state, ...newSettings };
          // After updating, reschedule notifications
          if (
            newSettings.enabled !== undefined ||
            newSettings.notifyAtPrayerTime !== undefined ||
            newSettings.notifyBeforePrayer !== undefined ||
            newSettings.prePrayerMinutes !== undefined ||
            newSettings.azanSoundEnabled !== undefined
          ) {
            // We can call rescheduleNotifications but note: it's asynchronous and we don't want to wait in the setter.
            // We can fire and forget.
            setTimeout(() => {
              rescheduleNotifications();
            }, 0);
          }
          return updatedSettings;
        });
      },
      rescheduleNotifications: async () => {
        const settings = get();
        const prayerTimes = usePrayerTimesStore.getState().prayerTimes;
        if (prayerTimes) {
          if (settings.enabled) {
            await notificationService.schedulePrayerNotifications(
              prayerTimes,
              settings
            );
          } else {
            await notificationService.cancelAllNotifications();
          }
        }
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
      partialize: (state) => ({
        enabled: state.enabled,
        notifyBeforePrayer: state.notifyBeforePrayer,
        notifyAtPrayerTime: state.notifyAtPrayerTime,
        azanSoundEnabled: state.azanSoundEnabled,
        prePrayerMinutes: state.prePrayerMinutes,
        lastScheduledDate: state.lastScheduledDate,
      }),
    }
  )
);
