import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DailyQuoteProps {
  quote: string;
  source: string;
}

const DailyQuote: React.FC<DailyQuoteProps> = ({ quote, source }) => {
  return (
    <LinearGradient
      colors={["#f8fafc", "#e2e8f0"]}
      style={styles.quoteGradient}
    >
      <View style={styles.quoteIcon}>
        <Ionicons name="chatbox-ellipses" size={24} color="#0c4a6e" />
      </View>
      <Text style={styles.quoteText}>{quote}</Text>
      <Text style={styles.quoteSource}>{source}</Text>
      <View style={styles.quoteDecoration}>
        <Text style={styles.quoteArabic}>ﷺ</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
});
export default DailyQuote;
