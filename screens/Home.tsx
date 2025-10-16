import {
  DailyQuote,
  Features,
  Header,
  PrayerTimeCard,
} from "@/components/home";
import { useLocationStore } from "@/stores/locationStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { usePrayerTimesStore } from "@/stores/prayerTimeStore";
import calculateTimeRemaining from "@/utils/calculateTimeRemaining";
import getCurrentDates from "@/utils/getCurrentDates";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function App() {
  const router = useRouter();
  const { gregorian, hijri, time } = getCurrentDates();

  const {
    prayerTimes,
    nextPrayer,
    isLoading: prayerTimesLoading,
    onReachNextPrayerTime,
    error: prayerTimesError,
  } = usePrayerTimesStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const remainingTime = useMemo(
    () =>
      calculateTimeRemaining(new Date(nextPrayer?.prayer?.time ?? new Date())),
    [nextPrayer?.prayer?.time]
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const moonAnim = useRef(new Animated.Value(0)).current;

  const { top } = useSafeAreaInsets();
  const {
    location,
    isLoading: locationLoading,
    fetchLocation,
  } = useLocationStore();
  const { lastScheduledDate } = useNotificationStore();
  console.log({ lastScheduledDate });
  const handleRefreshLocation = async () => {
    await fetchLocation();
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date(getCurrentDates().time));
      if (remainingTime === "الآن" && location) {
        onReachNextPrayerTime(location);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [nextPrayer, location, remainingTime, onReachNextPrayerTime]);

  // Start animations on mount
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Gentle pulse for next prayer
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slow moon animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(moonAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(moonAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, moonAnim, pulseAnim, scaleAnim, slideAnim]);

  const moonRotation = moonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (prayerTimesLoading && !prayerTimes) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4a574" />
        <Text style={styles.loadingText}>جاري حساب أوقات الصلاة...</Text>
      </View>
    );
  }

  if (prayerTimesError && !prayerTimes) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{prayerTimesError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRefreshLocation}
        >
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1929" />

      {/* Animated Background */}
      <Animated.View
        pointerEvents="none"
        style={[styles.backgroundPattern, { opacity: fadeAnim }]}
      >
        <View style={styles.patternCircle1} />

        {/* Floating Islamic Elements */}
        <Animated.Image
          source={require("@/assets/images/sly.png")}
          resizeMode="contain"
          style={[
            styles.floatingImage,
            {
              transform: [
                {
                  translateY: moonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -40],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          }}
        >
          <Header
            isLoading={prayerTimesLoading}
            onRefreshLocation={handleRefreshLocation}
            pulseAnim={pulseAnim}
            remainingTime={remainingTime}
            nextPrayer={nextPrayer}
            {...{
              location,
              gregorian,
              hijri,
              time,
            }}
          />
        </Animated.View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Prayer Times Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>أوقات الصلاة اليوم</Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => Vibration.vibrate(30)}
              >
                <Text style={styles.viewAllText}>التقويم الشهري</Text>
                <Ionicons name="calendar" size={16} color="#0369a1" />
              </TouchableOpacity>
            </View>

            <View style={styles.prayerGrid}>
              {prayerTimes?.map((prayer, index) => (
                <PrayerTimeCard
                  key={prayer.name}
                  prayer={prayer}
                  index={index}
                  moonRotation={moonRotation}
                  pulseAnim={pulseAnim}
                />
              ))}
            </View>
          </View>

          <Features />

          {/* Daily Quote */}
          <Animated.View
            style={[
              styles.quoteCard,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <DailyQuote
              quote="أول ما يُحاسب به العبد يوم القيامة الصلاة فإن صلحت صلح سائر عمله، وإن فسدت فسد سائر عمله"
              source="- رسول الله ﷺ"
            />
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#0c4a6e",
    fontFamily: "Cairo_500Medium",
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  patternCircle1: {
    position: "absolute",
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(212, 165, 116, 0.08)",
  },

  floatingImage: {
    position: "absolute",
    top: 120,
    left: 10,
    width: 120,
    height: 80,
    opacity: 0.2,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    color: "#0f172a",
    textAlign: "right",
    fontFamily: "Cairo_700Bold",
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllText: {
    color: "#0369a1",
    fontSize: 13,
    fontFamily: "Cairo_600SemiBold",
  },
  prayerGrid: {
    gap: 12,
  },
  quoteCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
    fontFamily: "Cairo_500Medium",
  },
  retryButton: {
    backgroundColor: "#d4a574",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
  },
});
