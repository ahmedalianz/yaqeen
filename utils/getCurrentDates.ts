import { toHijri } from "hijri-converter";
import toArabicNumerals from "./toArabicNumerals";

const gregorianMonths = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const weekdays = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const hijriMonths = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];
const getCurrentDates = () => {
  const now = new Date();

  const gregorianDay = now.getDate();
  const gregorianMonth = now.getMonth();
  const gregorianYear = now.getFullYear();
  const weekday = now.getDay();

  const gregorianFullArabic = `${weekdays[weekday]} ,${gregorianDay} ${gregorianMonths[gregorianMonth]} ${gregorianYear}`;

  const hijriDate = toHijri(gregorianYear, gregorianMonth + 1, gregorianDay);

  const hijriFullArabic = `${hijriDate.hd} ${hijriMonths[hijriDate.hm - 1]} ${
    hijriDate.hy
  }`;

  const hijriFormatted = `${hijriDate.hy}-${hijriDate.hm
    .toString()
    .padStart(2, "0")}-${hijriDate.hd.toString().padStart(2, "0")}`;

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "م" : "ص";

  hours = hours % 12;
  hours = hours ? hours : 12;

  const currentTime = `${minutes} : ${hours
    .toString()
    .padStart(2, "0")} ${ampm}`;

  return {
    gregorian: {
      date: now.toLocaleDateString("en-CA"),
      full: toArabicNumerals(gregorianFullArabic),
      day: gregorianDay,
      month: gregorianMonth + 1,
      year: gregorianYear,
    },
    hijri: {
      date: hijriFormatted,
      full: toArabicNumerals(hijriFullArabic),
      day: hijriDate.hd,
      month: hijriDate.hm,
      year: hijriDate.hy,
      monthName: hijriMonths[hijriDate.hm - 1],
    },
    time: toArabicNumerals(currentTime),
    timestamp: now.getTime(),
  };
};

export default getCurrentDates;
