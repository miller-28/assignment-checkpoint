// Tracking Number Generator Service
export class TrackingService {
  generateTrackingNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11).toUpperCase();
    return `TRACK-${timestamp}-${random}`;
  }
}
