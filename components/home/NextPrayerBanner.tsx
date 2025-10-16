import { PrayerTime } from "@/services/prayerTimeServices";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface NextPrayerBannerProps {
  nextPrayer: { prayer: PrayerTime } | null;
  remainingTime: string;
  pulseAnim: Animated.Value;
}

const NextPrayerBanner: React.FC<NextPrayerBannerProps> = ({
  nextPrayer,
  remainingTime,
  pulseAnim,
}) => {
  if (!nextPrayer) return null;

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
      }}
    >
      <View style={styles.bannerWrapper}>
        <LinearGradient
          colors={["#d4a574", "#c89d6a", "#e8a870"]}
          style={styles.nextPrayerBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerIcon}>
              <LottieView
                source={require("@/assets/prayer-animation.json")}
                autoPlay
                loop
                style={styles.lottieIcon}
              />
            </View>
            <View style={styles.bannerTextContent}>
              <Text style={styles.bannerTitle}>
                {nextPrayer.prayer.name.includes("الغد")
                  ? "أول صلاة غداً"
                  : "الصلاة القادمة"}
              </Text>
              <Text style={styles.bannerPrayer}>{nextPrayer.prayer.name}</Text>
              <Text style={styles.bannerTime}>
                {`${remainingTime} ${remainingTime === "الآن" ? "" : "متبقية"}`}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerWrapper: {
    overflow: "hidden",
    borderRadius: 20,
  },
  nextPrayerBanner: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    overflow: "hidden",
  },
  bannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerTextContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    color: "#fef3c7",
    textAlign: "right",
    fontFamily: "Cairo_500Medium",
  },
  bannerPrayer: {
    fontSize: 28,
    color: "#fff",
    marginTop: 4,
    textAlign: "right",
    fontFamily: "Cairo_700Bold",
  },
  bannerTime: {
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
    textAlign: "right",
    fontFamily: "Cairo_600SemiBold",
  },
  bannerIcon: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  lottieIcon: {
    width: "100%",
    height: "100%",
  },
});
export default NextPrayerBanner;
