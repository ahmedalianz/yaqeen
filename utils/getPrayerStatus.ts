import { PrayerTime } from "@/services/prayerTimeServices";

export const getPrayerStatus = (prayer: PrayerTime) => {
  const now = new Date();
  const prayerTime = new Date(prayer.time);

  return {
    isPassed: prayerTime < now,
    isNext: prayer.isNext,
    isUpcoming: !prayer.isNext && prayerTime > now && !prayer.passed,
  };
};

export const shouldShowTimeUntil = (prayer: PrayerTime) => {
  return !prayer.passed && prayer.english !== "Sunrise";
};
