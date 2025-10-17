import {
  NotificationSettings,
  notificationService,
} from "@/services/notificationService";
import { PrayerTime } from "@/services/prayerTimeServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useLocationStore } from "./locationStore";
import { usePrayerTimesStore } from "./prayerTimeStore";
const DAILY_UPDATE_TASK = "DAILY_UPDATE_TASK";

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
          // Task for daily prayer time updates
          TaskManager.defineTask(DAILY_UPDATE_TASK, async () => {
            try {
              // Update prayer times for the day
              console.log("Daily prayer time update task running");
              const location = useLocationStore.getState().location;
              if (location) {
                const settings = useNotificationStore.getState();
                const lastScheduledDate = settings.lastScheduledDate;
                const today = new Date().toLocaleDateString("en-CA");
                console.log("🔍 Date Comparison Debug:", {
                  lastScheduledDate,
                  today,
                  areEqual: lastScheduledDate === today,
                  typeLast: typeof lastScheduledDate,
                  typeToday: typeof today,
                });
                if (lastScheduledDate === today) {
                  return BackgroundTask.BackgroundTaskResult.Success;
                }
                await usePrayerTimesStore
                  .getState()
                  .calculatePrayerTimes(location);
                const prayerTimes = usePrayerTimesStore.getState().prayerTimes;
                if (prayerTimes && settings.enabled) {
                  await notificationService.schedulePrayerNotifications(
                    prayerTimes,
                    settings
                  );
                }
              }
              return BackgroundTask.BackgroundTaskResult.Success;
            } catch (error) {
              console.error("Error in daily update task:", error);
              return BackgroundTask.BackgroundTaskResult.Failed;
            }
          });

          BackgroundTask.registerTaskAsync(DAILY_UPDATE_TASK, {
            minimumInterval: 2 * 60, // 24 hours
          });
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
