import { ZoneTelemetry, ZoneStatus } from '../types';

export const INITIAL_ZONES: ZoneTelemetry[] = [
  { id: 'Zone_Alpha', name: 'Zone Alpha', density: 85, status: 'CONGESTED', hazard: false, wait_time: 40 },
  { id: 'Zone_Beta', name: 'Zone Beta', density: 20, status: 'CLEAR', hazard: false, wait_time: 2 },
  { id: 'Zone_Gamma', name: 'Zone Gamma', density: 55, status: 'MODERATE', hazard: false, wait_time: 15 },
  { id: 'Zone_Delta', name: 'Zone Delta', density: 72, status: 'MODERATE', hazard: false, wait_time: 25 },
  { id: 'Exit_North', name: 'Exit North', density: 95, status: 'CRITICAL', hazard: true, wait_time: 60 },
  { id: 'Exit_South', name: 'Exit South', density: 15, status: 'CLEAR', hazard: false, wait_time: 1 },
  { id: 'Exit_East', name: 'Exit East', density: 45, status: 'CLEAR', hazard: false, wait_time: 10 },
  { id: 'Concourse_A', name: 'Concourse A', density: 63, status: 'MODERATE', hazard: false, wait_time: 20 },
];

export const getStatusFromDensity = (density: number, hazard: boolean): ZoneStatus => {
  if (hazard) return 'CRITICAL';
  if (density < 60) return 'CLEAR';
  if (density < 80) return 'MODERATE';
  return 'CONGESTED'; // Note: User specified >80% as UNSAFE. We map to CONGESTED but logic filters it out.
};

export const simulateTelemetry = (currentData: ZoneTelemetry[], manualOverrides: Record<string, Partial<ZoneTelemetry>>): ZoneTelemetry[] => {
  return currentData.map(zone => {
    // If overridden manually, skip random fluctuation
    if (manualOverrides[zone.id]) {
      return { ...zone, ...manualOverrides[zone.id], status: getStatusFromDensity(manualOverrides[zone.id]?.density ?? zone.density, manualOverrides[zone.id]?.hazard ?? zone.hazard) };
    }

    let fluctuation = Math.floor(Math.random() * 11) - 5; // -5 to +5
    let newDensity = Math.max(0, Math.min(100, zone.density + fluctuation));
    
    // Adjust wait time
    let newWaitTime = Math.max(0, Math.round(newDensity * 0.6));
    
    // Hazards are sticky unless manually turned off, but could spontaneously appear (very rare)
    // We will keep hazards manual for demo predictability, unless it's randomly cleared (1% chance)
    let isHazard = zone.hazard;

    return {
      ...zone,
      density: newDensity,
      wait_time: newWaitTime,
      status: getStatusFromDensity(newDensity, isHazard)
    };
  });
};
