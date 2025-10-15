import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

export class AudioService {
  private sound: Audio.Sound | null = null;
  private isPlaying = false;

  constructor() {
    this.configureAudio();
  }

  private async configureAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      });
    } catch (error) {
      console.error("Error configuring audio:", error);
    }
  }

  async playAzan(): Promise<void> {
    if (this.isPlaying) {
      await this.stopAzan();
    }

    try {
      // Create new sound instance
      this.sound = new Audio.Sound();

      // Load and play the azan sound
      await this.sound.loadAsync(require("@/assets/audio/azan.mp3"));
      await this.sound.playAsync();

      this.isPlaying = true;

      // Set up completion handler
      this.sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          this.isPlaying = false;
          this.cleanup();
        }
      });
    } catch (error) {
      console.error("Error playing azan:", error);
      this.isPlaying = false;
      this.cleanup();
      throw error;
    }
  }

  async stopAzan(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      }
    } catch (error) {
      console.error("Error stopping azan:", error);
    } finally {
      this.isPlaying = false;
      this.cleanup();
    }
  }

  private cleanup() {
    this.sound = null;
    this.isPlaying = false;
  }

  isAzanPlaying(): boolean {
    return this.isPlaying;
  }
}
