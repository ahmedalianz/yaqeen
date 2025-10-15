import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  LOCATION: "@yaqeen_location",
  NOTIFICATION_PREFERENCE: "@yaqeen_notification_preference",
  NOTIFICATION_UPDATED_AT: "@yaqeen_notification_updated_at",
};

export const StorageService = {
  saveLocation: async (location) => {
    try {
      await AsyncStorage.setItem(KEYS.LOCATION, JSON.stringify(location));
      return true;
    } catch (error) {
      console.error("Error Saving Location", error);
    }
  },
  getLocation: async () => {
    try {
      const location = await AsyncStorage.getItem(KEYS.LOCATION);
      return location ? JSON.parse(location) : null;
    } catch (error) {
      console.error("Error Getting Location", error);
    }
  },
  saveNotificationPreference: async (enabled) => {
    try {
      await AsyncStorage.setItem(
        KEYS.NOTIFICATION_PREFERENCE,
        JSON.stringify(enabled)
      );
      return true;
    } catch (error) {
      console.error("Error Saving Notification Preference", error);
    }
  },
  getNotificationPreference: async () => {
    try {
      const notification = await AsyncStorage.getItem(
        KEYS.NOTIFICATION_PREFERENCE
      );
      return notification ? JSON.parse(notification) : true;
    } catch (error) {
      console.error("Error Getting Notification Preference", error);
    }
  },
  saveNotificationUpdatedAt: async (date) => {
    try {
      await AsyncStorage.setItem(
        KEYS.NOTIFICATION_UPDATED_AT,
        JSON.stringify(date)
      );
      return true;
    } catch (error) {
      console.error("Error Saving Notification Date", error);
    }
  },
  getNotificationUpdatedAt: async () => {
    try {
      const notification = await AsyncStorage.getItem(
        KEYS.NOTIFICATION_UPDATED_AT
      );
      return notification ? JSON.parse(notification) : true;
    } catch (error) {
      console.error("Error Getting Notification Date", error);
    }
  },
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error("Error Clearing Storage", error);
    }
  },
};
