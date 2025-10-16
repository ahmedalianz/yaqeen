import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FeatureButtonProps {
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  delay: number;
  onPress: () => void;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({
  icon,
  title,
  subtitle,
  color,
  delay,
  onPress,
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

const styles = StyleSheet.create({
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
});
export default FeatureButton;
