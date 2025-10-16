import { notificationService } from "@/services/notificationService";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FeatureButton from "./FeatureButton";

const Features = () => {
  return (
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
          icon="notifications"
          title="الإشعارات"
          subtitle="الاشعارات المعلقة"
          color="#17bed0ff"
          delay={800}
          onPress={async () => {
            const not = await notificationService.checkBackgroundTaskStatus();
          }}
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
  );
};

export default Features;

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  featuresGrid: {
    gap: 12,
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
});
