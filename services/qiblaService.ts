export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class QiblaService {
  private static readonly KAABA_LAT = 21.4225; // Kaaba coordinates
  private static readonly KAABA_LNG = 39.8262;

  static calculateQiblaDirection(userLocation: Coordinates): number {
    const { latitude, longitude } = userLocation;

    // Convert degrees to radians
    const latRad = this.degreesToRadians(latitude);
    const lngRad = this.degreesToRadians(longitude);
    const kaabaLatRad = this.degreesToRadians(this.KAABA_LAT);
    const kaabaLngRad = this.degreesToRadians(this.KAABA_LNG);

    // Calculate the direction using spherical trigonometry
    const y = Math.sin(kaabaLngRad - lngRad);
    const x =
      Math.cos(latRad) * Math.tan(kaabaLatRad) -
      Math.sin(latRad) * Math.cos(kaabaLngRad - lngRad);

    let qiblaDirection = this.radiansToDegrees(Math.atan2(y, x));

    // Normalize to 0-360 degrees
    if (qiblaDirection < 0) {
      qiblaDirection += 360;
    }

    return qiblaDirection;
  }

  static calculateDistance(userLocation: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.degreesToRadians(this.KAABA_LAT - userLocation.latitude);
    const dLng = this.degreesToRadians(this.KAABA_LNG - userLocation.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(userLocation.latitude)) *
        Math.cos(this.degreesToRadians(this.KAABA_LAT)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }
}
