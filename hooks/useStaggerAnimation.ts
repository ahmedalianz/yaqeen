import { useEffect } from "react";
import { Animated } from "react-native";

export const useStaggerAnimation = (index: number, duration: number = 300) => {
  const anim = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return { scale, opacity };
};
