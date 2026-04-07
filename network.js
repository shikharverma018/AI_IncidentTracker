/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KINETIC COMMAND | Network Scanner Module
 * Handles subnet scanning, progress animation, terminal logs, and results rendering
 * ═══════════════════════════════════════════════════════════════════════════
 */

let scanInterval = null;
let logInterval = null;

function startNetworkScan() {
    const btn = document.getElementById('btn-run-scan');
    const progressContainer = document.getElementById('scan-progress-container');
    const progressBar = document.getElementById('scan-progress-bar');
    const percentageText = document.getElementById('scan-percentage');
    const resultsList = document.getElementById('scan-results-list');

    if (!btn || !progressContainer || !progressBar || !resultsList) return;

    // Reset UI
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> Scanning...';
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    percentageText.textContent = '0%';
    
    // Create animated terminal area alongside results placeholder
    resultsList.innerHTML = `
        <div class="h-full flex flex-col pt-4">
            <h4 class="text-[10px] font-bold text-on-surface-variant uppercase mb-2 border-b border-outline-variant/20 pb-2">Scanner Logs</h4>
            <div id="network-terminal" class="bg-surface-lowest text-primary font-mono text-[10px] p-4 rounded-lg flex-grow overflow-y-auto custom-scrollbar border border-primary/20 bg-black shadow-[inset_0_0_10px_rgba(142,255,113,0.1)]">
                <div class="opacity-70">> Initialization sequence started...</div>
            </div>
        </div>
    `;

    const terminalLogs = [
        "> Subnet detected: 192.168.1.0/24",
        "> Establishing probe streams...",
        "> Scanning 192.168.1.1...",
        "> Gateway Active. Checking ports...",
        "> Port 80 OPEN",
        "> Port 443 OPEN",
        "> Scanning 192.168.1.45...",
        "> Device signature: Workstation",
        "> Port 3389 OPEN - WARN: RDP exposed",
        "> Port 445 OPEN",
        "> Scanning 192.168.1.102...",
        "> Database signature detected",
        "> Scanning 192.168.1.254...",
        "> Firewall appliance identified",
        "> Scanning 10.0.4.12...",
        "> Legacy API endpoint reached",
        "> Aggregating scan reports..."
    ];

    let terminalIdx = 0;
    const terminal = document.getElementById('network-terminal');
    
    if (logInterval) clearInterval(logInterval);
    logInterval = setInterval(() => {
        if (terminalIdx < terminalLogs.length) {
            const entry = document.createElement('div');
            entry.className = "mb-1";
            entry.textContent = terminalLogs[terminalIdx];
            terminal.appendChild(entry);
            terminal.scrollTop = terminal.scrollHeight;
            terminalIdx++;
        }
    }, 280);

    let progress = 0;
    if (scanInterval) clearInterval(scanInterval);

    scanInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(scanInterval);
            clearInterval(logInterval);
            
            setTimeout(() => {
                finalizeScan(btn, resultsList);
            }, 600); // short delay after hitting 100%
        }
        progressBar.style.width = `${progress}%`;
        percentageText.textContent = `${progress}%`;
    }, 150);
}

function finalizeScan(btn, resultsList) {
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined text-sm">wifi_tethering</span> Run Full Scan';

    const mockNodes = [
        { ip: '192.168.1.1', type: 'Gateway', status: 'Secure', ports: '80, 443' },
        { ip: '192.168.1.45', type: 'Workstation', status: 'Vulnerable', ports: '3389, 445' },
        { ip: '192.168.1.102', type: 'DB Cluster', status: 'Secure', ports: '5432' },
        { ip: '192.168.1.254', type: 'Firewall', status: 'Secure', ports: '22, 441' },
        { ip: '10.0.4.12', type: 'Legacy API', status: 'At Risk', ports: '8080' }
    ];

    resultsList.innerHTML = `
        <div class="space-y-3 pt-4">
            <h4 class="text-[10px] font-bold text-on-surface-variant uppercase mb-4 border-b border-outline-variant/20 pb-2">Identified Network Nodes (${mockNodes.length})</h4>
            <div id="scan-node-list"></div>
        </div>
    `;

    const nodeList = document.getElementById('scan-node-list');
    
    mockNodes.forEach((node, index) => {
        setTimeout(() => {
            const glowClass = node.status === 'Secure' ? 'shadow-[0_0_10px_rgba(142,255,113,0.1)]' : (node.status === 'Vulnerable' ? 'shadow-[0_0_15px_rgba(255,113,108,0.3)] animate-pulse-red' : 'shadow-[0_0_10px_rgba(236,226,137,0.2)]');
            const item = document.createElement('div');
            item.className = `scan-item flex justify-between items-center ${node.status === 'Secure' ? 'border-[#8eff71]' : (node.status === 'Vulnerable' ? 'border-[#ff716c]' : 'border-[#ece289]')} transition-all hover:bg-surface-highest mb-3 opacity-0 translate-y-4 duration-500 ease-out ${glowClass}`;
            
            item.innerHTML = `
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="ip-badge">${node.ip}</span>
                        <span class="text-[10px] font-bold text-white uppercase">${node.type}</span>
                    </div>
                    <p class="text-[9px] text-on-surface-variant uppercase">Open Ports: <span class="font-mono text-primary">${node.ports}</span></p>
                </div>
                <div class="text-right">
                    <span class="text-[9px] font-black uppercase ${node.status === 'Secure' ? 'text-primary' : (node.status === 'Vulnerable' ? 'text-error' : 'text-tertiary-dim')}">${node.status}</span>
                    <p class="text-[8px] text-on-surface-variant mt-0.5">LATENCY: ${Math.floor(Math.random() * 40) + 5}ms</p>
                </div>
            `;
            nodeList.appendChild(item);
            
            // Trigger animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    item.classList.remove('opacity-0', 'translate-y-4');
                });
            });
        }, index * 400); // 400ms stagger between each node
    });
}
