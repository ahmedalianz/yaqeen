import * as Location from "expo-location";
import { Alert } from "react-native";

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  address?: string;
}

export class LocationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "الإذن مطلوب",
          "يجب منح إذن الموقع لحساب أوقات الصلاة بدقة",
          [{ text: "حسناً" }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      const city = await this.getCityFromCoordinates(
        location.coords.latitude,
        location.coords.longitude
      );
      const firstAddress = address[0];

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city,
        country: firstAddress?.country || "",
        address: this.formatAddress(firstAddress),
      };
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  }

  private static formatAddress(
    address: Location.LocationGeocodedAddress | null
  ): string {
    if (!address) return "موقع غير معروف";

    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.region && address.region !== address.city)
      parts.push(address.region);
    if (address.country) parts.push(address.country);

    return parts.join("، ");
  }

  static async getCityFromCoordinates(
    lat: number,
    lng: number
  ): Promise<string> {
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      const firstAddress = address[0];
      return firstAddress?.city || firstAddress?.region || "موقع غير معروف";
    } catch (error) {
      console.error("Error getting city from coordinates:", error);
      return "موقع غير معروف";
    }
  }
}
