import assert from 'node:assert';
import test from 'node:test';
import { GeofenceEngine } from '../dist/geofence-engine.js';

test('GeofenceEngine detects polygon boundary entry and speeding violation', () => {
  const engine = new GeofenceEngine();
  engine.addGeofence({
    id: 'warehouse_perimeter',
    name: 'Central Warehouse',
    vertices: [
      { lat: 10, lng: 10 },
      { lat: 10, lng: 20 },
      { lat: 20, lng: 20 },
      { lat: 20, lng: 10 }
    ]
  });

  const alerts = engine.processTelemetry({
    vehicleId: 'truck_07',
    point: { lat: 15, lng: 15 },
    speedKmh: 135,
    timestamp: Date.now()
  });

  assert.strictEqual(alerts.length, 2);
  assert.strictEqual(alerts[0].type, 'ENTER');
  assert.strictEqual(alerts[1].type, 'SPEEDING');
});
