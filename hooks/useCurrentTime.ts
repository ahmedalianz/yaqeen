import getCurrentDates from "@/utils/getCurrentDates";
import { useEffect, useState } from "react";

export const useCurrentTime = (updateInterval: number = 60000) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date(getCurrentDates().time));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return currentTime;
};
