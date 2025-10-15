import { LocationData } from "@/services/locationService";
import { PrayerTime, PrayerTimeService } from "@/services/prayerTimeServices";
import calculateDistance from "@/utils/calculateDistance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PrayerTimesState {
  prayerTimes: PrayerTime[] | null;
  nextPrayer: { prayer: PrayerTime } | null;
  calculationDate: string | null;
  calculationLocation: LocationData | null;
  isLoading: boolean;
  error: string | null;

  setPrayerTimes: (prayerTimes: PrayerTime[], location: LocationData) => void;
  setNextPrayer: (nextPrayer: { prayer: PrayerTime } | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  calculatePrayerTimes: (location: LocationData) => Promise<void>;
  calculateNextPrayerTime: (location: LocationData) => Promise<void>;

  shouldRecalculate: (location: LocationData) => boolean;

  clearPrayerTimes: () => void;
}

export const usePrayerTimesStore = create<PrayerTimesState>()(
  persist(
    (set, get) => ({
      prayerTimes: null,
      nextPrayer: null,
      calculationDate: null,
      calculationLocation: null,
      isLoading: false,
      error: null,

      setPrayerTimes: (prayerTimes, location) => {
        const today = new Date().toISOString().split("T")[0];
        set({
          prayerTimes,
          calculationDate: today,
          calculationLocation: location,
          error: null,
        });
      },

      setNextPrayer: (nextPrayer) => set({ nextPrayer }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      shouldRecalculate: (location: LocationData) => {
        const { prayerTimes, calculationDate, calculationLocation } = get();
        const today = new Date().toISOString().split("T")[0];

        // No prayer times calculated yet
        if (!prayerTimes || !calculationDate) return true;

        // New day
        if (calculationDate !== today) return true;

        // Different location (more than 1km away)
        if (calculationLocation && location) {
          const distance = calculateDistance(
            calculationLocation.latitude,
            calculationLocation.longitude,
            location.latitude,
            location.longitude
          );
          // Recalculate if moved more than 1km
          if (distance > 1) return true;
        }

        return false;
      },

      calculatePrayerTimes: async (location: LocationData) => {
        const {
          shouldRecalculate,
          setPrayerTimes,
          setNextPrayer,
          setLoading,
          setError,
        } = get();

        // Check if we need to recalculate
        if (!shouldRecalculate(location)) {
          return; // Use cached prayer times
        }

        setLoading(true);
        setError(null);

        try {
          const prayerService = new PrayerTimeService();
          const times = prayerService.calculatePrayerTimes(
            location.latitude,
            location.longitude
          );

          setPrayerTimes(times, location);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to calculate prayer times"
          );
          console.error("Error calculating prayer times:", error);
        } finally {
          setLoading(false);
        }
      },
      calculateNextPrayerTime: async (location: LocationData) => {
        const { prayerTimes, setNextPrayer, setLoading, setError } = get();

        setLoading(true);
        setError(null);

        try {
          const prayerService = new PrayerTimeService();

          const nextPrayerInfo = prayerTimes?.length
            ? prayerService.getNextPrayer(
                prayerTimes,
                location.latitude,
                location.longitude
              )
            : null;
          setNextPrayer(nextPrayerInfo);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to calculate prayer times"
          );
          console.error("Error calculating prayer times:", error);
        } finally {
          setLoading(false);
        }
      },

      clearPrayerTimes: () =>
        set({
          prayerTimes: null,
          nextPrayer: null,
          calculationDate: null,
          calculationLocation: null,
        }),
    }),
    {
      name: "prayer-times-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        prayerTimes: state.prayerTimes,
        nextPrayer: state.nextPrayer,
        calculationDate: state.calculationDate,
        calculationLocation: state.calculationLocation,
      }),
    }
  )
);
