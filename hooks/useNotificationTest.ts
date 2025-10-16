import { notificationService } from "@/services/notificationService";
import { Alert } from "react-native";

export const useNotificationTest = () => {
  const testSimpleNotification = async () => {
    try {
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

      Alert.alert("✅ نجاح", "تم جدولة الإشعار التجريبي بنجاح!");
    } catch (error) {
      console.error("Test notification failed:", error);
      Alert.alert("❌ فشل", "فشل جدولة الإشعار التجريبي");
    }
  };

  return { testSimpleNotification };
};
