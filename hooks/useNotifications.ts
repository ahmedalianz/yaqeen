import * as Notifications from "expo-notifications";

export async function scheduleAzanNotification(title: string, time: Date) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: "It’s time for prayer",
      sound: "azan.mp3",
    },
    trigger: time,
  });
}
