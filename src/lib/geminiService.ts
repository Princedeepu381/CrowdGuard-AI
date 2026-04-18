import { GoogleGenerativeAI } from '@google/generative-ai';
import { ZoneTelemetry } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ─── Smart Local Analysis Engine ─────────────────────────────────────────────
// Generates realistic, context-aware tactical insights from live telemetry data.
// Activates when live API is unavailable.
function generateLocalAnalysis(telemetry: ZoneTelemetry[]): string {
  const sorted = [...telemetry].sort((a, b) => b.density - a.density);
  const critical = sorted.filter(z => z.hazard || z.density >= 80);
  const warning = sorted.filter(z => !z.hazard && z.density >= 60 && z.density < 80);
  const safe = sorted.filter(z => !z.hazard && z.density < 60);
  const avgDensity = Math.round(telemetry.reduce((a, z) => a + z.density, 0) / telemetry.length);
  const hottest = sorted[0];
  const coolest = sorted[sorted.length - 1];

  // Scenario: All clear
  if (critical.length === 0 && warning.length === 0) {
    return `All ${telemetry.length} venue zones are operating within nominal parameters (avg ${avgDensity}% capacity). ` +
      `${hottest.name} is the highest-load sector at ${hottest.density}% — recommend maintaining current crowd distribution. ` +
      `No evacuation protocols required; venue is operating at optimal safety.`;
  }

  // Scenario: Active hazard
  if (critical.some(z => z.hazard)) {
    const hazardZones = critical.filter(z => z.hazard);
    const evacuationTarget = safe[0] ?? coolest;
    return `⚠️ CRITICAL ALERT: ${hazardZones.map(z => z.name).join(' and ')} ${hazardZones.length === 1 ? 'has' : 'have'} an active hazard condition. ` +
      `Dispatch response units immediately and initiate controlled crowd migration toward ${evacuationTarget.name} (${evacuationTarget.density}% capacity — optimal safe exit). ` +
      `Do NOT use ${hottest.name} (${hottest.density}%) as an evacuation corridor — density too high.`;
  }

  // Scenario: High density, no hazard
  if (critical.length > 0) {
    const evacuationTarget = safe[0] ?? warning[warning.length - 1] ?? coolest;
    return `Elevated density detected in ${critical.map(z => `${z.name} (${z.density}%)`).join(', ')}. ` +
      `Recommend activating crowd flow diversion toward ${evacuationTarget.name} (${evacuationTarget.density}% — clear corridor). ` +
      `${warning.length > 0 ? `Monitor ${warning[0].name} closely — approaching threshold at ${warning[0].density}%.` : `All other sectors are within safe range.`}`;
  }

  // Scenario: Warning zones
  if (warning.length > 0) {
    return `Venue load is elevated but stable — average ${avgDensity}% across all sectors. ` +
      `${warning.map(z => z.name).join(' and ')} ${warning.length === 1 ? 'is' : 'are'} approaching capacity thresholds (60–80% range). ` +
      `Pre-position crowd management personnel and prepare contingency routing via ${coolest.name} (${coolest.density}%).`;
  }

  return `Venue telemetry nominal. Average sector density: ${avgDensity}%. ` +
    `${hottest.name} leads at ${hottest.density}%. Recommend continued passive monitoring with no immediate intervention required.`;
}

// ─── Main Analysis Function ───────────────────────────────────────────────────
export const analyzeTelemetryWithGemini = async (telemetry: ZoneTelemetry[]): Promise<string> => {
  // Try real Gemini API first
  if (API_KEY && API_KEY !== 'your-api-key-here') {
    const modelsToTry = ['gemini-pro', 'gemini-1.5-flash'];
    for (const modelName of modelsToTry) {
      try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });

        const telemetryContext = telemetry
          .map(z => `${z.name}: ${z.density}% density${z.hazard ? ' [HAZARD ACTIVE]' : ''}`)
          .join(', ');

        const prompt = `You are CrowdGuard-AI, the AI safety core for a large sports venue with ${telemetry.length} monitored sectors.
Current telemetry snapshot: ${telemetryContext}.
Provide a 2-sentence tactical report for command center operators.
Identify the highest-priority sector and recommend one specific action. Be direct and professional. No markdown.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text && text.length > 20) return text;
      } catch {
        // Try next model
      }
    }
  }

  // Intelligent local fallback — always produces meaningful, data-driven output
  return generateLocalAnalysis(telemetry);
};
