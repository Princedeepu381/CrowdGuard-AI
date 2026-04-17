export type ZoneStatus = 'CLEAR' | 'MODERATE' | 'CONGESTED' | 'CRITICAL';

export interface ZoneTelemetry {
  id: string; 
  name: string;
  density: number; // 0-100
  status: ZoneStatus;
  hazard: boolean;
  wait_time: number; // in seconds
}

export interface RouteResponse {
  threat_analysis: string;
  action_directive: string;
  safe_route: string[];
  time_saved_minutes: number;
  total_wait_time: number;
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}
