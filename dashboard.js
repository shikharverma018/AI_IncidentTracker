/* ═══════════════════════════════════════════════════════════════════════════
   AI Incident Response Coordinator — Dashboard Simulation Engine v4 (Cleaned)
   
   - High-reliability Scenario Selection
   - Mistake & Learning logic (v4)
   - Synchronized State (currentStep)
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Simulation Constants ──────────────────────────────────────────────────
const SLA_THRESHOLD_MINS = 15;
const STEP_PENALTY = 0.05;
const DIAGNOSTIC_COST = 0.02;
const WRONG_FIX_PENALTY = 0.30;

// ─── Operational Squad Data ──────────────────────────────────────────────
const SQUAD_DATA = [
    { name: "Aalekh Maheshwari", role: "AI Systems Engineer", type: "ai", avatar: "assets/squad/aalekh.png" },
    { name: "Shikhar Verma", role: "Full Stack Developer", type: "dev", avatar: "assets/squad/shikhar.png" },
    { name: "Vishwajit Jayswal", role: "Cybersecurity Analyst", type: "sec", avatar: "assets/squad/vishwajit.png" }
];

let isProcessing = false;
let failsafeTimer = null;

function disableUI() {
    const btnStart = document.getElementById('btn-start');
    const scenarioSelect = document.getElementById('scenario-select');
    const btnReset = document.getElementById('btn-reset');
    if (btnStart) btnStart.disabled = true;
    if (scenarioSelect) scenarioSelect.disabled = true;
    if (btnReset) btnReset.disabled = false;
    console.log("UI Locked");
}

function enableUI() {
    const btnStart = document.getElementById('btn-start');
    const scenarioSelect = document.getElementById('scenario-select');
    const btnReset = document.getElementById('btn-reset');
    if (btnStart) btnStart.disabled = false;
    if (scenarioSelect) scenarioSelect.disabled = false;
    if (btnReset) btnReset.disabled = true;
    console.log("UI Unlocked");
}
window.disableUI = disableUI;
window.enableUI = enableUI;

function startFailsafe() {
    if (failsafeTimer) clearTimeout(failsafeTimer);
    failsafeTimer = setTimeout(() => {
        if (isProcessing) {
            console.warn("Failsafe triggered: Forced UI unlock.");
            isProcessing = false;
            enableUI();
        }
    }, 60000);
}

// ─── Deep Intelligence Engine ──────────────────────────────────────────────
class DecisionBrain {
    constructor(scenarioId) {
        this.scenarioId = scenarioId;
        this.scenario = SCENARIOS[scenarioId]; // Uses global SCENARIOS from index.html
        this.attemptsMade = 0;
        this.mistakesConsumed = 0;
        this.mistakesNeeded = this.scenario.mistakesNeeded || 2;
        this.learningPivoted = false;

        this.mistakeTypes = [
            { name: "Rollback payments-api", reason: "Standard guess." },
            { name: "Scale up pod limits", reason: "Masking load issues." },
            { name: "Restart ingress", reason: "Network reset guess." },
            { name: "Clear Redis cache", reason: "Cache cleanup guess." }
        ];

        this.lastActionWasMistake = false;
        this.currentlyAnalyzing = false;
    }

    decide(state) {
        if (this.lastActionWasMistake && !this.currentlyAnalyzing) {
            this.currentlyAnalyzing = true;
            return {
                type: 'analysis',
                label: '⚠️ SYSTEM ALERT',
                reasoning: '⚠️ Previous hypothesis failed. Analyzing telemetry...',
                updateText: '🧠 Analyzing mistake and re-evaluating signals...'
            };
        }

        if (this.currentlyAnalyzing) {
            this.currentlyAnalyzing = false;
            this.lastActionWasMistake = false;
            return {
                type: 'thinking',
                label: '🧠 BRAIN PIVOT',
                reasoning: '🔍 Identifying overlooked signals. Updating belief of root cause.',
                updateText: '🧠 Trying a DIFFERENT approach...'
            };
        }

        this.attemptsMade++;

        if (this.attemptsMade === 1) {
            return {
                type: 'send_update',
                label: '📢 NOTIFY',
                reasoning: '🗣️ alerting stakeholders immediately.',
                msg: `P1 INCIDENT [${this.scenario.id}]: ${this.scenario.name} identified. Investigating...`
            };
        }

        if (this.mistakesConsumed < this.mistakesNeeded) {
            const move = this.mistakeTypes[this.mistakesConsumed % this.mistakeTypes.length];
            this.mistakesConsumed++;
            this.lastActionWasMistake = true;
            return {
                type: 'mistake',
                label: `🔄 ATTEMPT #${this.attemptsMade - 1}: ${move.name}`,
                reasoning: `🔄 SPECULATIVE: ${move.reason}.`,
                action: move.name
            };
        }

        if (!this.learningPivoted) {
            this.learningPivoted = true;
            return {
                type: 'diagnostic',
                label: '🔍 PIVOT: RCA',
                reasoning: '🔍 AHA! Speculative actions failed. Pivoting to deep diagnostics.',
                query: 'check_deep_logs'
            };
        }

        const resType = (this.scenario.type === "DB" || this.scenario.type === "Infra") ? "scale" : "rollback";
        return {
            type: resType,
            label: '✅ TARGETED RESOLUTION',
            reasoning: `✅ SUCCESS: Applying corrective fix for ${this.scenario.type}.`,
            target: resType === "scale" ? "postgres-primary" : "payments-api",
            isCorrect: true
        };
    }
}

// ─── Simulation State & Loop ───────────────────────────────────────────────
let SimState = {
    running: false,
    currentStep: 0,
    scenarioId: 0,
    timeElapsed: 240,
    speed: 1500,
    brain: null,
    incidentResolved: false,
    accumulatedReward: 0.0,
    mistakesTriggered: 0,
    correctFixApplied: false,
    updatesSent: 0,
    errorRate: 0.43,
    latency: 4200,
    affectedUsers: 12400,
    logs: []
};

async function startSimulation() {
    if (SimState.running || isProcessing) return;
    try {
        isProcessing = true;
        disableUI();
        startFailsafe();
        // resetSimulation(); // Removed to preserve the "SCENARIO LOADED" visibility until first step
        
        SimState.running = true;
        const select = document.getElementById('scenario-select');
        SimState.scenarioId = select ? parseInt(select.value) : 0;
        
        const slider = document.getElementById('speed-slider');
        SimState.speed = slider ? parseInt(slider.value) : 1500;
        
        SimState.brain = new DecisionBrain(SimState.scenarioId);
        
        // Reset logs and metrics for a fresh run
        SimState.logs = [];
        SimState.currentStep = 0;
        SimState.incidentResolved = false;
        SimState.correctFixApplied = false;
        SimState.accumulatedReward = 0;
        SimState.timeElapsed = 240;
        SimState.latency = 4200;
        SimState.errorRate = 0.43;
        
        const actionFeed = document.getElementById('action-feed');
        if (actionFeed) actionFeed.innerHTML = '';
        
        pushLog(`SYSTEM: Simulation Started. Scenario: ${SCENARIOS[SimState.scenarioId].id}`, "INFO");
        pushLog(`AGENT: AI Engine online. Initiating diagnostic scan...`, "ACTION");

        while (SimState.running) {
            const action = SimState.brain.decide(SimState);
            if (!action) break;

            await new Promise(r => setTimeout(r, SimState.speed * 0.5));
            if (!SimState.running) break;

            executeStep(action, SimState.currentStep + 1);

            if (action.type === 'mistake') {
                await showThinkingSequence();
            }

            if (SimState.incidentResolved && action.type !== 'send_update') {
                const closure = SimState.brain.decide(SimState);
                await new Promise(r => setTimeout(r, SimState.speed));
                executeStep(closure, SimState.currentStep + 1);
                break;
            }

            if (SimState.currentStep >= 15) break;
        }

        if (SimState.running) finalizeEpisode();
    } catch (e) {
        console.error("SIM_ERROR:", e);
    } finally {
        isProcessing = false;
        enableUI();
        if (failsafeTimer) clearTimeout(failsafeTimer);
    }
}
window.startSimulation = startSimulation;

function resetSimulation() {
    SimState.running = false;
    SimState.currentStep = 0;
    SimState.incidentResolved = false;
    SimState.correctFixApplied = false;
    SimState.updatesSent = 0;
    SimState.mistakesTriggered = 0;
    SimState.accumulatedReward = 0;
    SimState.timeElapsed = 240;

    SimState.latency = 4200;
    SimState.errorRate = 0.43;
    SimState.affectedUsers = 12400;
    SimState.logs = [];

    document.getElementById('action-feed').innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center opacity-30 gap-4">
            <span class="material-symbols-outlined text-6xl">robot</span>
            <p class="text-xs uppercase tracking-widest font-headline">Agent Standby — Awaiting Commands</p>
        </div>
    `;

    const logContainer = document.getElementById('log-container');
    if (logContainer) logContainer.innerHTML = '';
    const logTimestamp = document.getElementById('log-timestamp');
    if (logTimestamp) logTimestamp.textContent = 'Initializing...';

    const victory = document.getElementById('victory-overlay');
    if (victory) victory.classList.add('hidden');
    
    // Reset Status Badge
    const statusText = document.getElementById('incident-status-text');
    if (statusText) statusText.textContent = 'P1 ACTIVE';

    updateMetrics();
    updateSLADisplay();
    console.log("Simulation Reset Complete.");
}
window.resetSimulation = resetSimulation;

// ─── Scenario Selection logic ────────────────────────────────────────────────
function selectScenario(index) {
    console.log("SELECTING SCENARIO:", index);
    const select = document.getElementById('scenario-select');
    const label = document.getElementById('current-scenario-label');
    
    if (select) select.value = index;
    if (label) label.textContent = SCENARIOS[index].id;
    
    SimState.scenarioId = index;
    
    // Immediate Visual Update
    const actionFeed = document.getElementById('action-feed');
    if (actionFeed) {
        actionFeed.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center opacity-80 gap-4 animate-fade-in">
                <span class="material-symbols-outlined text-6xl text-primary">memory</span>
                <p class="text-sm uppercase tracking-widest font-headline text-primary">SCENARIO LOADED: ${SCENARIOS[index].id}</p>
                <p class="text-xs text-on-surface-variant font-mono border border-primary/20 bg-primary/5 px-4 py-2 rounded-lg">${SCENARIOS[index].name}</p>
                <p class="text-[10px] text-on-surface-variant mt-2 text-primary opacity-60">Ready to initiate simulation.</p>
            </div>
        `;
    }

    const runLabel = document.getElementById('current-protocol-run');
    if (runLabel) runLabel.textContent = `| SCENARIO_${SCENARIOS[index].id}`;

    // Close Modal and return to War Room
    if (typeof window.closeScenarioPicker === 'function') window.closeScenarioPicker();
    navigateTo('war-room');
    
    if (typeof showMistakeFlash === 'function') showMistakeFlash(`Scenario S${index + 1} Ready`);
}
window.selectScenario = selectScenario;

// ─── Execution Logic ───────────────────────────────────────────────────────
function executeStep(action, stepIdx) {
    SimState.currentStep = stepIdx;
    SimState.timeElapsed += 60;
    let stepDelta = -STEP_PENALTY;
    let resultText = "";
    let cssCls = "action-info";

    switch (action.type) {
        case 'analysis': cssCls = "action-analysis"; resultText = action.updateText; stepDelta = 0; break;
        case 'thinking': cssCls = "action-thinking"; resultText = action.updateText; stepDelta = 0; break;
        case 'send_update': cssCls = "action-communicate"; resultText = `📢 NOTIFIED: "${action.msg}"`; stepDelta += 0.05; break;
        case 'mistake':
            SimState.mistakesTriggered++;
            cssCls = "action-rollback";
            stepDelta -= WRONG_FIX_PENALTY;
            resultText = `⚠️ INEFFECTIVE: ${action.action} failed to resolve root cause.`;
            showMistakeFlash(`⚠️ suboptimal Action.`);
            break;
        case 'diagnostic': cssCls = "action-diagnostic"; resultText = "🔍 Evidence of resource contention found."; stepDelta -= DIAGNOSTIC_COST; break;
        case 'scale':
        case 'rollback':
            cssCls = action.type === 'scale' ? "action-scale" : "action-rollback";
            if (action.isCorrect) {
                 SimState.correctFixApplied = true;
                 resultText = "✅ CORRECTIVE FIX: metrics stabilizing.";
            } else {
                 resultText = "⚠️ NEUTRAL ACTION.";
            }
            break;
    }

    if (SimState.correctFixApplied && !SimState.incidentResolved) {
        SimState.incidentResolved = true;
        animateRecovery();
    }

    SimState.accumulatedReward += stepDelta;
    
    const counter = document.getElementById('step-counter');
    if (counter) counter.textContent = `Step ${SimState.currentStep}/15`;

    addFeedItem({ label: action.label, cssClass: cssCls, reasoning: action.reasoning, result: resultText }, SimState.currentStep);
    updateMetrics(action.type);
    updateRewardTracker();
    updateSLADisplay();
}

// ─── Component Renderers ───────────────────────────────────────────────────
function renderSquad() {
    const container = document.getElementById('team-grid');
    if (!container) return;
    container.innerHTML = SQUAD_DATA.map(m => `
        <div class="flex items-center gap-3 squad-item cursor-pointer">
            <img src="${m.avatar}" class="w-8 h-8 rounded bg-surface-variant object-cover"/>
            <div>
                <p class="text-[11px] font-bold text-on-surface uppercase">${m.name}</p>
                <p class="text-[9px] font-bold uppercase tracking-tighter role-type-${m.type}">${m.role}</p>
            </div>
        </div>
    `).join('');
}

function renderSystemMap() {
    const scenario = SCENARIOS[SimState.scenarioId];
    const nodeApi = document.getElementById('node-api');
    const nodeCore = document.getElementById('node-core');
    const nodeDb = document.getElementById('node-db');
    [nodeApi, nodeCore, nodeDb].forEach(n => {
        if (!n) return;
        const e = n.querySelector('.map-node');
        e.classList.remove('border-error', 'shadow-[0_0_20px_#ff716c55]');
        e.classList.add('border-primary');
    });
    let t = (scenario.type === 'DB') ? nodeDb : (scenario.type === 'CORE' ? nodeCore : nodeApi);
    if (t) {
        const e = t.querySelector('.map-node');
        e.classList.remove('border-primary');
        e.classList.add('border-error', 'shadow-[0_0_20px_#ff716c55]');
    }
}

// ─── UI Utilities ──────────────────────────────────────────────────────────
async function showThinkingSequence() {
    const indicator = document.getElementById('thinking-indicator');
    const textEl = document.querySelector('.thinking-text');
    if (!indicator || !textEl) return;
    indicator.classList.remove('hidden');
    indicator.classList.add('block');
    for (let i = 0; i < 4; i++) {
        if (!SimState.running) break;
        textEl.textContent = ["Analyzing Telemetry...", "Correlating Patterns...", "Evaluating Failure Modes..."][Math.floor(Math.random() * 3)];
        await new Promise(r => setTimeout(r, 600));
    }
    indicator.classList.add('hidden');
    indicator.classList.remove('block');
}

function updateMetrics() {
    if (SimState.incidentResolved) {
        SimState.errorRate *= 0.4;
        SimState.latency *= 0.3;
    } else {
        SimState.errorRate = Math.min(0.9, SimState.errorRate + 0.01);
    }
    updateMetricCard('metric-error-rate', `${(SimState.errorRate * 100).toFixed(1)}%`, SimState.errorRate * 100);
    updateMetricCard('metric-latency', `${Math.round(SimState.latency)}ms`, (SimState.latency / 5000) * 100);
}

function updateMetricCard(id, val, perc) {
    const card = document.getElementById(id);
    if (!card) return;
    const vEl = document.getElementById(id.replace('metric-', '') + '-value');
    if (vEl) vEl.textContent = val;
    const bEl = document.getElementById(id.replace('metric-', '') + '-bar');
    if (bEl) bEl.style.width = `${Math.min(100, perc)}%`;
}

function updateSLADisplay() {
    const rem = Math.max(0, 15 - (SimState.timeElapsed / 60));
    const m = Math.floor(rem), s = Math.floor((rem - m) * 60);
    document.getElementById('sla-time').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateRewardTracker() {
    const el = document.getElementById('reward-value');
    if (el) el.textContent = SimState.accumulatedReward.toFixed(2);
}

function addFeedItem(action, step) {
    const feed = document.getElementById('action-feed');
    
    // Clear the centered "Ready" or "Loaded" message on the very first step
    if (step === 1) {
        feed.innerHTML = '';
        pushLog("SYSTEM: Episode initiated. Agent logic online.", "INFO");
    }

    const div = document.createElement('div');
    div.className = 'feed-item';
    div.innerHTML = `
        <div class="feed-content">
            <div class="feed-header"><span class="feed-step">STEP ${step}</span> <span class="feed-label uppercase">${action.label}</span></div>
            <div class="feed-reasoning text-[10px] opacity-70">${action.reasoning}</div>
            <div class="feed-result text-primary font-bold mt-1">${action.result}</div>
        </div>
    `;
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;

    // Also push to Incident Logs
    const logType = action.type === 'mistake' ? 'ERROR' : (action.isCorrect ? 'SUCCESS' : 'ACTION');
    pushLog(`${action.label}: ${action.reasoning}`, logType);
    if (action.result) pushLog(`RESULT: ${action.result}`, logType);
}

function pushLog(msg, type = "INFO") {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + "." + String(Date.now() % 1000).padStart(3, '0');
    const logEntry = { timestamp, msg, type };
    SimState.logs.push(logEntry);

    const container = document.getElementById('log-container');
    const tsEl = document.getElementById('log-timestamp');
    
    if (tsEl) tsEl.textContent = `LAST UPDATE: ${timestamp}`;

    // If we're on the logs page, render it immediately
    if (container && !container.closest('.view-module').classList.contains('hidden')) {
        const div = createLogElement(logEntry);
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
}
window.pushLog = pushLog;

function createLogElement(log) {
    const div = document.createElement('div');
    const typeLower = log.type.toLowerCase();
    div.className = `log-entry log-type-${typeLower}`;
    
    let icon = "info";
    if (log.type === "ACTION") icon = "bolt";
    if (log.type === "ERROR") icon = "warning";
    if (log.type === "SUCCESS") icon = "check_circle";
    if (log.type === "SYSTEM") icon = "settings_input_component";
    if (log.type === "SECURITY") icon = "encrypted";

    div.innerHTML = `
        <span class="text-[9px] opacity-40 shrink-0 font-mono mt-1">${log.timestamp}</span>
        <span class="material-symbols-outlined log-icon mt-0.5">${icon}</span>
        <div class="flex flex-col gap-0.5 flex-grow">
            <span class="log-tag log-tag-${typeLower}">${log.type}</span>
            <span class="text-[10px] text-on-surface leading-tight">${log.msg}</span>
        </div>
    `;
    return div;
}

function clearLogs() {
    SimState.logs = [];
    const container = document.getElementById('log-container');
    if (container) {
        container.innerHTML = `<div class="flex items-center justify-center h-full opacity-20 text-[10px] uppercase tracking-[0.2em]">Stream Cleared — Waiting for traffic...</div>`;
    }
    pushLog("SYSTEM: User initiated manual log purge.", "SYSTEM");
}
window.clearLogs = clearLogs;

function preInitLogs() {
    const bootSequence = [
        { msg: "KERNEL_INIT: Initializing tactical response core...", type: "SYSTEM" },
        { msg: "NEURAL_LINK: Establishing encrypted bridge to agent node...", type: "SECURITY" },
        { msg: "TELEMETRY: Subscribing to high-frequency metric streams...", type: "SYSTEM" },
        { msg: "AUTH: Handshake successful. Agent authorization level: PROMETHEUS.", type: "SECURITY" },
        { msg: "READY: Tactical Log Stream synchronized and operational.", type: "SUCCESS" }
    ];
    
    bootSequence.forEach((log, i) => {
        setTimeout(() => {
            pushLog(log.msg, log.type);
        }, i * 150);
    });
}

function showMistakeFlash(msg) {
    const f = document.getElementById('mistake-flash'), t = document.getElementById('mistake-text');
    if (f && t) { t.textContent = msg; f.classList.remove('opacity-0'); f.classList.add('opacity-100'); setTimeout(() => f.classList.replace('opacity-100', 'opacity-0'), 2000); }
}

function animateRecovery() {
    const t = document.getElementById('incident-status-text');
    if (t) t.textContent = 'RESOLVED';
    const d = document.getElementById('badge-dot');
    if (d) { d.classList.remove('bg-error', 'animate-pulse'); d.classList.add('bg-primary'); }
}

function finalizeEpisode() { SimState.running = false; showVictory(SimState.accumulatedReward); }

function closeVictory() {
    const overlay = document.getElementById('victory-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
    // Preserving state for Review Operation
    const statusText = document.getElementById('incident-status-text');
    if (statusText) {
        statusText.innerHTML = '<span class="text-primary tracking-widest px-2 py-0.5 border border-primary/20 bg-primary/10 rounded-sm">REVIEW MODE</span>';
    }
    console.log("Victory closed. Dashboard state preserved for review.");
}
window.closeVictory = closeVictory;

function showVictory(reward) {
    const overlay = document.getElementById('victory-overlay'), stats = document.getElementById('victory-stats');
    if (!overlay || !stats) return;
    stats.innerHTML = `<div class="p-4 bg-white/5 border border-white/10 rounded">
        <p class="text-primary font-bold uppercase">Reward: ${reward.toFixed(4)}</p>
        <p class="text-xs mt-2">Scenario: ${SCENARIOS[SimState.scenarioId].name}</p>
    </div>`;
    overlay.classList.remove('hidden');
}

// ─── Listeners ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    console.log("DASHBOARD: Initializing engine...");
    renderSquad();
    preInitLogs();
    renderIncidentLogs();

    document.getElementById('scenarios-btn')?.addEventListener('click', e => { e.preventDefault(); openScenarioPicker(); });
    document.getElementById('current-scenario-label')?.addEventListener('click', openScenarioPicker);
    
    document.getElementById('speed-slider')?.addEventListener('input', e => {
        SimState.speed = parseInt(e.target.value);
        document.getElementById('speed-display').textContent = `${(SimState.speed/1000).toFixed(1)}s`;
    });
});

function renderResources() { console.log("Rendering Resources Module..."); }
function renderIncidentLogs() { 
    console.log("Rendering Incident Logs Module..."); 
    const container = document.getElementById('log-container');
    if (!container) return;
    
    container.innerHTML = '';
    if (SimState.logs.length === 0) {
        container.innerHTML = `<div class="flex items-center justify-center h-full opacity-30 text-xs uppercase tracking-widest italic">Awaiting Log Stream...</div>`;
        return;
    }

    SimState.logs.forEach(log => {
        container.appendChild(createLogElement(log));
    });
    container.scrollTop = container.scrollHeight;
}
function initFirewallMonitor() { console.log("Firewall Monitor Active."); }
