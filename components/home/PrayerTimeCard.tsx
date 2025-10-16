import { PrayerTime } from "@/services/prayerTimeServices";
import calculateTimeRemaining from "@/utils/calculateTimeRemaining";
import { getPrayerStatus, shouldShowTimeUntil } from "@/utils/getPrayerStatus";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface PrayerTimeCardProps {
  prayer: PrayerTime;
  index: number;
  moonRotation: Animated.AnimatedInterpolation<string | number>;
  pulseAnim: Animated.Value;
}

const PrayerTimeCard: React.FC<PrayerTimeCardProps> = ({
  prayer,
  index,
  moonRotation,
  pulseAnim,
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

  const { isNext } = getPrayerStatus(prayer);
  const showTimeUntil = shouldShowTimeUntil(prayer);

  return (
    <Animated.View
      style={[
        styles.prayerCard,
        isNext && styles.nextPrayerCard,
        {
          opacity: cardOpacity,
          transform: [
            { scale: cardScale },
            isNext ? { scale: pulseAnim } : { scale: 1 },
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
            <Text style={[styles.prayerName, isNext && styles.nextPrayerText]}>
              {prayer.name}
            </Text>
            <Text style={styles.prayerEnglish}>{prayer.english}</Text>
          </View>
        </View>

        <View style={styles.timeContainer}>
          {isNext && (
            <Animated.View
              style={[styles.nextBadge, { transform: [{ scale: pulseAnim }] }]}
            >
              <Ionicons name="notifications" size={12} color="#fff" />
              <Text style={styles.nextBadgeText}>القادمة</Text>
            </Animated.View>
          )}
          <Text
            style={[
              styles.prayerTime,
              isNext && styles.nextPrayerText,
              prayer.passed && styles.passedTime,
            ]}
          >
            {prayer.displayTime}
          </Text>

          {showTimeUntil && (
            <Text style={styles.timeUntil}>
              {calculateTimeRemaining(new Date(prayer.time))}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
});
export default PrayerTimeCard;
