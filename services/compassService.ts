import { Magnetometer } from "expo-sensors";
import { Coordinates, QiblaService } from "./qiblaService";

export interface CompassData {
  angle: number;
  qiblaAngle: number;
  accuracy: number;
}

export class CompassService {
  private isActive = false;
  private subscription: any = null;
  private userLocation: Coordinates | null = null;
  private onCompassUpdate: ((data: CompassData) => void) | null = null;
  private calibrationData: number[] = [];
  private calibrationCount = 0;
  async initialize(
    location: Coordinates,
    onUpdate: (data: CompassData) => void
  ): Promise<boolean> {
    try {
      this.userLocation = location;
      this.onCompassUpdate = onUpdate;

      // Check if magnetometer is available
      const isAvailable = await Magnetometer.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("تحديد الاتجاهات غير متاح على هذا الجهاز");
      }

      // Set update interval
      Magnetometer.setUpdateInterval(100);

      return true;
    } catch (error) {
      console.error("Error initializing compass:", error);
      return false;
    }
  }

  startCompass(): void {
    if (this.isActive || !this.userLocation || !this.onCompassUpdate) return;

    this.isActive = true;

    this.subscription = Magnetometer.addListener((data) => {
      if (!this.userLocation) return;

      // Calculate compass angle from magnetometer data
      let angle = 0;
      if (Math.abs(data.x) > 0.01 || Math.abs(data.y) > 0.01) {
        angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      }

      // Convert to 0-360 degrees
      if (angle < 0) {
        angle += 360;
      }

      // Calculate Qibla direction
      const qiblaDirection = QiblaService.calculateQiblaDirection(
        this.userLocation
      );

      // Calculate relative Qibla angle
      const qiblaAngle = (360 - angle + qiblaDirection) % 360;

      const compassData: CompassData = {
        angle,
        qiblaAngle,
        accuracy: Math.min(100, Math.abs(data.z) * 10), // Simple accuracy estimation
      };

      this.onCompassUpdate?.(compassData);
    });
  }

  stopCompass(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isActive = false;
  }

  async calibrate(): Promise<void> {
    this.calibrationData = [];
    this.calibrationCount = 0;

    return new Promise((resolve) => {
      const calibrationInterval = setInterval(() => {
        if (this.calibrationCount >= 10) {
          clearInterval(calibrationInterval);
          resolve();
        }
      }, 300);
    });
  }

  getCalibrationProgress(): number {
    return (this.calibrationCount / 10) * 100;
  }

  // Enhanced compass data with calibration
  private processCompassData(data: any): number {
    let angle = 0;
    if (Math.abs(data.x) > 0.01 || Math.abs(data.y) > 0.01) {
      angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
    }

    // Apply calibration if available
    if (this.calibrationData.length > 5) {
      const avgCalibration =
        this.calibrationData.reduce((a, b) => a + b, 0) /
        this.calibrationData.length;
      angle -= avgCalibration;
    }

    if (angle < 0) {
      angle += 360;
    }

    // Store calibration data
    if (this.calibrationCount < 10) {
      this.calibrationData.push(angle);
      this.calibrationCount++;
    }

    return angle;
  }
}
