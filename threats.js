/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KINETIC COMMAND | Threat Analysis Module
 * Simulates incoming threats, updates stats, risk level, and visual logs.
 * ═══════════════════════════════════════════════════════════════════════════
 */

let threatInterval = null;
let totalThreatsDetected = 0;
let activeAnomalies = 0;

const THREAT_TYPES = [
    { name: "SQL Injection Probe", severity: "warning", type: "DB" },
    { name: "DDoS Origin Ping", severity: "critical", type: "NET" },
    { name: "Unauthorized SSH Attempt", severity: "warning", type: "AUTH" },
    { name: "Malware Signature Detected", severity: "critical", type: "SEC" },
    { name: "High Rate API Polling", severity: "safe", type: "API" },
    { name: "Anomalous Endpoint Access", severity: "warning", type: "APP" },
];

function initThreatModule() {
    if (threatInterval) return; // Already running
    
    // Initial stats
    updateThreatStats();
    
    // Simulate incoming threats
    threatInterval = setInterval(() => {
        // Randomly decide if a new threat appears this tick (approx 60% chance)
        if (Math.random() > 0.4) {
            triggerNewThreat();
        }
        
        // Randomly resolve an anomaly (20% chance)
        if (activeAnomalies > 0 && Math.random() > 0.8) {
            activeAnomalies--;
            updateThreatStats();
        }
    }, 3000);
}

function triggerNewThreat() {
    totalThreatsDetected++;
    activeAnomalies++;
    
    const threatDef = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
    const logList = document.getElementById('threat-log-list');
    
    if (!logList) return;
    
    // Clear placeholder if it exists (first threat)
    if (totalThreatsDetected === 1) {
        logList.innerHTML = '';
    }
    
    const entry = document.createElement('div');
    
    // Severity styling mapping
    const sevMap = {
        'critical': { colorText: 'text-error', bgColor: 'bg-error/10', borderColor: 'border-error/30', label: 'CRITICAL' },
        'warning': { colorText: 'text-tertiary-dim', bgColor: 'bg-tertiary-dim/10', borderColor: 'border-tertiary-dim/30', label: 'WARNING' },
        'safe': { colorText: 'text-primary', bgColor: 'bg-primary/10', borderColor: 'border-primary/30', label: 'SAFE' } // Green
    };
    
    const style = sevMap[threatDef.severity];
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });

    entry.className = `flex justify-between items-center p-3 rounded-lg border ${style.borderColor} ${style.bgColor} animate-slideIn`;
    entry.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 rounded-full ${style.colorText.replace('text', 'bg')} shadow-[0_0_8px_currentColor]"></span>
            <div>
                <p class="text-[11px] font-bold text-on-surface uppercase">${threatDef.name}</p>
                <p class="text-[9px] font-mono text-on-surface-variant">VECTOR: <span class="${style.colorText}">${threatDef.type}</span></p>
            </div>
        </div>
        <div class="text-right flex flex-col items-end gap-1">
            <span class="text-[9px] font-black tracking-widest ${style.colorText}">${style.label}</span>
            <span class="text-[8px] opacity-60 font-mono">${timestamp}</span>
        </div>
    `;
    
    logList.prepend(entry);
    
    // Keep max 20 logs
    if (logList.children.length > 20) {
        logList.lastElementChild.remove();
    }
    
    updateThreatStats();
    visualizeGraph(threatDef.severity);
}

function updateThreatStats() {
    const totalEl = document.getElementById('threat-total-count');
    const anomaliesEl = document.getElementById('threat-anomalies-count');
    const riskLevelEl = document.getElementById('threat-risk-level');
    
    if (totalEl) totalEl.textContent = totalThreatsDetected;
    if (anomaliesEl) anomaliesEl.textContent = activeAnomalies;
    
    if (riskLevelEl) {
        if (activeAnomalies > 5) {
            riskLevelEl.textContent = 'HIGH';
            riskLevelEl.className = 'text-4xl font-mono font-black text-error drop-shadow-[0_0_12px_rgba(255,113,108,0.4)]';
        } else if (activeAnomalies > 2) {
            riskLevelEl.textContent = 'MEDIUM';
            riskLevelEl.className = 'text-4xl font-mono font-black text-tertiary-dim drop-shadow-[0_0_12px_rgba(236,226,137,0.4)]';
        } else {
            riskLevelEl.textContent = 'LOW';
            riskLevelEl.className = 'text-4xl font-mono font-black text-primary drop-shadow-[0_0_12px_rgba(142,255,113,0.4)]';
        }
    }
}

// Simple visual "graph" using dom elements rising up
function visualizeGraph(severity) {
    const graphContainer = document.getElementById('threat-graph-bars');
    if (!graphContainer) return;
    
    const styles = {
        'critical': { bg: 'bg-error', glow: 'shadow-[0_0_10px_rgba(255,113,108,0.6)] animate-pulse-red' },
        'warning': { bg: 'bg-tertiary-dim', glow: 'shadow-[0_0_10px_rgba(236,226,137,0.4)]' },
        'safe': { bg: 'bg-primary', glow: '' }
    };
    
    const height = Math.floor(Math.random() * 60) + 20; // 20% to 80%
    if (severity === 'critical') height += 20; // make criticals taller
    
    const bar = document.createElement('div');
    bar.className = `w-4 rounded-t-sm ${styles[severity].bg} ${styles[severity].glow} transition-all duration-500`;
    bar.style.height = '0%';
    
    graphContainer.appendChild(bar);
    
    // Animate to full height
    setTimeout(() => {
        bar.style.height = `${Math.min(100, height)}%`;
    }, 50);
    
    if (graphContainer.children.length > 15) {
        graphContainer.firstElementChild.remove();
    }
}
