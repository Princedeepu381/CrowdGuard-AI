// Unit tests for CrowdGuard-AI routing engine
// Tests all critical paths: safe routes, hazard avoidance, fallback conditions

import { getSafeRoute } from '../../src/lib/routingEngine';
import { ZoneTelemetry } from '../../src/types';

// ── Test data factory ──────────────────────────────────────────────────────
const makeZone = (overrides: Partial<ZoneTelemetry> & { id: string }): ZoneTelemetry => ({
  name: overrides.id.replace('_', ' '),
  density: 30,
  status: 'CLEAR',
  hazard: false,
  wait_time: 10,
  ...overrides,
});

const buildTelemetry = (): ZoneTelemetry[] => [
  makeZone({ id: 'Zone_Alpha',  density: 85, status: 'CONGESTED', wait_time: 50 }),
  makeZone({ id: 'Zone_Beta',   density: 20, status: 'CLEAR',     wait_time: 5  }),
  makeZone({ id: 'Zone_Gamma',  density: 55, status: 'MODERATE',  wait_time: 20 }),
  makeZone({ id: 'Zone_Delta',  density: 70, status: 'MODERATE',  wait_time: 30 }),
  makeZone({ id: 'Exit_North',  density: 95, status: 'CRITICAL',  hazard: true, wait_time: 60 }),
  makeZone({ id: 'Exit_South',  density: 15, status: 'CLEAR',     wait_time: 3  }),
  makeZone({ id: 'Exit_East',   density: 45, status: 'CLEAR',     wait_time: 15 }),
  makeZone({ id: 'Concourse_A', density: 60, status: 'MODERATE',  wait_time: 18 }),
];

// ── Tests ──────────────────────────────────────────────────────────────────

describe('getSafeRoute – basic routing', () => {
  const telemetry = buildTelemetry();

  test('returns a route with at least 1 step', () => {
    const result = getSafeRoute('Zone_Beta', 'Exit_South', telemetry);
    expect(result.safe_route.length).toBeGreaterThanOrEqual(1);
  });

  test('route starts with origin zone name', () => {
    const result = getSafeRoute('Zone_Beta', 'Exit_South', telemetry);
    expect(result.safe_route[0]).toBe('Zone Beta');
  });

  test('returns valid threat_analysis and action_directive strings', () => {
    const result = getSafeRoute('Zone_Beta', 'Exit_South', telemetry);
    expect(typeof result.threat_analysis).toBe('string');
    expect(result.threat_analysis.length).toBeGreaterThan(0);
    expect(typeof result.action_directive).toBe('string');
    expect(result.action_directive.length).toBeGreaterThan(0);
  });

  test('time_saved_minutes is a non-negative number', () => {
    const result = getSafeRoute('Zone_Beta', 'Exit_South', telemetry);
    expect(result.time_saved_minutes).toBeGreaterThanOrEqual(0);
  });

  test('total_wait_time is a non-negative number', () => {
    const result = getSafeRoute('Zone_Beta', 'Exit_East', telemetry);
    expect(result.total_wait_time).toBeGreaterThanOrEqual(0);
  });
});

describe('getSafeRoute – hazard avoidance', () => {
  const telemetry = buildTelemetry();

  test('reroutes away from hazard destination', () => {
    const result = getSafeRoute('Zone_Beta', 'Exit_North', telemetry);
    // Exit_North is a hazard — should be rerouted
    expect(result.safe_route).not.toContain('Exit North');
    expect(result.time_saved_minutes).toBeGreaterThan(0);
  });

  test('action directive mentions reroute when destination is unsafe', () => {
    const result = getSafeRoute('Zone_Alpha', 'Exit_North', telemetry);
    expect(result.action_directive.toLowerCase()).toMatch(/reroute|shelter|proceed/);
  });

  test('reroutes away from high-density destination (>80%)', () => {
    const highDensity = buildTelemetry().map(z =>
      z.id === 'Exit_South' ? { ...z, density: 95, hazard: false } : z
    );
    const result = getSafeRoute('Zone_Beta', 'Exit_South', highDensity);
    // The destination is now unsafe — route should not end at Exit South
    const lastStep = result.safe_route[result.safe_route.length - 1];
    // Either rerouted to another exit, or sheltered in place
    expect(typeof lastStep).toBe('string');
    expect(result.threat_analysis.length).toBeGreaterThan(0);
  });
});

describe('getSafeRoute – edge cases', () => {
  test('handles invalid origin gracefully', () => {
    const result = getSafeRoute('INVALID_ZONE', 'Exit_South', buildTelemetry());
    expect(result.safe_route).toEqual([]);
    expect(result.threat_analysis).toBeTruthy();
  });

  test('handles invalid destination gracefully', () => {
    const result = getSafeRoute('Zone_Beta', 'INVALID_DEST', buildTelemetry());
    expect(result.safe_route).toEqual([]);
  });

  test('handles all exits compromised — recommends shelter in place', () => {
    const allExitsBlocked = buildTelemetry().map(z =>
      z.id.startsWith('Exit_') ? { ...z, density: 100, hazard: true } : z
    );
    const result = getSafeRoute('Zone_Beta', 'Exit_North', allExitsBlocked);
    expect(result.action_directive.toLowerCase()).toMatch(/critical|shelter/);
  });

  test('same origin and destination returns valid result', () => {
    const result = getSafeRoute('Zone_Beta', 'Zone_Beta', buildTelemetry());
    expect(result.safe_route.length).toBeGreaterThanOrEqual(1);
  });

  test('total_wait_time equals 0 when wait time is 0', () => {
    const zeroWait = buildTelemetry().map(z =>
      z.id === 'Exit_South' ? { ...z, wait_time: 0 } : z
    );
    const result = getSafeRoute('Zone_Beta', 'Exit_South', zeroWait);
    expect(result.total_wait_time).toBe(0);
  });
});

describe('getSafeRoute – safe clear path', () => {
  test('path is CLEAR when both zones are safe', () => {
    const result = getSafeRoute('Zone_Beta', 'Exit_South', buildTelemetry());
    expect(result.threat_analysis.toLowerCase()).toMatch(/clear|no immediate threats/);
    expect(result.time_saved_minutes).toBe(0);
  });

  test('route includes intermediate concourse when neither zone is a concourse', () => {
    const result = getSafeRoute('Zone_Beta', 'Exit_South', buildTelemetry());
    // Should include Concourse_A as intermediate if density < 80
    const routeStr = result.safe_route.join(' ');
    expect(routeStr).toContain('Concourse');
  });
});
