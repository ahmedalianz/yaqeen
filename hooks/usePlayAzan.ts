import { useCallback } from "react";
import { useAudioPlayer } from "expo-audio";
const azanSound = require("@/assets/sounds/azan.mp3");
const usePlayAzan = () => {
  const azanPlayer = useAudioPlayer(azanSound);
  const play = useCallback(() => {
    try {
      azanPlayer.play();
    } catch (error) {
      console.error(error);
    }
  }, [azanPlayer]);
  const pause = useCallback(() => {
    try {
      azanPlayer.pause();
    } catch (error) {
      console.error(error);
    }
  }, [azanPlayer]);
  return {
    play,
    pause,
  };
};

export default usePlayAzan;
