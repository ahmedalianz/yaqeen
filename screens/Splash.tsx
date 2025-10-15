import { useLocationStore } from "@/stores/locationStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { usePrayerTimesStore } from "@/stores/prayerTimeStore";
import React, { useCallback, useEffect } from "react";
import { Image, StyleSheet } from "react-native";

const Splash = ({ onFinish }: { onFinish: () => void }) => {
  const { fetchLocation, location } = useLocationStore();
  const { calculatePrayerTimes, calculateNextPrayerTime } =
    usePrayerTimesStore();
  const { initialize } = useNotificationStore();
  const initializeApp = useCallback(async () => {
    try {
      await fetchLocation();
      if (location) {
        await calculatePrayerTimes(location);
        await calculateNextPrayerTime(location);
      }
      const timer = setTimeout(() => {
        onFinish();
      }, 2000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error in splash initialization:", error);
      const timer = setTimeout(() => {
        onFinish();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [
    fetchLocation,
    calculatePrayerTimes,
    calculateNextPrayerTime,
    onFinish,
    location,
  ]);
  const initNotifications = useCallback(async () => {
    await initialize();
  }, [initialize]);
  useEffect(() => {
    initializeApp();
    // initNotifications();
  }, [initializeApp, initNotifications]);

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
