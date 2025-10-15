import { notificationService } from "@/services/notificationService";
import { PrayerTime } from "@/services/prayerTimeServices";
import { useLocationStore } from "@/stores/locationStore";
import { usePrayerTimesStore } from "@/stores/prayerTimeStore";
import calculateTimeRemaining from "@/utils/calculateTimeRemaining";
import getCurrentDates from "@/utils/getCurrentDates";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
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
    calculatePrayerTimes,
    error: prayerTimesError,
  } = usePrayerTimesStore();

  const [currentTime, setCurrentTime] = useState(new Date());

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

  const handleRefreshLocation = async () => {
    await fetchLocation();
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date(getCurrentDates().time));
    }, 60000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

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
  }, []);

  const moonRotation = moonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const PrayerTimeCard = ({
    prayer,
    index,
    prevPrayer,
  }: {
    prayer: PrayerTime;
    index: number;
    prevPrayer?: PrayerTime;
  }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(cardAnim, {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, [cardAnim, index]);

    const cardScale = cardAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const cardOpacity = cardAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={[
          styles.prayerCard,
          prayer.isNext && styles.nextPrayerCard,
          {
            opacity: cardOpacity,
            transform: [
              { scale: cardScale },
              prayer.isNext ? { scale: pulseAnim } : { scale: 1 },
            ],
          },
        ]}
      >
        <View style={styles.prayerCardContent}>
          <View style={styles.prayerInfo}>
            <Animated.Text
              style={[
                styles.prayerIcon,
                {
                  transform: [
                    {
                      rotate: prayer.english === "Fajr" ? moonRotation : "0deg",
                    },
                  ],
                },
              ]}
            >
              {prayer.icon}
            </Animated.Text>
            <View>
              <Text
                style={[
                  styles.prayerName,
                  prayer.isNext && styles.nextPrayerText,
                ]}
              >
                {prayer.name}
              </Text>
              <Text style={styles.prayerEnglish}>{prayer.english}</Text>
            </View>
          </View>

          <View style={styles.timeContainer}>
            {prayer.isNext && (
              <Animated.View
                style={[
                  styles.nextBadge,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Ionicons name="notifications" size={12} color="#fff" />
                <Text style={styles.nextBadgeText}>القادمة</Text>
              </Animated.View>
            )}
            <Text
              style={[
                styles.prayerTime,
                prayer.isNext && styles.nextPrayerText,
                prayer.passed && styles.passedTime,
              ]}
            >
              {prayer.displayTime}
            </Text>

            {!prayer.passed && prayer.english !== "Sunrise" && (
              <Text style={styles.timeUntil}>
                {calculateTimeRemaining(new Date(prayer.time))}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };
  const testSimpleNotification = async () => {
    try {
      // Test with a simple future date (1 minute from now)
      const testDate = new Date();
      testDate.setMinutes(testDate.getMinutes() + 1);

      console.log("Testing notification with date:", testDate);

      await notificationService.scheduleNotification(
        testDate,
        "🔄 تجربة الإشعار",
        "هذا إشعار تجريبي لاختبار النظام",
        true,
        `test_${Date.now()}`
      );

      alert("✅ تم جدولة الإشعار التجريبي بنجاح!");
    } catch (error) {
      console.error("Test notification failed:", error);
      alert("❌ فشل جدولة الإشعار التجريبي: ");
    }
  };
  const FeatureButton = ({
    icon,
    title,
    subtitle,
    color,
    delay,
    onPress,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    color: string;
    delay: number;
    onPress: () => void;
  }) => {
    const featureAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(featureAnim, {
        toValue: 1,
        delay: delay,
        useNativeDriver: true,
      }).start();
    }, [delay, featureAnim]);

    return (
      <Animated.View
        style={{
          opacity: featureAnim,
          transform: [
            {
              translateY: featureAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={[styles.featureButton, { borderLeftColor: color }]}
          onPress={onPress}
        >
          <View style={[styles.featureIcon, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#fff" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureSubtitle}>{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
          <LinearGradient
            colors={["#0a0f1c", "#1a1f2c", "#2d3748"]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.headerContent, { paddingTop: top }]}>
              <View style={styles.headerTop}>
                <TouchableOpacity
                  onPress={handleRefreshLocation}
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
                    {prayerTimesLoading && (
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
                            {nextPrayer?.prayer.name.includes("الغد")
                              ? "أول صلاة غداً"
                              : "الصلاة القادمة"}
                          </Text>
                          <Text style={styles.bannerPrayer}>
                            {nextPrayer?.prayer.name}
                          </Text>
                          <Text style={styles.bannerTime}>
                            {`${calculateTimeRemaining(
                              new Date(nextPrayer?.prayer?.time ?? new Date())
                            )} متبقية`}
                          </Text>
                          {nextPrayer?.prayer.name.includes("الغد") && (
                            <Text style={styles.tomorrowNote}>
                              صلاة فجر يوم الغد
                            </Text>
                          )}
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </Animated.View>
              )}
            </View>
          </LinearGradient>
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
                  prevPrayer={index > 0 ? prayerTimes[index - 1] : undefined}
                />
              ))}
            </View>
          </View>

          {/* Features Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الميزات</Text>
            <View style={styles.featuresGrid}>
              <FeatureButton
                icon="compass"
                title="اتجاه القبلة"
                subtitle="ابحث عن اتجاه الصلاة"
                color="#10b981"
                delay={600}
                onPress={() => {}}
              />
              <FeatureButton
                icon="book"
                title="القرآن الكريم"
                subtitle="اقرأ وتدبر القرآن"
                color="#f59e0b"
                delay={700}
                onPress={() => {}}
              />
              <FeatureButton
                icon="notifications"
                title="الإشعارات"
                subtitle="إدارة تنبيهات الصلاة"
                color="#ef4444"
                delay={800}
                onPress={() => {}}
              />
              <FeatureButton
                icon="musical-notes"
                title="الأذان"
                subtitle="اختر المؤذن المفضل"
                color="#8b5cf6"
                delay={900}
                onPress={() => {}}
              />
            </View>
          </View>

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
            <LinearGradient
              colors={["#f8fafc", "#e2e8f0"]}
              style={styles.quoteGradient}
            >
              <View style={styles.quoteIcon}>
                <Ionicons name="chatbox-ellipses" size={24} color="#0c4a6e" />
              </View>
              <Text style={styles.quoteText}>
                {"مفتاح الجنة الصلاة، ومفتاح الصلاة الطهور"}
              </Text>
              <Text style={styles.quoteSource}>- رسول الله ﷺ</Text>
              <View style={styles.quoteDecoration}>
                <Text style={styles.quoteArabic}>ﷺ</Text>
              </View>
            </LinearGradient>
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
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  prayerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
    overflow: "hidden",
  },
  nextPrayerCard: {
    backgroundColor: "#fff",
    borderLeftColor: "#d4a574",
    borderWidth: 2,
    borderColor: "#d4a574",
  },
  glowEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#d4a574",
    opacity: 0.05,
  },
  prayerCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prayerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerActive: {
    backgroundColor: "#fef3c7",
  },
  prayerIcon: {
    fontSize: 26,
  },
  prayerName: {
    fontSize: 18,
    fontFamily: "Cairo_600SemiBold",
    color: "#0f172a",
    textAlign: "right",
  },
  prayerEnglish: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
  },
  nextPrayerText: {
    color: "#d4a574",
    fontFamily: "Cairo_700Bold",
  },
  timeContainer: {
    alignItems: "flex-end",
    gap: 6,
  },
  nextBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d4a574",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  nextBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Cairo_700Bold",
  },
  prayerTime: {
    fontSize: 20,
    color: "#0ea5e9",
    fontFamily: "Cairo_700Bold",
  },
  passedTime: {
    color: "#94a3b8",
    textDecorationLine: "line-through",
    fontFamily: "Cairo_500Medium",
  },
  timeUntil: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Cairo_500Medium",
    marginTop: 2,
  },

  featuresGrid: {
    gap: 12,
  },
  featureButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  featureIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    color: "#0f172a",
    textAlign: "right",
    fontFamily: "Cairo_600SemiBold",
  },
  featureSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    textAlign: "right",
    fontFamily: "Cairo_400Regular",
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
  quoteGradient: {
    padding: 24,
    position: "relative",
  },
  quoteIcon: {
    alignSelf: "flex-end",
    marginBottom: 12,
    opacity: 0.6,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#334155",
    lineHeight: 28,
    textAlign: "right",
    marginBottom: 12,
    fontFamily: "Cairo_500Medium",
  },
  quoteSource: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "right",
    fontFamily: "Cairo_600SemiBold",
  },
  quoteDecoration: {
    position: "absolute",
    top: -20,
    left: -20,
    opacity: 0.1,
  },
  quoteArabic: {
    fontSize: 80,
    color: "#0c4a6e",
    fontFamily: "Cairo_400Regular",
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
  tomorrowNote: {
    fontSize: 12,
    color: "#fef3c7",
    marginTop: 4,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
  },
});
