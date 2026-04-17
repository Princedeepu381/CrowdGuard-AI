import { ZoneTelemetry, RouteResponse } from '../types';

export const getSafeRoute = (userZone: string, destination: string, telemetry: ZoneTelemetry[]): RouteResponse => {
  const getZone = (id: string) => telemetry.find(z => z.id === id);
  const startZone = getZone(userZone);
  const endZone = getZone(destination);

  if (!startZone || !endZone) {
    return {
      threat_analysis: "Invalid start or destination",
      action_directive: "Select a valid origin and destination.",
      safe_route: [],
      time_saved_minutes: 0,
      total_wait_time: 0
    };
  }

  // 1. Check if destination is UNSAFE (density > 80 OR hazard = true)
  const isDestUnsafe = endZone.density > 80 || endZone.hazard;
  
  let targetNode = endZone;
  let actionDirective = "Proceed to destination.";
  let threatAnalysis = "Path evaluates to CLEAR. No immediate threats detected.";
  
  // 2. If unsafe -> find alternate exit
  if (isDestUnsafe) {
    threatAnalysis = `WARNING: ${endZone.name} is classified as UNSAFE (Density: ${endZone.density}%, Hazard: ${Boolean(endZone.hazard)}).`;
    actionDirective = "Rerouting to nearest safe exit.";
    
    // Sort exits by density ASC
    const exits = telemetry.filter(z => z.id.startsWith('Exit_'));
    const safeExits = exits.filter(z => z.density <= 80 && !z.hazard).sort((a, b) => a.density - b.density);
    
    if (safeExits.length > 0) {
      targetNode = safeExits[0]; // pick lowest density with hazard=false
      actionDirective = `REROUTE APPROVED: Proceed to ${targetNode.name}.`;
    } else {
      actionDirective = "CRITICAL: All exits compromised. Shelter in place immediately.";
      return {
        threat_analysis: threatAnalysis,
        action_directive: actionDirective,
        safe_route: [startZone.name, "SHELTER IN PLACE"],
        time_saved_minutes: 0,
        total_wait_time: startZone.wait_time
      }
    }
  }

  // 3. Find intermediate zones with density < 80
  const routeFields: string[] = [startZone.name];
  
  // Dummy logic to pick an intermediate Concourse if neither start nor end is one
  if (!startZone.id.includes('Concourse') && !targetNode.id.includes('Concourse')) {
    const intermediates = telemetry.filter(z => z.id.startsWith('Concourse_'));
    const safeIntermediates = intermediates.filter(z => z.density <= 80 && !z.hazard);
    
    if (safeIntermediates.length > 0) {
      routeFields.push(safeIntermediates[0].name); 
    }
  }
  
  // 4. Build step-by-step route array
  if (startZone.id !== targetNode.id) {
    routeFields.push(targetNode.name);
  }

  // 5. Calculate time_saved_minutes = (unsafe_wait_time - safe_wait_time) / 60 rounded
  let timeSaved = 0;
  if (isDestUnsafe) {
    timeSaved = Math.round((endZone.wait_time - targetNode.wait_time) / 60);
    // As per requirement!
  } else {
    // If original wasn't unsafe, time saved is 0
    timeSaved = 0;
  }

  // 6. Return full JSON response
  return {
    threat_analysis: threatAnalysis,
    action_directive: actionDirective,
    safe_route: routeFields,
    time_saved_minutes: Math.max(0, timeSaved),
    total_wait_time: targetNode.wait_time
  };
};
