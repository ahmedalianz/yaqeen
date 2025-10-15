import { useLocationStore } from "@/stores/locationStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { usePrayerTimesStore } from "@/stores/prayerTimeStore";
import React, { useCallback, useEffect } from "react";
import { Image, StyleSheet } from "react-native";

const Splash = ({ onFinish }: { onFinish: () => void }) => {
  const { fetchLocation } = useLocationStore();
  const { calculatePrayerTimes, calculateNextPrayerTime } =
    usePrayerTimesStore();
  const {
    isInitialized,
    initialize: initializeNotifications,
    scheduleDailyNotifications,
  } = useNotificationStore();

  const initializeApp = useCallback(async () => {
    try {
      const location = await fetchLocation();
      if (location) {
        const prayerTimes = await calculatePrayerTimes(location);
        await calculateNextPrayerTime(location);
        await initializeNotifications();
        if (isInitialized && prayerTimes && prayerTimes.length > 0)
          await scheduleDailyNotifications(prayerTimes);
      }
    } catch (error) {
      await initializeNotifications();
      console.error("Error in splash initialization:", error);
    } finally {
      onFinish();
    }
  }, [
    isInitialized,
    fetchLocation,
    calculatePrayerTimes,
    calculateNextPrayerTime,
    scheduleDailyNotifications,
    initializeNotifications,
    onFinish,
  ]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <Image
      source={require("@/assets/images/splash.webp")}
      style={styles.image}
    />
  );
};

export default Splash;

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
});
