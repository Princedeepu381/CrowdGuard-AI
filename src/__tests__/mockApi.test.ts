// Unit tests for CrowdGuard-AI mock API / telemetry engine

import { getStatusFromDensity, simulateTelemetry, INITIAL_ZONES } from '../../src/lib/mockApi';

describe('getStatusFromDensity', () => {
  test('returns CRITICAL when hazard is true (regardless of density)', () => {
    expect(getStatusFromDensity(10,  true)).toBe('CRITICAL');
    expect(getStatusFromDensity(50,  true)).toBe('CRITICAL');
    expect(getStatusFromDensity(100, true)).toBe('CRITICAL');
  });

  test('returns CLEAR when density < 60 and no hazard', () => {
    expect(getStatusFromDensity(0,  false)).toBe('CLEAR');
    expect(getStatusFromDensity(59, false)).toBe('CLEAR');
  });

  test('returns MODERATE when density is 60-79 and no hazard', () => {
    expect(getStatusFromDensity(60, false)).toBe('MODERATE');
    expect(getStatusFromDensity(79, false)).toBe('MODERATE');
  });

  test('returns CONGESTED when density >= 80 and no hazard', () => {
    expect(getStatusFromDensity(80,  false)).toBe('CONGESTED');
    expect(getStatusFromDensity(100, false)).toBe('CONGESTED');
  });

  test('boundary: density exactly 60 is MODERATE not CLEAR', () => {
    expect(getStatusFromDensity(60, false)).toBe('MODERATE');
  });

  test('boundary: density exactly 80 is CONGESTED not MODERATE', () => {
    expect(getStatusFromDensity(80, false)).toBe('CONGESTED');
  });
});

describe('INITIAL_ZONES', () => {
  test('contains exactly 8 zones', () => {
    expect(INITIAL_ZONES).toHaveLength(8);
  });

  test('each zone has required fields', () => {
    INITIAL_ZONES.forEach(zone => {
      expect(zone).toHaveProperty('id');
      expect(zone).toHaveProperty('name');
      expect(zone).toHaveProperty('density');
      expect(zone).toHaveProperty('status');
      expect(zone).toHaveProperty('hazard');
      expect(zone).toHaveProperty('wait_time');
    });
  });

  test('all densities are between 0 and 100', () => {
    INITIAL_ZONES.forEach(zone => {
      expect(zone.density).toBeGreaterThanOrEqual(0);
      expect(zone.density).toBeLessThanOrEqual(100);
    });
  });

  test('all wait_time values are non-negative', () => {
    INITIAL_ZONES.forEach(zone => {
      expect(zone.wait_time).toBeGreaterThanOrEqual(0);
    });
  });

  test('zone IDs are unique', () => {
    const ids = INITIAL_ZONES.map(z => z.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('includes required zone categories', () => {
    const ids = INITIAL_ZONES.map(z => z.id);
    expect(ids.some(id => id.startsWith('Zone_'))).toBe(true);
    expect(ids.some(id => id.startsWith('Exit_'))).toBe(true);
    expect(ids.some(id => id.startsWith('Concourse_'))).toBe(true);
  });
});

describe('simulateTelemetry', () => {
  test('returns same number of zones as input', () => {
    const result = simulateTelemetry(INITIAL_ZONES, {});
    expect(result).toHaveLength(INITIAL_ZONES.length);
  });

  test('density stays within 0-100 range after simulation', () => {
    for (let i = 0; i < 20; i++) {
      const result = simulateTelemetry(INITIAL_ZONES, {});
      result.forEach(zone => {
        expect(zone.density).toBeGreaterThanOrEqual(0);
        expect(zone.density).toBeLessThanOrEqual(100);
      });
    }
  });

  test('manual overrides are applied exactly', () => {
    const overrides = { Zone_Beta: { density: 99, hazard: true } };
    const result = simulateTelemetry(INITIAL_ZONES, overrides);
    const beta = result.find(z => z.id === 'Zone_Beta');
    expect(beta?.density).toBe(99);
    expect(beta?.hazard).toBe(true);
    expect(beta?.status).toBe('CRITICAL');
  });

  test('non-overridden zones are still returned', () => {
    const overrides = { Zone_Beta: { density: 99 } };
    const result = simulateTelemetry(INITIAL_ZONES, overrides);
    const alpha = result.find(z => z.id === 'Zone_Alpha');
    expect(alpha).toBeDefined();
  });

  test('status is recalculated correctly for overridden zone', () => {
    const overrides = { Exit_South: { density: 90, hazard: false } };
    const result = simulateTelemetry(INITIAL_ZONES, overrides);
    const exitSouth = result.find(z => z.id === 'Exit_South');
    expect(exitSouth?.status).toBe('CONGESTED');
  });

  test('hazard override sets status to CRITICAL', () => {
    const overrides = { Concourse_A: { hazard: true, density: 20 } };
    const result = simulateTelemetry(INITIAL_ZONES, overrides);
    const concourse = result.find(z => z.id === 'Concourse_A');
    expect(concourse?.status).toBe('CRITICAL');
  });
});
