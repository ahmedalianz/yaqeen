import { useNotificationStore } from "@/stores/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Settings = () => {
  const {
    enabled,
    notifyBeforePrayer,
    notifyAtPrayerTime,
    azanSoundEnabled,
    prePrayerMinutes,
    updateSettings,
    testNotification,
  } = useNotificationStore();

  const SettingItem = ({
    title,
    subtitle,
    value,
    onValueChange,
    icon,
  }: {
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon: string;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Ionicons name={icon as any} size={24} color="#d4a574" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#767577", true: "#d4a574" }}
        thumbColor={value ? "#f5dd4b" : "#f4f3f4"}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>إعدادات الإشعارات</Text>

      <SettingItem
        icon="notifications"
        title="تفعيل الإشعارات"
        subtitle="تشغيل إشعارات أوقات الصلاة"
        value={enabled}
        onValueChange={(value) => updateSettings({ enabled: value })}
      />

      <SettingItem
        icon="time"
        title="الإشعار قبل الصلاة"
        subtitle="إشعار قبل وقت الصلاة"
        value={notifyBeforePrayer}
        onValueChange={(value) => updateSettings({ notifyBeforePrayer: value })}
      />

      <SettingItem
        icon="alarm"
        title="الإشعار عند وقت الصلاة"
        subtitle="إشعار عند دخول وقت الصلاة"
        value={notifyAtPrayerTime}
        onValueChange={(value) => updateSettings({ notifyAtPrayerTime: value })}
      />

      <SettingItem
        icon="musical-notes"
        title="صوت الأذان"
        subtitle="تشغيل صوت الأذان في الإشعارات"
        value={azanSoundEnabled}
        onValueChange={(value) => updateSettings({ azanSoundEnabled: value })}
      />

      <TouchableOpacity style={styles.testButton} onPress={testNotification}>
        <Ionicons name="notifications" size={20} color="#fff" />
        <Text style={styles.testButtonText}>تجربة الإشعار</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "Cairo_700Bold",
    color: "#0a1929",
    textAlign: "right",
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginRight: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
    color: "#0f172a",
    textAlign: "right",
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
    color: "#64748b",
    textAlign: "right",
    marginTop: 4,
  },
  testButton: {
    flexDirection: "row",
    backgroundColor: "#d4a574",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  testButtonText: {
    color: "#fff",
    fontFamily: "Cairo_600SemiBold",
    fontSize: 16,
    marginRight: 8,
  },
});

export default Settings;
