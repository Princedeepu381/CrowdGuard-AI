import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const API_KEY = "INSERT_YOUR_GEMINI_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let currentIoTData = {};
const sensorDisplay = document.getElementById('sensor-data');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// IoT Simulation Stream
function startIoTStream() {
    setInterval(() => {
        currentIoTData = {
            "Gate_A_Sensor": { density: Math.floor(Math.random() * 80), status: "active" },
            "Section_112_Sensor": { density: Math.floor(Math.random() * 150), status: "warning" },
            "VIP_Lounge_Auth": { density: Math.floor(Math.random() * 20), status: "secure" },
            "timestamp": new Date().toLocaleTimeString()
        };

        sensorDisplay.innerHTML = `
            <div>Gate A: ${currentIoTData.Gate_A_Sensor.density} pax/m2</div>
            <div class="${currentIoTData.Section_112_Sensor.density > 120 ? 'alert' : ''}">
                Sec 112: ${currentIoTData.Section_112_Sensor.density} pax/m2
            </div>
            <div>VIP: ${currentIoTData.VIP_Lounge_Auth.density} pax/m2</div>
            <div style="margin-top:10px; font-size: 0.8em; color: #8b949e;">Last Sync: ${currentIoTData.timestamp}</div>
        `;
    }, 3000);
}

// AI Processing
async function processQuery(query) {
    const systemPrompt = `
      You are CrowdGuard AI, a security and routing assistant for a stadium.
      Current Live IoT Sensor Data: ${JSON.stringify(currentIoTData)}
      User Location: Gate_A
      User Clearance: General Admission

      Rules:
      1. If any sensor density is over 120, label it a "High-Risk Crush Zone" and forcefully route the user away.
      2. General Admission cannot enter VIP zones.
      3. Respond in a concise, authoritative, and secure tone.

      User Query: "${query}"
    `;

    try {
        const result = await model.generateContent(systemPrompt);
        return result.response.text();
    } catch (error) {
        console.error("AI processing failed:", error);
        return "Connection secured. However, AI telemetry is currently offline.";
    }
}

// Event Listeners
sendBtn.addEventListener('click', async () => {
    const query = userInput.value;
    if (!query) return;

    chatBox.innerHTML += `<div class="msg-user">>> User: ${query}</div>`;
    userInput.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    chatBox.innerHTML += `<div class="msg-ai" id="loading">>> CrowdGuard AI: Processing telemetry...</div>`;

    const response = await processQuery(query);

    document.getElementById('loading').remove();
    chatBox.innerHTML += `<div class="msg-ai">>> CrowdGuard AI:<br>${response.replace(/\n/g, '<br>')}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Init
startIoTStream();