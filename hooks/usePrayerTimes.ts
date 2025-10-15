import { useEffect, useState } from "react";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";

export function usePrayerTimes(lat: number, lon: number) {
  const [times, setTimes] = useState<PrayerTimes | null>(null);

  useEffect(() => {
    const date = new Date();
    const params = CalculationMethod.MuslimWorldLeague();
    const coords = new Coordinates(lat, lon);
    const prayerTimes = new PrayerTimes(coords, date, params);
    setTimes(prayerTimes);
  }, [lat, lon]);

  return times;
}
