import { CompassData, CompassService } from "@/services/compassService";
import { QiblaService } from "@/services/qiblaService";
import { useLocationStore } from "@/stores/locationStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const COMPASS_SIZE = Math.min(width, height) * 0.8;

export default function Qibla() {
  const { location } = useLocationStore();
  const insets = useSafeAreaInsets();

  const [compassData, setCompassData] = useState<CompassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [alignmentStatus, setAlignmentStatus] = useState<
    "aligned" | "needs_alignment" | "calibrating"
  >("needs_alignment");

  const compassService = useRef(new CompassService());
  const compassRotation = useRef(new Animated.Value(0)).current;
  const qiblaRotation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const kaabaPulseAnim = useRef(new Animated.Value(1)).current;

  // Initialize compass
  useEffect(() => {
    const initCompass = async () => {
      if (!location) {
        setError("لم يتم تحديد الموقع بعد");
        setIsLoading(false);
        return;
      }

      try {
        const success = await compassService.current.initialize(
          location,
          handleCompassUpdate
        );

        if (!success) {
          throw new Error("لا يمكن تشغيل البوصلة على هذا الجهاز");
        }

        compassService.current.startCompass();
        setIsLoading(false);

        // Start entrance animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();

        // Start kaaba pulse animation
        startKaabaPulse();
      } catch (err) {
        setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
        setIsLoading(false);
      }
    };

    initCompass();

    return () => {
      compassService.current.stopCompass();
    };
  }, [location]);

  // Kaaba pulse animation
  const startKaabaPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(kaabaPulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(kaabaPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Handle compass updates with smooth animations
  const handleCompassUpdate = (data: CompassData) => {
    setCompassData(data);

    // Update alignment status based on accuracy
    if (data.accuracy > 80) {
      setAlignmentStatus("aligned");
    } else if (data.accuracy > 60) {
      setAlignmentStatus("needs_alignment");
    } else {
      setAlignmentStatus("calibrating");
    }

    // Smooth compass rotation
    Animated.timing(compassRotation, {
      toValue: data.angle,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Smooth qibla indicator rotation
    Animated.timing(qiblaRotation, {
      toValue: data.qiblaAngle,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  // Get guidance message based on angle difference
  const getGuidanceMessage = () => {
    if (!compassData) return "جاري تحديد الاتجاه...";

    const angleDiff = Math.abs(compassData.qiblaAngle - compassData.angle);
    const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);

    if (normalizedDiff <= 5) {
      return "🎉 أنت متجه نحو القبلة مباشرة!";
    } else if (normalizedDiff <= 15) {
      return "🔍 اقتربت من القبلة، استمر في التعديل";
    } else {
      const direction =
        compassData.qiblaAngle > compassData.angle ? "اليمين" : "اليسار";
      return `↪️ حرك الجهاز إلى ${direction} بمقدار ${Math.round(
        normalizedDiff
      )} درجة`;
    }
  };

  // Get alignment status message
  const getAlignmentMessage = () => {
    switch (alignmentStatus) {
      case "aligned":
        return { text: "✅ الجهاز مضبوط", color: "#10b981" };
      case "needs_alignment":
        return { text: "⚠️ يحتاج إلى ضبط بسيط", color: "#f59e0b" };
      case "calibrating":
        return { text: "🔄 يرجى معايرة البوصلة", color: "#ef4444" };
      default:
        return { text: "جاري التحديد...", color: "#6b7280" };
    }
  };

  // Calibration animation
  const startCalibration = () => {
    setIsCalibrating(true);
    setAlignmentStatus("calibrating");

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setTimeout(() => {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setIsCalibrating(false);
      setAlignmentStatus("aligned");
    }, 3000);
  };

  const getDistanceText = () => {
    if (!location) return "--";
    const distance = QiblaService.calculateDistance(location);
    return `${Math.round(distance)} كم`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy > 80) return "#10b981";
    if (accuracy > 60) return "#f59e0b";
    return "#ef4444";
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0f172a", "#1e293b", "#334155"]}
          style={styles.gradient}
        >
          <LottieView
            source={require("@/assets/loading.json")}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>جاري تحميل البوصلة...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0f172a", "#1e293b", "#334155"]}
          style={styles.gradient}
        >
          <Ionicons name="compass" size={80} color="#ef4444" />
          <Text style={styles.errorTitle}>خطأ في البوصلة</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  const alignmentInfo = getAlignmentMessage();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155"]}
        style={[styles.gradient, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>اتجاه القبلة</Text>
            <View style={styles.alignmentStatus}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: alignmentInfo.color },
                ]}
              />
              <Text style={[styles.statusText, { color: alignmentInfo.color }]}>
                {alignmentInfo.text}
              </Text>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Guidance Message */}
          <View style={styles.guidanceContainer}>
            <Text style={styles.guidanceText}>{getGuidanceMessage()}</Text>
          </View>

          {/* Compass Container */}
          <View style={styles.compassContainer}>
            {/* Compass Ring */}
            <Animated.View
              style={[
                styles.compassRing,
                {
                  transform: [
                    {
                      rotate: compassRotation.interpolate({
                        inputRange: [0, 360],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Compass Markings */}
              <View style={styles.compassMarkings}>
                {[...Array(36)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.compassMark,
                      i % 3 === 0 && styles.compassMajorMark,
                      i % 9 === 0 && styles.compassCardinalMark,
                    ]}
                  />
                ))}
              </View>

              {/* Compass Directions */}
              <View style={styles.directionMarker}>
                <Text style={[styles.directionText, styles.northText]}>
                  شمال
                </Text>
                <Text style={[styles.directionText, styles.southText]}>
                  جنوب
                </Text>
                <Text style={[styles.directionText, styles.eastText]}>شرق</Text>
                <Text style={[styles.directionText, styles.westText]}>غرب</Text>
              </View>
            </Animated.View>

            {/* Qibla Indicator with Kaaba */}
            <Animated.View
              style={[
                styles.qiblaIndicator,
                {
                  transform: [
                    {
                      rotate: qiblaRotation.interpolate({
                        inputRange: [0, 360],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Qibla Direction Line */}
              <View style={styles.qiblaLine} />

              {/* Kaaba at the end of the line - positioned at the edge */}
              <Animated.View
                style={[
                  styles.kaabaContainer,
                  { transform: [{ scale: kaabaPulseAnim }] },
                ]}
              >
                <LinearGradient
                  colors={["#b45309", "#92400e", "#78350f"]}
                  style={styles.kaabaIcon}
                >
                  <Ionicons name="cube" size={24} color="#fef3c7" />
                </LinearGradient>
                <View style={styles.kaabaGlow} />
                <Text style={styles.kaabaText}>الكعبة</Text>
              </Animated.View>
            </Animated.View>

            {/* Current Direction Arrow - Fixed at top */}
            <View style={styles.directionArrow}>
              <Ionicons name="caret-up" size={32} color="#ef4444" />
              <Text style={styles.arrowText}>اتجاهك</Text>
            </View>

            {/* Center Point */}
            <View style={styles.centerPoint} />
          </View>

          {/* Info Cards - Fixed layout */}
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: "rgba(212, 165, 116, 0.2)" },
                ]}
              >
                <Ionicons name="navigate" size={20} color="#d4a574" />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>اتجاه القبلة</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {compassData ? Math.round(compassData.qiblaAngle) : "--"}°
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: "rgba(16, 185, 129, 0.2)" },
                ]}
              >
                <Ionicons name="speedometer" size={20} color="#10b981" />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>دقة البوصلة</Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: getAccuracyColor(compassData?.accuracy || 0) },
                  ]}
                  numberOfLines={1}
                >
                  {compassData ? Math.round(compassData.accuracy) : "--"}%
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: "rgba(139, 92, 246, 0.2)" },
                ]}
              >
                <Ionicons name="location" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>المسافة</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {getDistanceText()}
                </Text>
              </View>
            </View>
          </View>

          {/* Calibration Button */}
          <TouchableOpacity
            style={[
              styles.calibrateButton,
              isCalibrating && styles.calibratingButton,
            ]}
            onPress={startCalibration}
            disabled={isCalibrating}
          >
            <Ionicons
              name={isCalibrating ? "sync" : "compass"}
              size={20}
              color="#fff"
            />
            <Text style={styles.calibrateButtonText}>
              {isCalibrating ? "جاري المعايرة..." : "معايرة البوصلة"}
            </Text>
          </TouchableOpacity>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>تعليمات الاستخدام:</Text>
            <View style={styles.instructionItem}>
              <Ionicons name="phone-portrait" size={16} color="#d4a574" />
              <Text style={styles.instructionsText}>
                امسك الهاتف بشكل أفقي مستوٍ
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="compass" size={16} color="#d4a574" />
              <Text style={styles.instructionsText}>
                اتبع التعليمات الظاهرة لأعلى/أسفل
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="cube" size={16} color="#d4a574" />
              <Text style={styles.instructionsText}>
                حرك الهاتف حتى تصبح الكعبة في الأعلى
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Cairo_700Bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  alignmentStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Cairo_600SemiBold",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  guidanceContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#d4a574",
    width: "100%",
  },
  guidanceText: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
    color: "#fff",
    textAlign: "center",
  },
  compassContainer: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    position: "relative",
  },
  compassRing: {
    width: "100%",
    height: "100%",
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 4,
    borderColor: "rgba(212, 165, 116, 0.5)",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  compassMarkings: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  compassMark: {
    position: "absolute",
    width: 2,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    left: "50%",
    marginLeft: -1,
    top: 0,
  },
  compassMajorMark: {
    height: 20,
    backgroundColor: "rgba(212, 165, 116, 0.6)",
  },
  compassCardinalMark: {
    height: 30,
    backgroundColor: "#d4a574",
    width: 3,
  },
  directionMarker: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  directionText: {
    position: "absolute",
    fontSize: 16,
    fontFamily: "Cairo_700Bold",
    color: "#d4a574",
  },
  northText: {
    top: 15,
    left: "50%",
    transform: [{ translateX: -20 }],
  },
  southText: {
    bottom: 15,
    left: "50%",
    transform: [{ translateX: -20 }],
  },
  eastText: {
    right: 15,
    top: "50%",
    transform: [{ translateY: -8 }],
  },
  westText: {
    left: 15,
    top: "50%",
    transform: [{ translateY: -8 }],
  },
  qiblaIndicator: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  qiblaLine: {
    position: "absolute",
    width: 2,
    height: "45%", // From center to near edge
    backgroundColor: "#d4a574",
    top: "5%", // Start slightly below center
  },
  kaabaContainer: {
    position: "absolute",
    top: "5%", // Position at the end of the line
    alignItems: "center",
    zIndex: 20,
  },
  kaabaIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#d4a574",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#fef3c7",
  },
  kaabaGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(212, 165, 116, 0.3)",
    zIndex: -1,
  },
  kaabaText: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
    color: "#e0f2fe",
    marginTop: 4,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  directionArrow: {
    position: "absolute",
    top: -10, // Position above compass
    alignItems: "center",
    zIndex: 15,
  },
  arrowText: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
    color: "#ef4444",
    marginTop: 4,
  },
  centerPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 5,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 16,
    minHeight: 80,
    justifyContent: "center",
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    alignItems: "center",
    width: "100%",
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
    color: "#94a3b8",
    textAlign: "center",
  },
  infoValue: {
    fontSize: 16,
    fontFamily: "Cairo_700Bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 4,
  },
  calibrateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d4a574",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 20,
    width: "100%",
    shadowColor: "#d4a574",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  calibratingButton: {
    backgroundColor: "#f59e0b",
  },
  calibrateButtonText: {
    color: "#fff",
    fontFamily: "Cairo_600SemiBold",
    fontSize: 16,
    marginRight: 8,
  },
  instructions: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 165, 116, 0.2)",
    width: "100%",
  },
  instructionsTitle: {
    fontSize: 18,
    fontFamily: "Cairo_600SemiBold",
    color: "#d4a574",
    textAlign: "right",
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
    color: "#e0f2fe",
    textAlign: "right",
    marginRight: 8,
    flex: 1,
  },
  loadingAnimation: {
    width: 120,
    height: 120,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    color: "#e0f2fe",
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: "Cairo_700Bold",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    color: "#e0f2fe",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#d4a574",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontFamily: "Cairo_600SemiBold",
    fontSize: 16,
  },
});
