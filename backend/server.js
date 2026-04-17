require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'gemini-1.5-flash' });
});

// ── AI Route Analysis ─────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const { origin, destination, telemetry, safeRoute } = req.body;

  if (!origin || !destination || !telemetry) {
    return res.status(400).json({ error: 'Missing required fields: origin, destination, telemetry' });
  }

  // Build zone status summary for Gemini
  const zoneSummary = telemetry.map(z =>
    `• ${z.name}: density=${z.density}%, status=${z.status}, hazard=${z.hazard}, wait=${z.wait_time}s`
  ).join('\n');

  const originZone = telemetry.find(z => z.id === origin);
  const destZone = telemetry.find(z => z.id === destination);

  const prompt = `You are CrowdGuard-AI, an expert AI safety analyst for large-scale sporting venues.

A person needs to travel from "${originZone?.name || origin}" to "${destZone?.name || destination}" inside a stadium.

## Current Real-Time Venue Status:
${zoneSummary}

## Proposed Safe Route:
${safeRoute?.join(' → ') || 'Direct route'}

## Your Task:
Analyze the crowd situation and provide a JSON response with EXACTLY these fields:
- "threat_analysis": A concise 1-2 sentence professional crowd safety assessment of the current situation, mentioning key risk zones.
- "action_directive": A clear, actionable 1-sentence instruction for the person (what they should do right now).
- "safety_tips": An array of exactly 3 short bullet-point safety tips relevant to the current conditions.
- "risk_level": one of "LOW", "MEDIUM", "HIGH", or "CRITICAL"

IMPORTANT: Respond with ONLY valid JSON, no markdown, no code blocks, no extra text.`;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Strip markdown code fences if Gemini adds them
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback if Gemini didn't return valid JSON
      parsed = {
        threat_analysis: cleaned.slice(0, 200),
        action_directive: 'Follow the suggested safe route and stay alert.',
        safety_tips: ['Stay close to venue staff', 'Avoid congested areas', 'Follow exit signs'],
        risk_level: destZone?.hazard || destZone?.density > 80 ? 'CRITICAL' : 'MEDIUM'
      };
    }

    res.json({ success: true, analysis: parsed });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Gemini API call failed',
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🛡️  CrowdGuard-AI Backend running on http://localhost:${PORT}`);
  console.log(`🤖  Gemini model: gemini-1.5-flash`);
  console.log(`🔑  API Key: ${process.env.GEMINI_API_KEY ? '✅ Loaded' : '❌ MISSING — add to .env'}\n`);
});
