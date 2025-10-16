import { useLocationStore } from "@/stores/locationStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { usePrayerTimesStore } from "@/stores/prayerTimeStore";
import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Alert, Linking, Platform } from "react-native";
import { AudioService } from "./audioService";
import { PrayerTime } from "./prayerTimeServices";

const DAILY_UPDATE_TASK = "DAILY_UPDATE_TASK";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  notifyBeforePrayer: boolean;
  notifyAtPrayerTime: boolean;
  azanSoundEnabled: boolean;
  prePrayerMinutes: number;
}

export class NotificationService {
  private static instance: NotificationService;
  private audioService: AudioService;
  private isInitialized = false;

  private constructor() {
    this.audioService = new AudioService();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permissions not granted");
        return false;
      }
      await this.requestIgnoreBatteryOptimization();

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("prayer-times", {
          name: "Prayer Times",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FFA726",
          sound: "azan.mp3",
        });
      }

      // Setup background tasks
      this.setupBackgroundTasks();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing notification service:", error);
      return false;
    }
  }

  private setupBackgroundTasks() {
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
          await usePrayerTimesStore.getState().calculatePrayerTimes(location);
          const prayerTimes = usePrayerTimesStore.getState().prayerTimes;
          if (prayerTimes && settings.enabled) {
            await this.schedulePrayerNotifications(prayerTimes, settings);
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
  }

  async schedulePrayerNotifications(
    prayerTimes: PrayerTime[],
    settings: NotificationSettings
  ): Promise<void> {
    try {
      // Cancel existing notifications first
      await this.cancelAllNotifications();
      if (!settings.enabled) {
        return;
      }

      let scheduledCount = 0;

      const notifications: Promise<any>[] = [];
      for (const prayer of prayerTimes) {
        if (prayer.english === "Sunrise") continue; // Skip sunrise
        if (prayer.passed) continue; // Skip passed prayers
        // Schedule notification at prayer time
        if (settings.notifyAtPrayerTime) {
          const prayerTimeNotification = this.scheduleNotification(
            prayer.time,
            `🕌 موعد ${prayer.name}`,
            `حان الآن موعد صلاة ${prayer.name}`,
            settings.azanSoundEnabled,
            `prayer_${prayer.english}_exact`
          );

          notifications.push(prayerTimeNotification);
        }

        // Schedule notification before prayer time
        if (settings.notifyBeforePrayer) {
          const beforePrayerTime = new Date(prayer.time);
          beforePrayerTime.setMinutes(
            beforePrayerTime.getMinutes() - settings.prePrayerMinutes
          );

          if (beforePrayerTime > new Date()) {
            const beforePrayerNotification = this.scheduleNotification(
              beforePrayerTime,
              `🕌 اقتراب موعد ${prayer.name}`,
              `سيحين موعد صلاة ${prayer.name} بعد ${this.getArabicMinutes(
                settings.prePrayerMinutes
              )}`,
              false,
              `prayer_${prayer.english}_before`
            );
            notifications.push(beforePrayerNotification);
          }
        }
      }

      // Wait for all notifications to be scheduled
      const results = await Promise.allSettled(notifications);

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          scheduledCount++;
        } else {
          console.error(
            "Failed to schedule notification:",
            result,
            `index: ${index}`
          );
        }
      });

      console.log(
        `Successfully scheduled ${scheduledCount} out of ${notifications.length} prayer notifications`
      );
    } catch (error) {
      console.error("Error scheduling prayer notifications:", error);
      throw error;
    }
  }

  async scheduleNotification(
    triggerDate: Date,
    title: string,
    body: string,
    playSound: boolean,
    identifier: string
  ): Promise<string> {
    try {
      const now = new Date();
      triggerDate = new Date(triggerDate);
      // Check if date is in the past (with 1 second buffer)
      if (triggerDate.getTime() <= now.getTime() - 1000) {
        console.log("Skipping notification in the past:", triggerDate);
        return "";
      }

      // Check if date is too far in the future
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (triggerDate.getTime() > oneYearFromNow.getTime()) {
        console.log("Skipping notification too far in future:", triggerDate);
        return "";
      }

      console.log(
        "Scheduling notification for:",
        triggerDate,
        "Identifier:",
        identifier
      );
      return await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: playSound ? "azan.mp3" : undefined,
          priority: Notifications.AndroidNotificationPriority.MAX,
          autoDismiss: false,
          sticky: true,
          data: {
            prayerTime: true,
            soundEnabled: playSound,
          },
        },
        trigger: {
          type: "date" as Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
        identifier,
      });
    } catch (error) {
      console.error("Error scheduling notification:", error, {
        triggerDate,
        identifier,
        validDate: triggerDate instanceof Date,
        dateValue: triggerDate?.getTime(),
      });
      return "";
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("Cancelled all scheduled notifications");
  }

  async playAzan(): Promise<void> {
    await this.audioService.playAzan();
  }

  async stopAzan(): Promise<void> {
    await this.audioService.stopAzan();
  }
  async checkBackgroundTaskStatus(): Promise<void> {
    try {
      const tasks = await TaskManager.getRegisteredTasksAsync();
      const dailyTask = tasks.find(
        (task) => task.taskName === DAILY_UPDATE_TASK
      );

      if (dailyTask) {
        console.log("✅ Background task is registered:", dailyTask);
      } else {
        console.log("❌ Background task is NOT registered");
      }

      // Check background fetch status
      const status = await BackgroundTask.getStatusAsync();
      console.log("Background fetch status:", status);

      // Get pending notifications to verify scheduling
      const pending = await this.getPendingNotifications();
      console.log(`Pending notifications: ${pending.length}`);
    } catch (error) {
      console.error("Error checking background task status:", error);
    }
  }
  private async requestIgnoreBatteryOptimization() {
    if (Platform.OS === "android") {
      try {
        const batteryOptimizationEnabled =
          await BackgroundTask.getStatusAsync();
        console.log("Battery optimization status:", batteryOptimizationEnabled);

        if (
          batteryOptimizationEnabled ===
          BackgroundTask.BackgroundTaskStatus.Restricted
        ) {
          // Guide user to disable battery optimization
          Alert.alert(
            "Background Access Required",
            "For reliable prayer time notifications, this app needs to run in the background. Please disable battery optimization for this app.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => this.openBatterySettings(),
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error checking battery optimization:", error);
      }
    }
  }
  async getPendingNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
  private async openBatterySettings() {
    if (Platform.OS === "android") {
      try {
        // Try to open battery optimization settings
        await Linking.openSettings();
      } catch (error) {
        console.error("Error opening settings:", error);
        // Fallback: show instructions
        Alert.alert(
          "Manual Settings Required",
          "Please go to: Settings → Apps → This App → Battery → Disable optimization\n\nThen return to the app."
        );
      }
    }
  }
  private getArabicMinutes(minutes: number): string {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    const minutesStr = minutes.toString();
    return (
      minutesStr
        .split("")
        .map((digit) => arabicNumbers[parseInt(digit)])
        .join("") + " دقائق"
    );
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
