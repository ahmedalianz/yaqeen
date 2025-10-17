import { LocationData } from "@/services/locationService";
import { PrayerTime } from "@/services/prayerTimeServices";
import getCurrentDates from "@/utils/getCurrentDates";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NextPrayerBanner from "./NextPrayerBanner";

interface HeaderProps {
  location: LocationData | null;
  isLoading: boolean;
  onRefreshLocation: () => void;
  nextPrayer: { prayer: PrayerTime } | null;
  remainingTime: string;
  pulseAnim: Animated.Value;
}

const Header: React.FC<HeaderProps> = ({
  location,
  isLoading,
  onRefreshLocation,
  nextPrayer,
  remainingTime,
  pulseAnim,
}) => {
  const { top } = useSafeAreaInsets();
  const { gregorian, hijri, time } = getCurrentDates();
  return (
    <LinearGradient
      colors={["#0a0f1c", "#1a1f2c", "#2d3748"]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.headerContent, { paddingTop: top }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={onRefreshLocation}
            style={styles.locationContainer}
          >
            <Ionicons
              name="location"
              size={16}
              color="#e0f2fe"
              style={styles.locationIcon}
            />
            <Text style={styles.location}>
              {location?.address || "جاري تحديد الموقع..."}
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color="#e0f2fe"
                  style={{ marginLeft: 4 }}
                />
              )}
            </Text>
          </TouchableOpacity>
          <Image
            source={require("@/assets/images/logo.webp")}
            style={styles.avatar}
          />
        </View>

        <View style={styles.timeCard}>
          <Text style={styles.currentDate}>{gregorian.full}</Text>
          <Text style={styles.hijriDate}>{hijri.full} هـ</Text>
          <Text style={styles.currentTime}>{time}</Text>
        </View>

        {/* Next Prayer Banner */}
        {nextPrayer && (
          <NextPrayerBanner
            nextPrayer={nextPrayer}
            remainingTime={remainingTime}
            pulseAnim={pulseAnim}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  locationContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
    alignItems: "flex-start",
    marginRight: 12,
  },
  locationIcon: {
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: "#e0f2fe",
    fontFamily: "Cairo_400Regular",
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  timeCard: {
    alignItems: "center",
    marginBottom: 20,
  },
  currentDate: {
    fontSize: 15,
    color: "#e0f2fe",
    textAlign: "center",
    fontFamily: "Cairo_500Medium",
  },
  hijriDate: {
    fontSize: 13,
    color: "#bae6fd",
    marginTop: 2,
    textAlign: "center",
    fontFamily: "Cairo_400Regular",
  },
  currentTime: {
    fontSize: 48,
    color: "#fff",
    marginTop: 8,
    fontFamily: "Cairo_700Bold",
    letterSpacing: 2,
  },
});
export default Header;
