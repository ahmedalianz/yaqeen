import { LocationData, LocationService } from "@/services/locationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LocationState {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  setLocation: (location: LocationData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchLocation: () => Promise<void>;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      location: null,
      isLoading: false,
      error: null,

      setLocation: (location) => set({ location, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      fetchLocation: async () => {
        const { setLocation, setLoading, setError } = get();

        setLoading(true);
        setError(null);

        try {
          const location = await LocationService.getCurrentLocation();
          setLocation(location);
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "Failed to get location"
          );
        } finally {
          setLoading(false);
        }
      },

      clearLocation: () => set({ location: null, error: null }),
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ location: state.location }),
    }
  )
);
