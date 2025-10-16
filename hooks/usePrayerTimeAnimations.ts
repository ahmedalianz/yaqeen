import { useRef } from "react";
import { Animated, Easing } from "react-native";

export const usePrayerTimeAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const moonAnim = useRef(new Animated.Value(0)).current;

  const startAnimations = () => {
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
  };

  const moonRotation = moonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    pulseAnim,
    moonAnim,
    moonRotation,
    startAnimations,
  };
};
