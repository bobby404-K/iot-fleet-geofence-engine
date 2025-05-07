import { GpsPoint, TelemetryEvent, GeofencePolygon, GeofenceAlert } from './types.js';

export class GeofenceEngine {
  private geofences = new Map<string, GeofencePolygon>();
  private vehiclePositions = new Map<string, { lastPoint: GpsPoint; insideFences: Set<string> }>();

  addGeofence(polygon: GeofencePolygon): void {
    this.geofences.set(polygon.id, polygon);
  }

  // Ray-Casting Algorithm for Point-in-Polygon detection
  static isPointInsidePolygon(point: GpsPoint, vertices: GpsPoint[]): boolean {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].lat, yi = vertices[i].lng;
      const xj = vertices[j].lat, yj = vertices[j].lng;

      const intersect = ((yi > point.lng) !== (yj > point.lng)) &&
        (point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  processTelemetry(event: TelemetryEvent): GeofenceAlert[] {
    const alerts: GeofenceAlert[] = [];
    let state = this.vehiclePositions.get(event.vehicleId);
    if (!state) {
      state = { lastPoint: event.point, insideFences: new Set() };
      this.vehiclePositions.set(event.vehicleId, state);
    }

    for (const fence of this.geofences.values()) {
      const isInside = GeofenceEngine.isPointInsidePolygon(event.point, fence.vertices);
      const wasInside = state.insideFences.has(fence.id);

      if (isInside && !wasInside) {
        state.insideFences.add(fence.id);
        alerts.push({ vehicleId: event.vehicleId, geofenceId: fence.id, type: 'ENTER', timestamp: event.timestamp });
      } else if (!isInside && wasInside) {
        state.insideFences.delete(fence.id);
        alerts.push({ vehicleId: event.vehicleId, geofenceId: fence.id, type: 'EXIT', timestamp: event.timestamp });
      }
    }

    if (event.speedKmh > 120) {
      alerts.push({ vehicleId: event.vehicleId, geofenceId: 'speed_monitor', type: 'SPEEDING', timestamp: event.timestamp });
    }

    state.lastPoint = event.point;
    return alerts;
  }
}
