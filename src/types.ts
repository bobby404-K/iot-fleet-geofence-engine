export interface GpsPoint {
  lat: number;
  lng: number;
}

export interface TelemetryEvent {
  vehicleId: string;
  point: GpsPoint;
  speedKmh: number;
  timestamp: number;
}

export interface GeofencePolygon {
  id: string;
  name: string;
  vertices: GpsPoint[];
}

export interface GeofenceAlert {
  vehicleId: string;
  geofenceId: string;
  type: 'ENTER' | 'EXIT' | 'SPEEDING';
  timestamp: number;
}
