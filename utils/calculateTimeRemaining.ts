function toArabicNumerals(str: string): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return str.replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
}
function calculateTimeRemaining(prayerTime: Date): string {
  if (!prayerTime || !(prayerTime instanceof Date)) return "";
  const now = new Date();
  const diff = prayerTime.getTime() - now.getTime();

  if (diff <= 0) return "الآن";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${toArabicNumerals(hours.toString())} ساعة ${toArabicNumerals(
      minutes.toString()
    )} دقيقة`;
  } else {
    return `${toArabicNumerals(minutes.toString())} دقيقة`;
  }
}
export default calculateTimeRemaining;
