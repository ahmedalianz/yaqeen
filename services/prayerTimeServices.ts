import { CalculationMethod, Coordinates, PrayerTimes } from "adhan";

export interface PrayerTime {
  name: string;
  time: Date;
  displayTime: string;
  isNext: boolean;
  passed: boolean;
  icon: string;
  english: string;
}

export class PrayerTimeService {
  private calculationMethod: string;

  constructor(calculationMethod: string = "Egyptian") {
    this.calculationMethod = calculationMethod;
  }

  getCalculationParameters() {
    switch (this.calculationMethod) {
      case "UmmAlQura":
        return CalculationMethod.UmmAlQura();
      case "Egyptian":
        return CalculationMethod.Egyptian();
      default:
        return CalculationMethod.Egyptian();
    }
  }

  calculatePrayerTimes(
    latitude: number,
    longitude: number,
    date: Date = new Date()
  ): PrayerTime[] {
    try {
      const coordinates = new Coordinates(latitude, longitude);
      const params = this.getCalculationParameters();

      const calculationDate = new Date(date);
      if (isNaN(calculationDate.getTime())) {
        throw new Error("Invalid date provided for prayer calculation");
      }

      const prayerTimes = new PrayerTimes(coordinates, date, params);

      const prayers = [
        {
          name: "الفجر",
          english: "Fajr",
          time: prayerTimes.fajr,
          icon: "🌙",
        },
        {
          name: "الشروق",
          english: "Sunrise",
          time: prayerTimes.sunrise,
          icon: "☀️",
        },
        {
          name: "الظهر",
          english: "Dhuhr",
          time: prayerTimes.dhuhr,
          icon: "🕌",
        },
        {
          name: "العصر",
          english: "Asr",
          time: prayerTimes.asr,
          icon: "📿",
        },
        {
          name: "المغرب",
          english: "Maghrib",
          time: prayerTimes.maghrib,
          icon: "🌅",
        },
        {
          name: "العشاء",
          english: "Isha",
          time: prayerTimes.isha,
          icon: "🌟",
        },
      ];

      const now = new Date();

      return prayers.map((prayer) => {
        const prayerTime = new Date(prayer.time);

        const passed = prayerTime < now;

        return {
          ...prayer,
          time: prayerTime,
          displayTime: this.formatTime(prayerTime),
          passed,
          isNext: false,
        };
      });
    } catch (error) {
      console.error("Error calculating prayer times:", error);
      // Return fallback prayer times
      return this.getFallbackPrayerTimes();
    }
  }
  private getFallbackPrayerTimes(): PrayerTime[] {
    const now = new Date();
    const prayers = [
      { name: "الفجر", english: "Fajr", icon: "🌙", hour: 5, minute: 30 },
      { name: "الشروق", english: "Sunrise", icon: "☀️", hour: 6, minute: 45 },
      { name: "الظهر", english: "Dhuhr", icon: "🕌", hour: 12, minute: 30 },
      { name: "العصر", english: "Asr", icon: "📿", hour: 15, minute: 45 },
      { name: "المغرب", english: "Maghrib", icon: "🌅", hour: 18, minute: 20 },
      { name: "العشاء", english: "Isha", icon: "🌟", hour: 19, minute: 45 },
    ];

    return prayers.map((prayer) => {
      const prayerTime = new Date(now);
      prayerTime.setHours(prayer.hour, prayer.minute, 0, 0);

      // If time has passed today, set for tomorrow
      if (prayerTime < now) {
        prayerTime.setDate(prayerTime.getDate() + 1);
      }

      return {
        name: prayer.name,
        english: prayer.english,
        time: prayerTime,
        displayTime: this.formatTime(prayerTime),
        passed: false,
        isNext: false,
        icon: prayer.icon,
      };
    });
  }
  getNextPrayer(
    prayerTimes: PrayerTime[],
    latitude: number,
    longitude: number
  ): { prayer: PrayerTime } | null {
    const now = new Date();
    let nextPrayer: PrayerTime | null = null;
    let minTimeDiff = Infinity;

    // Reset isNext for all prayers
    prayerTimes.forEach((prayer) => (prayer.isNext = false));

    // Find the next prayer in today's prayers
    for (const prayer of prayerTimes) {
      if (prayer.english === "Sunrise") continue;

      const timeDiff = prayer.time.getTime() - now.getTime();

      if (timeDiff > 0 && timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        nextPrayer = prayer;
      }
    }

    if (nextPrayer) {
      nextPrayer.isNext = true;
      return { prayer: nextPrayer };
    }

    // If no next prayer found in today's prayers, get Fajr of tomorrow
    return this.getTomorrowFajr(latitude, longitude);
  }

  private getTomorrowFajr(
    latitude: number,
    longitude: number
  ): { prayer: PrayerTime } | null {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tomorrowPrayerTimes = this.calculatePrayerTimes(
        latitude,
        longitude,
        tomorrow
      );
      const tomorrowFajr = tomorrowPrayerTimes.find(
        (prayer) => prayer.english === "Fajr"
      );

      if (tomorrowFajr) {
        // Create a modified prayer object to indicate it's tomorrow's prayer
        const tomorrowFajrWithIndicator: PrayerTime = {
          ...tomorrowFajr,
          name: "فجر الغد",
          displayTime: `غداً ${tomorrowFajr.displayTime}`,
          isNext: true,
        };

        return { prayer: tomorrowFajrWithIndicator };
      }
    } catch (error) {
      console.error("Error calculating tomorrow Fajr:", error);
    }

    return null;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Convert to Arabic numerals
    const arabicHours = this.toArabicNumerals(
      hours.toString().padStart(2, "0")
    );
    const arabicMinutes = this.toArabicNumerals(
      minutes.toString().padStart(2, "0")
    );

    return `${arabicHours}:${arabicMinutes}`;
  }

  private toArabicNumerals(str: string): string {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return str.replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
  }
}
